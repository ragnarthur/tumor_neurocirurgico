import argparse
import logging
import os
import random
from dataclasses import dataclass
from pathlib import Path
from typing import Tuple, List

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Subset
from torchvision import datasets, transforms
import timm
from tqdm import tqdm
from sklearn.model_selection import StratifiedShuffleSplit
from sklearn.metrics import f1_score, confusion_matrix


@dataclass
class TrainConfig:
    data_dir: Path = Path('data')
    output_path: Path = Path('models/best.pt')
    image_size: int = 224
    batch_size: int = 32
    epochs: int = 20
    lr: float = 1e-4
    val_split: float = 0.2
    arch: str = 'resnet18'
    seed: int = 42
    pretrained: bool = False
    num_workers: int = 2
    weight_decay: float = 1e-4
    log_interval: int = 50
    early_stopping_patience: int = 5
    grad_clip: float = 1.0
    use_amp: bool = False
    checkpoints_dir: Path = Path('models/checkpoints')
    save_every: int = 1
    test_split: float = 0.1


def set_seed(seed: int) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)


def build_splits(cfg: TrainConfig) -> Tuple[Subset, Subset, Subset, list[str]]:
    base_dataset = datasets.ImageFolder(cfg.data_dir)
    classes = base_dataset.classes
    targets = base_dataset.targets

    splitter = StratifiedShuffleSplit(
        n_splits=1,
        test_size=cfg.test_split,
        random_state=cfg.seed,
    )
    trainval_idx, test_idx = next(splitter.split(list(range(len(targets))), targets))

    trainval_targets = [targets[i] for i in trainval_idx]
    val_relative = cfg.val_split / (1.0 - cfg.test_split)
    splitter_val = StratifiedShuffleSplit(
        n_splits=1,
        test_size=val_relative,
        random_state=cfg.seed,
    )
    train_idx_rel, val_idx_rel = next(splitter_val.split(list(range(len(trainval_targets))), trainval_targets))
    train_idx = [trainval_idx[i] for i in train_idx_rel]
    val_idx = [trainval_idx[i] for i in val_idx_rel]

    train_transform = transforms.Compose([
        transforms.Resize((cfg.image_size, cfg.image_size)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(10),
        transforms.ColorJitter(brightness=0.05, contrast=0.05),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    eval_transform = transforms.Compose([
        transforms.Resize((cfg.image_size, cfg.image_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    train_dataset = Subset(datasets.ImageFolder(cfg.data_dir, transform=train_transform), train_idx)
    val_dataset = Subset(datasets.ImageFolder(cfg.data_dir, transform=eval_transform), val_idx)
    test_dataset = Subset(datasets.ImageFolder(cfg.data_dir, transform=eval_transform), test_idx)

    return train_dataset, val_dataset, test_dataset, classes


def build_dataloader(dataset: Subset, cfg: TrainConfig, shuffle: bool) -> DataLoader:
    return DataLoader(
        dataset,
        batch_size=cfg.batch_size,
        shuffle=shuffle,
        num_workers=cfg.num_workers,
        pin_memory=True,
    )


def train_one_epoch(
    model,
    loader,
    criterion,
    optimizer,
    device,
    scaler,
    epoch: int,
    epochs: int,
    log_interval: int,
    grad_clip: float,
) -> float:
    model.train()
    running_loss = 0.0
    progress = tqdm(loader, desc=f"Train {epoch}/{epochs}", leave=False)
    for i, (images, labels) in enumerate(progress, start=1):
        images, labels = images.to(device), labels.to(device)
        optimizer.zero_grad(set_to_none=True)

        if scaler is not None:
            with torch.autocast(device_type=device.type, dtype=torch.float16):
                outputs = model(images)
                loss = criterion(outputs, labels)
            scaler.scale(loss).backward()
            if grad_clip > 0:
                scaler.unscale_(optimizer)
                nn.utils.clip_grad_norm_(model.parameters(), grad_clip)
            scaler.step(optimizer)
            scaler.update()
        else:
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            if grad_clip > 0:
                nn.utils.clip_grad_norm_(model.parameters(), grad_clip)
            optimizer.step()

        running_loss += loss.item() * images.size(0)
        if i % log_interval == 0 or i == len(loader):
            progress.set_postfix(loss=f"{loss.item():.4f}")

    return running_loss / len(loader.dataset)


def evaluate(model, loader, device, epoch: int, epochs: int) -> Tuple[float, float, List[int], List[int]]:
    model.eval()
    correct = 0
    total = 0
    all_labels: List[int] = []
    all_preds: List[int] = []

    with torch.no_grad():
        progress = tqdm(loader, desc=f"Eval {epoch}/{epochs}", leave=False)
        for images, labels in progress:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            _, preds = torch.max(outputs, 1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)
            all_labels.extend(labels.cpu().tolist())
            all_preds.extend(preds.cpu().tolist())

    acc = correct / total if total else 0.0
    f1 = f1_score(all_labels, all_preds, average='macro') if total else 0.0
    return acc, f1, all_labels, all_preds


def compute_class_weights(labels: List[int]) -> torch.Tensor:
    counts = torch.bincount(torch.tensor(labels))
    weights = 1.0 / counts.float()
    weights = weights / weights.sum() * len(counts)
    return weights


def save_checkpoint(
    model: nn.Module,
    cfg: TrainConfig,
    classes: list[str],
    epoch: int,
    val_acc: float,
    val_f1: float,
) -> None:
    cfg.checkpoints_dir.mkdir(parents=True, exist_ok=True)
    ckpt_path = cfg.checkpoints_dir / f"epoch_{epoch:03d}_acc_{val_acc:.4f}_f1_{val_f1:.4f}.pt"
    torch.save(
        {
            'arch': cfg.arch,
            'num_classes': len(classes),
            'classes': classes,
            'model_state': model.state_dict(),
            'image_size': cfg.image_size,
            'normalize_mean': [0.485, 0.456, 0.406],
            'normalize_std': [0.229, 0.224, 0.225],
            'epoch': epoch,
            'val_acc': val_acc,
            'val_f1': val_f1,
        },
        ckpt_path,
    )


def parse_args() -> TrainConfig:
    parser = argparse.ArgumentParser()
    parser.add_argument('--data-dir', default='data')
    parser.add_argument('--output', default='models/best.pt')
    parser.add_argument('--arch', default='resnet18')
    parser.add_argument('--epochs', type=int, default=20)
    parser.add_argument('--batch', type=int, default=32)
    parser.add_argument('--lr', type=float, default=1e-4)
    parser.add_argument('--val-split', type=float, default=0.2)
    parser.add_argument('--test-split', type=float, default=0.1)
    parser.add_argument('--pretrained', action='store_true')
    parser.add_argument('--num-workers', type=int, default=2)
    parser.add_argument('--weight-decay', type=float, default=1e-4)
    parser.add_argument('--log-interval', type=int, default=50)
    parser.add_argument('--early-stop', type=int, default=5)
    parser.add_argument('--grad-clip', type=float, default=1.0)
    parser.add_argument('--amp', action='store_true')
    parser.add_argument('--save-every', type=int, default=1)
    parser.add_argument('--checkpoints-dir', default='models/checkpoints')
    args = parser.parse_args()

    return TrainConfig(
        data_dir=Path(args.data_dir),
        output_path=Path(args.output),
        arch=args.arch,
        epochs=args.epochs,
        batch_size=args.batch,
        lr=args.lr,
        val_split=args.val_split,
        test_split=args.test_split,
        pretrained=args.pretrained,
        num_workers=args.num_workers,
        weight_decay=args.weight_decay,
        log_interval=args.log_interval,
        early_stopping_patience=args.early_stop,
        grad_clip=args.grad_clip,
        use_amp=args.amp,
        save_every=args.save_every,
        checkpoints_dir=Path(args.checkpoints_dir),
    )


def main() -> None:
    cfg = parse_args()

    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s | %(levelname)s | %(message)s',
    )

    set_seed(cfg.seed)

    if not cfg.data_dir.exists():
        raise FileNotFoundError(f"Data directory not found: {cfg.data_dir}")

    if torch.cuda.is_available():
        device = torch.device('cuda')
    elif torch.backends.mps.is_available():
        device = torch.device('mps')
    else:
        device = torch.device('cpu')

    logging.info("Using device: %s", device)
    logging.info(
        "Arch=%s | epochs=%s | batch=%s | pretrained=%s | val_split=%.2f | test_split=%.2f",
        cfg.arch,
        cfg.epochs,
        cfg.batch_size,
        cfg.pretrained,
        cfg.val_split,
        cfg.test_split,
    )

    train_dataset, val_dataset, test_dataset, classes = build_splits(cfg)
    train_loader = build_dataloader(train_dataset, cfg, shuffle=True)
    val_loader = build_dataloader(val_dataset, cfg, shuffle=False)
    test_loader = build_dataloader(test_dataset, cfg, shuffle=False)
    num_classes = len(classes)

    model = timm.create_model(cfg.arch, pretrained=cfg.pretrained, num_classes=num_classes)
    model.to(device)

    train_labels = [train_dataset.dataset.targets[i] for i in train_dataset.indices]
    class_weights = compute_class_weights(train_labels).to(device)

    criterion = nn.CrossEntropyLoss(weight=class_weights)
    optimizer = optim.Adam(model.parameters(), lr=cfg.lr, weight_decay=cfg.weight_decay)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='max', factor=0.5, patience=2)

    scaler = torch.cuda.amp.GradScaler() if cfg.use_amp and device.type == 'cuda' else None

    best_f1 = 0.0
    best_acc = 0.0
    epochs_no_improve = 0
    cfg.output_path.parent.mkdir(parents=True, exist_ok=True)

    logging.info("Classes: %s", classes)
    logging.info("Train size: %d | Val size: %d | Test size: %d", len(train_dataset), len(val_dataset), len(test_dataset))

    for epoch in range(cfg.epochs):
        train_loss = train_one_epoch(
            model,
            train_loader,
            criterion,
            optimizer,
            device,
            scaler,
            epoch + 1,
            cfg.epochs,
            cfg.log_interval,
            cfg.grad_clip,
        )
        val_acc, val_f1, val_labels, val_preds = evaluate(model, val_loader, device, epoch + 1, cfg.epochs)
        logging.info(
            "Epoch %d/%d - loss: %.4f - val_acc: %.4f - val_f1: %.4f",
            epoch + 1,
            cfg.epochs,
            train_loss,
            val_acc,
            val_f1,
        )

        scheduler.step(val_f1)

        if (epoch + 1) % cfg.save_every == 0:
            save_checkpoint(model, cfg, classes, epoch + 1, val_acc, val_f1)

        if val_f1 > best_f1:
            best_f1 = val_f1
            best_acc = val_acc
            epochs_no_improve = 0
            checkpoint = {
                'arch': cfg.arch,
                'num_classes': num_classes,
                'classes': classes,
                'model_state': model.state_dict(),
                'image_size': cfg.image_size,
                'normalize_mean': [0.485, 0.456, 0.406],
                'normalize_std': [0.229, 0.224, 0.225],
            }
            torch.save(checkpoint, cfg.output_path)
            cm = confusion_matrix(val_labels, val_preds)
            logging.info("Best model updated. Confusion matrix:\n%s", cm)
        else:
            epochs_no_improve += 1

        if epochs_no_improve >= cfg.early_stopping_patience:
            logging.info("Early stopping triggered after %d epochs without improvement", epochs_no_improve)
            break

    logging.info("Best val_f1: %.4f | Best val_acc: %.4f", best_f1, best_acc)
    logging.info("Saved model to: %s", cfg.output_path)

    logging.info("Running final test evaluation...")
    test_acc, test_f1, test_labels, test_preds = evaluate(model, test_loader, device, 0, 0)
    test_cm = confusion_matrix(test_labels, test_preds)
    logging.info("Test acc: %.4f | Test f1: %.4f", test_acc, test_f1)
    logging.info("Test confusion matrix:\n%s", test_cm)


if __name__ == '__main__':
    main()
