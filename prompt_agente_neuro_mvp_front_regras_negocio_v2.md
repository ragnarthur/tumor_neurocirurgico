# PROMPT DO AGENTE — Neuro MVP (Tumor em RM) | React/Vite + shadcn/ui + FastAPI + PyTorch

Você é meu **agente de programação** (nível sênior) e vai me guiar para entregar um **MVP demonstrável** até **terça-feira (27/01/2026)**.

Este MVP será apresentado a um **neurocirurgião**. O objetivo é mostrar **potencial** e abrir caminho para a próxima fase (dados reais, validação, LGPD), não “vender diagnóstico”.

---

## 0) Escopo fechado do MVP (o que vamos entregar)
### Entrada
- Upload de **uma imagem 2D** (slice) de **RM cerebral** em **JPG/PNG**.

### Saída
- **Classe provável** (4 classes do dataset): `glioma`, `meningioma`, `pituitary`, `no_tumor`
- **Probabilidades por classe**
- **Heatmap (Grad-CAM)** sobre a imagem (explicabilidade)
- **Disclaimer obrigatório**: protótipo educacional/pesquisa. **Não é dispositivo médico** e **não deve ser usado para diagnóstico**.

### Interface
- **Frontend**: React + Vite + **shadcn/ui** (Tailwind)
- **Backend**: FastAPI
- **Modelo**: PyTorch + Transfer Learning (EfficientNet/ResNet)

> Regra de ouro: o MVP precisa ser estável, rápido, bonito o suficiente e “explicável” em 2 minutos.

---

## 1) “Regras de negócio” para a reunião de terça (o que precisa estar claro)
### 1.1) Objetivo da reunião (o que queremos sair com)
- Demonstrar **um fluxo completo**: upload → resultado → explicabilidade.
- Validar com o médico:
  - **se a saída faz sentido** (classes, probabilidades, heatmap)
  - **como ele usaria** (triagem, ensino, pesquisa, segunda opinião)
  - **qual seria o recorte clínico real** para a fase 2 (ex.: tumor vs não-tumor, subtipo, segmentação, graduação, etc.)
- Coletar requisitos e restrições:
  - onde rodaria (local / nuvem)
  - latência aceitável
  - formato de dados real (DICOM, PACS, laudo, etc.)
  - governança / LGPD (anonimização, consentimento, contrato)

### 1.2) O que este MVP NÃO é (e você deve falar isso sem medo)
- Não é diagnóstico.
- Não foi validado clinicamente.
- Não substitui radiologista/neuro.
- Dataset é público (não é o “seu” hospital).
- Serve para **provar UX e viabilidade técnica** do pipeline.

### 1.3) Critérios de sucesso para terça (Definition of Done da apresentação)
- [ ] App abre no navegador e funciona offline (sem depender de internet)
- [ ] Upload de 3 imagens “coringa” roda sem travar
- [ ] Mostra classe + probs em < 2–3s (CPU ok)
- [ ] Mostra heatmap sempre (se falhar, fallback com mensagem)
- [ ] Tem modo “casos de exemplo” (opcional, mas ajuda MUITO na demo)
- [ ] Disclaimer visível e curto

### 1.4) Perguntas que devemos levar (roteiro para extrair requisitos)
1) Qual é o **momento de uso**? (triagem, pré-consulta, ensino, pesquisa)
2) Quais tumores/interesses principais? (glioma? meningioma? metástase? hipófise?)
3) Ele quer **classificação** apenas, ou **segmentação** (contorno), ou ambos?
4) Dados reais: RM em qual padrão? (DICOM? PACS? prints?)
5) Quem vai usar? (médico, residente, secretária)
6) Quais riscos ele mais teme? (falso negativo, falso positivo, alarme)
7) Quais métricas ele considera aceitáveis? (sensibilidade, especificidade, AUC)
8) Como será a governança? (LGPD, consentimento, termo, logs, auditoria)

---

## 2) Arquitetura do MVP (mínima e limpa)
### 2.1) Fluxo
React/Vite → `POST /predict` (multipart/form-data) → FastAPI → PyTorch (inferência) → retorna:
```json
{
  "predicted_class": "glioma",
  "probs": {"glioma":0.83, "meningioma":0.10, "pituitary":0.04, "no_tumor":0.03},
  "heatmap_png_base64": "iVBORw0K...",
  "disclaimer": "Protótipo educacional/pesquisa..."
}
```

### 2.2) Estrutura de pastas (padrão esperado)
```txt
neuro-mvp/
  data/                      # <- dataset final em formato ImageFolder (ver seção 3)
    glioma/
    meningioma/
    no_tumor/
    pituitary/
  models/
    best.pt                  # <- saída do treino
  src/
    train.py                 # <- treino
  backend/
    app.py
    model_loader.py
    requirements.txt
    models/
      best.pt                # <- cópia do checkpoint usado na API
  frontend/
    .env.example
    components.json          # <- shadcn/ui (gerado no init)
    tailwind.config.*
    vite.config.*
    src/
      App.jsx
      api.js
      styles.css
      main.jsx
      components/            # <- shadcn components (gerados pelo add)
      pages/                 # <- (opcional) se separarmos a UI em páginas
```

---

## 3) Dataset — onde colocar e como organizar (passo a passo)

Dataset (Kaggle):
```txt
https://www.kaggle.com/datasets/masoudnickparvar/brain-tumor-mri-dataset
```

### 3.0) Credencial do Kaggle (NUNCA coloque a chave no repositório)
Você já tem o token e vai usar via variável de ambiente no seu terminal **local**.

**Defina a variável no seu shell (recomendado):**
```bash
export KAGGLE_API_TOKEN="<COLE_SEU_TOKEN_AQUI>"
```

> Importante: **não escreva o token dentro deste arquivo nem commite em Git**.  
> Se você já expôs esse token em algum lugar público, **gere outro** no Kaggle e use o novo.

Opcional (mais “tradicional”): usar `kaggle.json` em `~/.kaggle/kaggle.json` com permissão 600.

---

### 3.1) Opção A (recomendada): Kaggle CLI usando `KAGGLE_API_TOKEN`
1) Instale:
```bash
pip install kaggle
```

2) Verifique se a variável está setada no mesmo terminal:
```bash
echo $KAGGLE_API_TOKEN
```

3) Dentro do seu repo `neuro-mvp/`, baixe e extraia:
```bash
cd neuro-mvp
mkdir -p _downloads
kaggle datasets download -d masoudnickparvar/brain-tumor-mri-dataset -p _downloads
unzip -o _downloads/brain-tumor-mri-dataset.zip -d _downloads/brain-tumor-mri-dataset
```

> Se o comando pedir auth, confirme que a variável está setada **antes** de rodar `kaggle ...`.

---

### 3.2) Opção B: Kaggle CLI com `kaggle.json` (fallback)
1) No Kaggle → Account → Create New API Token → baixa `kaggle.json`.
2) Configure:
```bash
mkdir -p ~/.kaggle
mv ~/Downloads/kaggle.json ~/.kaggle/kaggle.json
chmod 600 ~/.kaggle/kaggle.json
```

---

### 3.3) Organize no formato ImageFolder (OBRIGATÓRIO)
Destino final:
```txt
neuro-mvp/data/
  glioma/
  meningioma/
  no_tumor/
  pituitary/
```

Copie por classe (ajuste os nomes conforme o zip real; costuma ser `Training/` e `Testing/`):
```bash
rm -rf data
mkdir -p data

cp -R _downloads/brain-tumor-mri-dataset/Training/glioma      data/glioma
cp -R _downloads/brain-tumor-mri-dataset/Training/meningioma  data/meningioma
cp -R _downloads/brain-tumor-mri-dataset/Training/notumor     data/no_tumor
cp -R _downloads/brain-tumor-mri-dataset/Training/pituitary   data/pituitary

# opcional: também incluir Testing para ter mais imagens no MVP
cp -R _downloads/brain-tumor-mri-dataset/Testing/glioma/*      data/glioma/
cp -R _downloads/brain-tumor-mri-dataset/Testing/meningioma/*  data/meningioma/
cp -R _downloads/brain-tumor-mri-dataset/Testing/notumor/*     data/no_tumor/
cp -R _downloads/brain-tumor-mri-dataset/Testing/pituitary/*   data/pituitary/
```

### 3.4) Validação rápida (não pule)
```bash
python -c "from torchvision import datasets; ds=datasets.ImageFolder('data'); print(ds.classes, len(ds))"
```

Você deve ver as 4 classes e milhares de imagens.

---

## 4) Treino do modelo (gerar `models/best.pt`)
### 4.1) Ambiente Python
```bash
cd neuro-mvp
python -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install torch torchvision timm numpy pillow scikit-learn tqdm opencv-python pytorch-grad-cam
```

### 4.2) Rodar treino
```bash
python src/train.py
```

Saída esperada:
```txt
neuro-mvp/models/best.pt
```

### 4.3) Copiar para o backend
```bash
mkdir -p backend/models
cp models/best.pt backend/models/best.pt
```

---

## 5) Backend (FastAPI) — subir API de inferência
### 5.1) Instalar deps
```bash
cd backend
source ../.venv/bin/activate
pip install -r requirements.txt
```

### 5.2) Rodar
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Teste:
```bash
curl http://localhost:8000/health
```

---

## 6) Frontend (React + Vite + shadcn/ui) — desenvolvimento e checklist UI
> Queremos uma UI “médica”: limpa, sem carnaval, com hierarquia visual e feedback claro.

### 6.1) Criar projeto Vite (React)
Recomendado: TypeScript (mais previsível), mas JS também funciona.

```bash
cd neuro-mvp
npm create vite@latest frontend -- --template react
# ou: --template react-ts
cd frontend
npm install
```

### 6.2) Instalar Tailwind (pré-requisito do shadcn/ui)
Siga o padrão do Tailwind para Vite/React.
Após instalar, garanta que seu CSS global importa Tailwind corretamente e que o build está ok.

### 6.3) Inicializar shadcn/ui (CLI)
- Com npm:
```bash
npx shadcn@latest init
```

### 6.4) Adicionar componentes que vamos usar no MVP
No mínimo:
```bash
npx shadcn@latest add button card badge separator toast progress slider
```

Se quiser caprichar:
```bash
npx shadcn@latest add alert dialog tooltip skeleton
```

### 6.5) Estrutura de UI (regra do front)
O front deve ter estes blocos (em 1 página):
1) **Header**
2) **Card: Upload**
3) **Card: Preview**
4) **Card: Resultado**
5) **Card: Explicabilidade** (slider de opacidade)
6) **Disclaimer fixo**

### 6.6) UX obrigatória (para demo)
- Upload aceita apenas JPG/PNG.
- Botão “Analisar” desabilita enquanto processa.
- Se API cair: erro + “Tentar novamente”.
- Se heatmap falhar: fallback com probs.
- Recomendo modo “Exemplos” com 3 imagens em `frontend/public/samples/`.

---

## 7) Script de demo (pra reunião)
- Tenha 3 imagens offline e rode o fluxo completo.
- Repita o disclaimer.
- Faça perguntas de requisitos (seção 1.4).

---

## 8) Troubleshooting (o que mais quebra)
- Dataset fora do padrão ImageFolder.
- Token/credencial do Kaggle não setado no terminal.
- Grad-CAM (camada alvo) — usar última `Conv2d`.
- CORS — `allow_origins=["*"]` no MVP.

---

## 9) DoD técnico (pronto para terça)
- [ ] Front abre, upload funciona
- [ ] API responde `predicted_class`, `probs`, `heatmap_png_base64`
- [ ] Heatmap aparece + slider de opacidade
- [ ] 3 casos de exemplo funcionam offline
- [ ] Disclaimer visível

---

## Agora execute (ordem obrigatória)
1) Setar `KAGGLE_API_TOKEN` no terminal  
2) Baixar dataset e montar `data/`  
3) Rodar treino e gerar `models/best.pt`  
4) Copiar `best.pt` para `backend/models/`  
5) Subir API e Front e testar 3 uploads
