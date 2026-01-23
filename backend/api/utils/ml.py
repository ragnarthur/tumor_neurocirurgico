import base64
from io import BytesIO
from typing import Dict, Tuple

import numpy as np
import torch
import torch.nn.functional as F
import timm
from PIL import Image
from torchvision import transforms
from pytorch_grad_cam import ScoreCAM
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget


def build_transforms(image_size: int, mean: list[float], std: list[float]) -> transforms.Compose:
    return transforms.Compose(
        [
            transforms.Resize((image_size, image_size)),
            transforms.ToTensor(),
            transforms.Normalize(mean=mean, std=std),
        ]
    )


def load_model(
    model_path: str,
) -> tuple[torch.nn.Module, list[str], int, list[float], list[float], str]:
    checkpoint = torch.load(model_path, map_location="cpu")
    arch = checkpoint["arch"]
    model = timm.create_model(
        arch,
        pretrained=False,
        num_classes=checkpoint["num_classes"],
    )
    model.load_state_dict(checkpoint["model_state"])
    model.eval()
    image_size = checkpoint.get("image_size", 224)
    mean = checkpoint.get("normalize_mean", [0.485, 0.456, 0.406])
    std = checkpoint.get("normalize_std", [0.229, 0.224, 0.225])
    return model, checkpoint["classes"], image_size, mean, std, arch


def resolve_target_layer(model: torch.nn.Module, arch: str) -> torch.nn.Module:
    # Prefer known last convolutional blocks for common architectures
    if arch.startswith("resnet") and hasattr(model, "layer4"):
        return model.layer4[-1]
    if arch.startswith("efficientnet") and hasattr(model, "conv_head"):
        return model.conv_head
    if hasattr(model, "features"):
        return model.features[-1]
    # Fallback: last Conv2d in the model
    for module in reversed(list(model.modules())):
        if isinstance(module, torch.nn.Conv2d):
            return module
    raise RuntimeError("No Conv2d layer found for Grad-CAM.")


def predict(
    model: torch.nn.Module,
    classes: list[str],
    image_size: int,
    mean: list[float],
    std: list[float],
    image: Image.Image,
) -> Tuple[str, Dict[str, float], torch.Tensor]:
    transform = build_transforms(image_size, mean, std)
    input_tensor = transform(image).unsqueeze(0)

    with torch.no_grad():
        logits = model(input_tensor)
        probs = F.softmax(logits, dim=1).cpu().numpy()[0]

    probs_dict = {classes[i]: float(probs[i]) for i in range(len(classes))}
    predicted_class = classes[int(np.argmax(probs))]
    return predicted_class, probs_dict, input_tensor.squeeze(0)


def generate_heatmap(
    model: torch.nn.Module,
    input_tensor: torch.Tensor,
    image: Image.Image,
    class_index: int,
    image_size: int,
    arch: str,
) -> str:
    target_layer = resolve_target_layer(model, arch)

    cam = ScoreCAM(model=model, target_layers=[target_layer])
    grayscale_cam = cam(
        input_tensor=input_tensor.unsqueeze(0),
        targets=[ClassifierOutputTarget(class_index)],
    )[0]

    cam_norm = grayscale_cam - np.min(grayscale_cam)
    cam_norm = cam_norm / (np.max(cam_norm) + 1e-8)
    cam_gray = (cam_norm * 255).astype(np.uint8)
    pil_cam = Image.fromarray(cam_gray).convert("L")
    buffer = BytesIO()
    pil_cam.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")
