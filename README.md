# Plataforma de Suporte Diagnóstico em Neuroimagem

![status](https://img.shields.io/badge/status-MVP-informational)
![python](https://img.shields.io/badge/python-3.10%2B-blue)
![node](https://img.shields.io/badge/node-18%2B-green)
![license](https://img.shields.io/badge/license-internal-lightgrey)

MVP educacional para avaliação assistiva de RM cerebral com classificação de tumores, probabilidades e texto clínico guiado. **Não é dispositivo médico** e **não deve ser usado para diagnóstico**.

## Visão geral
- **Entrada:** imagem 2D (JPG/PNG) de RM cerebral
- **Saída:** classe provável, probabilidades e sumário clínico assistivo
- **Stack:** Django + DRF (backend) e React/Vite + TypeScript (frontend)

## Estrutura do repositório
```
backend/    # Django + DRF (API de inferência)
frontend/   # React + Vite + TypeScript
src/        # Treino (PyTorch)
```

## Requisitos
- Python 3.10+
- Node 18+

## Configuração do ambiente
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

## Treinamento do modelo
O treino gera o arquivo `models/best.pt`.

```bash
source .venv/bin/activate
python src/train.py
```

Copie o modelo para o backend:
```bash
cp models/best.pt backend/models/best.pt
```

## Backend (Django)
```bash
cd backend
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Endpoints:
- `GET /api/health/`
- `POST /api/predict/` (multipart/form-data com `file`)

## Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

Configuração da API (frontend/.env):
```
VITE_API_BASE=http://localhost:8000/api
```

## Roadmap
- [ ] Refinar métricas e relatório clínico
- [ ] Modo demo com casos anotados
- [ ] Logging/auditoria básica de inferências
- [ ] Pipeline de validação com dados reais
- [ ] Compliance LGPD e governança de dados

## Observações importantes
- O modelo é treinado em dataset público do Kaggle.
- Este MVP é **educacional** e não possui validação clínica.
- Para demo, exemplos estão em `frontend/public/samples/`.

## Licença
Uso interno/prova de conceito.
