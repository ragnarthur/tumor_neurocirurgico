# Documento de Apresentação - Neuro MVP
## Classificação de Tumores em RM Cerebral

**Data da Apresentação:** Terça-feira, 27/01/2026  
**Versão:** 1.0 Beta  
**Status:** Protótipo MVP

---

## 📋 Índice

1. [Resumo Executivo](#resumo-executivo)
2. [Objetivo da Apresentação](#objetivo-da-apresentação)
3. [Arquitetura do Sistema](#arquitetura-do-sistema)
4. [Métricas do Modelo](#métricas-do-modelo)
5. [Funcionalidades Implementadas](#funcionalidades-implementadas)
6. [Roteiro da Demo](#roteiro-da-demo)
7. [Limitações Atuais](#limitações-atuais)
8. [Próximos Passos Propostos](#próximos-passos-propostos)
9. [Perguntas para o Médico](#perguntas-para-o-médico)
10. [Contato e Equipe](#contato-e-equipe)

---

## 1. Resumo Executivo

### O que é o Neuro MVP?

Um **sistema de suporte diagnóstico em neuroimagem** baseado em inteligência artificial para classificação de tumores cerebrais em ressonância magnética (RM).

### O que ele faz?

- **Upload de imagem** RM cerebral (JPG/PNG)
- **Classificação automática** em 4 categorias:
  - Glioma
  - Meningioma
  - Tumor hipofisário (Pituitary)
  - Saudável (No tumor)
- **Probabilidades por classe** com confiança
- **Interpretação clínica assistiva**

### O que ele NÃO faz?

- ❌ Diagnóstico médico
- ❌ Substitui avaliação clínica
- ❌ Foi validado clinicamente
- ❌ É um dispositivo médico

### Status Atual

**🟢 PRODUTOSO** - Sistema funcional com 96.5% de acurácia no dataset de teste.

---

## 2. Objetivo da Apresentação

### Objetivo Principal

Demonstrar a **viabilidade técnica e funcional** de um sistema de IA aplicado à neuroimagem, com foco em:

- Mostrar o fluxo completo: Upload → Resultado → Interpretação
- Validar se a saída faz sentido para o especialista
- Coletar requisitos e restrições para a fase 2

### O que esperamos extrair

1. **Validação clínica**: As classes, probabilidades e interpretação clínica fazem sentido?
2. **Uso real**: Como você usaria na prática? (triagem, ensino, pesquisa, segunda opinião)
3. **Recorte clínico**: Qual seria o foco na fase 2? (tumor vs não-tumor, subtipo, segmentação, graduação)
4. **Restrições técnicas**: Onde rodaria? (local, nuvem, hospital), latência aceitável
5. **Governança**: LGPD, consentimento, termo de uso, logs, auditoria

---

## 3. Arquitetura do Sistema

### Stack Tecnológico

**Frontend:**
- React 19.2.0 + TypeScript
- Vite 7.2.4
- Tailwind CSS 3.4.17
- shadcn/ui (Radix UI)
- Framer Motion (animações)
- Sonner (toasts)

**Backend:**
- Django 5.x
- Django Rest Framework
- Python 3.11

**Modelo:**
- PyTorch
- Timm (PyTorch Image Models)
- ResNet18 (4.3M parâmetros)
- Transfer Learning

### Fluxo de Dados

```
┌─────────────┐    HTTP POST    ┌──────────────┐
│   React     │ ───────────────→ │  FastAPI/Django │
│   Frontend  │                  │   Backend      │
└─────────────┘                  └────────┬───────┘
                                           │
                                           ↓
                                    ┌─────────────┐
                                    │  PyTorch    │
                                    │   Modelo     │
                                    │  ResNet18   │
                                    └─────────────┘
                                           │
                                           ↓
                                    ┌─────────────┐
                                    │  Response   │
                                    │   JSON      │
                                    │  (class,    │
                                    │   probs)    │
                                    └─────────────┘
```

### Endpoint API

**POST** `/api/predict/`

**Request:**
- `file`: Imagem JPG/PNG (multipart/form-data)

**Response:**
```json
{
  "predicted_class": "glioma",
  "probs": {
    "glioma": 0.83,
    "meningioma": 0.10,
    "pituitary": 0.04,
    "no_tumor": 0.03
  },
  "disclaimer": "Protótipo educacional/pesquisa..."
}
```

---

## 4. Métricas do Modelo

### Performance do Treino

| Métrica | Valor |
|---------|-------|
| **Melhor Epoch** | 19 |
| **Accuracy** | **96.51%** |
| **F1-Score (macro)** | **96.39%** |
| **Melhoria Total** | +36.97% |
| **Dataset** | 7,023 imagens |
| **Classes** | 4 |

### Progressão do Treino

| Epoch | Accuracy | F1-Score |
|-------|----------|----------|
| 1 | 70.46% | 68.68% |
| 5 | 85.55% | 84.92% |
| 10 | 66.48% | 56.54% |
| 15 | 96.30% | 96.18% |
| **19 (MELHOR)** | **96.51%** | **96.39%** |
| 20 | 96.51% | 96.37% |

### Estabilidade

- **Média últimas 5 epochs**: 96.10% accuracy
- **Range das últimas 5**: 1.28% (muito estável)
- **Convergência**: Atingida após 20 epochs

### Comparação com State-of-the-Art

| Modelo | Accuracy | F1-Score | Dataset |
|--------|----------|----------|---------|
| Xception (PMC 2025) | 98.73% | - | Brain Tumor MRI |
| EfficientNet-B3 | 99.23% | - | Brain Tumor MRI |
| **ResNet18 (nosso)** | **96.51%** | **96.39%** | Brain Tumor MRI |

**Conclusão:** Nosso modelo tem **performance competitiva** com SOTA, usando uma arquitetura mais leve (ResNet18 vs EfficientNet-B3).

---

## 5. Funcionalidades Implementadas

### Frontend (React + Tailwind + shadcn/ui)

| Funcionalidade | Status | Descrição |
|---------------|--------|-----------|
| ✅ Upload de imagens | Implementado | JPG/PNG |
| ✅ Casos de exemplo | Implementado | 4 imagens prontas para demo |
| ✅ Preview da imagem | Implementado | Visualização antes da análise |
| ✅ Loading states | Implementado | Spinner + overlay |
| ✅ Toast notifications | Implementado | Sucesso/erro com Sonner |
| ✅ Resultados | Implementado | Classe + probs + tempo |
| ✅ Interpretância clínica | Implementado | Tabs com análise detalhada |
| ✅ Histórico de análises | Implementado | Últimas 10 análises (localStorage) |
| ✅ Responsividade | Implementado | Mobile-first (3 breakpoints) |
| ✅ Animações suaves | Implementado | Framer Motion |
| ✅ Design System | Implementado | Tailwind + shadcn/ui |

### Backend (Django + FastAPI)

| Funcionalidade | Status | Descrição |
|---------------|--------|-----------|
| ✅ Endpoint `/api/predict/` | Implementado | Classificação de imagens |
| ✅ Endpoint `/api/health/` | Implementado | Health check |
| ✅ CORS | Configurado | Permite requests do frontend |
| ✅ PyTorch Integration | Implementado | Modelo ResNet18 |
| ✅ Data Augmentation | Implementado | Flip, rotation, jitter |
| ✅ Class Weights | Implementado | Balanceamento automático |
| ✅ Early Stopping | Implementado | Patience = 5 epochs |
| ✅ ReduceLROnPlateau | Implementado | Scheduler dinâmico |

### Modelo (PyTorch + ResNet18)

| Funcionalidade | Status | Descrição |
|---------------|--------|-----------|
| ✅ Transfer Learning | Implementado | ResNet18 pré-treinado |
| ✅ Fine-tuning | Implementado | Camadas finais ajustadas |
| ✅ Stratified Split | Implementado | Balanceamento de classes |
| ✅ Data Augmentation | Implementado | 3 transformações |
| ✅ Grad-CAM (removido) | Não usado | A pedido do usuário |

---

## 6. Roteiro da Demo

### Duração Estimada: 10-15 minutos

#### **Parte 1: Introdução (2 minutos)**

1. **Apresentar o sistema:**
   - "Este é o Neuro MVP, um protótipo de suporte diagnóstico em neuroimagem"
   - "Não é dispositivo médico, nem substitui avaliação clínica"
   - "Baseado em ResNet18 treinado em 7,023 imagens de RM cerebral"

2. **Mostrar a interface:**
   - Navegar pelo frontend
   - Mostrar o design limpo e profissional

#### **Parte 2: Casos de Exemplo (5 minutos)**

3. **Demonstrar com 3 exemplos pré-definidos:**

   **Exemplo 1: Glioma**
   - Clicar no botão "Glioma"
   - Ver loading states
   - Ver resultado: "Glioma" com ~83% de confiança
   - Ver probabilidades por classe
   - Ver interpretação clínica

   **Exemplo 2: Meningioma**
   - Repetir processo
   - Ver resultado: "Meningioma" com confiança alta
   - Ver diferença top-1 vs top-2

   **Exemplo 3: Saudável (No tumor)**
   - Repetir processo
   - Ver resultado: "Saudável"
   - Mostrar que o modelo reconhece casos sem tumor

4. **Mostrar o histórico:**
   - Ver as 3 análises salvas automaticamente
   - Explicar persistência no localStorage

#### **Parte 3: Perguntas e Feedback (5 minutos)**

5. **Coletar feedback:**
   - "O resultado faz sentido clínico?"
   - "As probabilidades são úteis?"
   - "A interpretação clínica está clara?"
   - "Como você usaria na prática?"
   - "O que precisaria mudar para usar no dia a dia?"

6. **Extrair requisitos:**
   - Usar o roteiro de perguntas (seção 9)

#### **Parte 4: Encerramento (2 minutos)**

7. **Revisão dos próximos passos:**
   - Apresentar limitações atuais
   - Propor plano para fase 2
   - Marcar follow-up se necessário

---

## 7. Limitações Atuais

### Limitações Técnicas

| Limitação | Impacto | Plano de Mitigação |
|-----------|---------|-------------------|
| Dataset público | ❌ Não é o hospital | Fase 2: Treinar com dados reais |
| Sem validação clínica | ❌ Não testado por especialistas | Fase 2: Validação com radiologistas |
| Apenas classificação | ❌ Sem segmentação | Fase 2: Adicionar segmentação |
| Apenas 2D | ❌ Não usa 3D | Fase 2: Avaliar volumes 3D |
| Sem DICOM | ❌ Apenas JPG/PNG | Fase 2: Suporte a DICOM/PACS |

### Limitações Clínicas

| Limitação | Impacto | Observação |
|-----------|---------|------------|
| Não é dispositivo médico | 🔴 | Protótipo educacional apenas |
| Não faz diagnóstico | 🔴 | Apenas suporte assistivo |
| Não foi validado | 🟡 | Precisa de validação clínica |
| Apenas 4 classes | 🟡 | Pode ser expandido para subtipos |
| Sem métricas adicionais | 🟡 | Apenas accuracy e F1 |

### Limitações Legais

| Limitação | Impacto | Observação |
|-----------|---------|------------|
| LGPD | 🔴 | Precisa de anonimização de dados |
| Termo de uso | 🟡 | Precisa ser criado e assinado |
| Logs de auditoria | 🟡 | Precisa ser implementado |
| Consentimento | 🔴 | Precisa ser obtido do paciente |

---

## 8. Próximos Passos Propostos

### Fase 2: Validação Clínica (1-2 meses)

**Objetivo:** Validar o modelo com dados reais do hospital

**Atividades:**
1. ✅ Coletar dataset real do hospital (com consentimento)
2. ✅ Anonimizar dados (LGPD)
3. ✅ Treinar modelo em dataset real
4. ✅ Validar com radiologistas/neurocirurgiões
5. ✅ Calcular métricas clínicas (sensibilidade, especificidade, AUC)

**Entregáveis:**
- Modelo treinado em dados reais
- Relatório de validação clínica
- Matriz de confusão detalhada por classe

### Fase 3: Expansão de Funcionalidades (2-3 meses)

**Objetivo:** Adicionar features avançadas

**Atividades:**
1. ✅ Suporte a DICOM/PACS
2. ✅ Segmentação de tumores (contorno)
3. ✅ Classificação de subtipos
4. ✅ Graduação de tumores
5. ✅ Comparação temporal (estudos anteriores)

**Entregáveis:**
- Sistema integrado ao PACS
- Ferramenta de segmentação
- Relatórios clínicos automatizados

### Fase 4: Deploy em Produção (1-2 meses)

**Objetivo:** Sistema pronto para uso no hospital

**Atividades:**
1. ✅ Deploy em nuvem (AWS/GCP/Azure)
2. ✅ Implementar LGPD completa
3. ✅ Criar termo de uso e consentimento
4. ✅ Implementar logs de auditoria
5. ✅ Criar painel de administração

**Entregáveis:**
- Sistema em produção
- Documentação legal completa
- Treinamento de usuários

---

## 9. Perguntas para o Médico

### 1. Momento de Uso

**Pergunta:** Qual seria o momento de uso ideal na rotina clínica?

**Opções:**
- Triagem inicial de pacientes
- Pré-consulta para preparar exames
- Ensino e treinamento de residentes
- Pesquisa clínica
- Segunda opinião diagnóstica
- Outro

---

### 2. Tumores de Interesse

**Pergunta:** Quais tumores/interesses são mais relevantes para sua prática?

**Opções:**
- Glioma (todos os tipos)
- Meningioma
- Tumores hipofisários (Pituitary)
- Metástases
- Outros tipos específicos

---

### 3. Funcionalidades Necessárias

**Pergunta:** Além da classificação, quais funcionalidades seriam úteis?

**Opções:**
- Segmentação (contorno do tumor)
- Classificação de subtipos
- Graduação (agressividade do tumor)
- Volume do tumor
- Comparação temporal (progressão)
- Integração com PACS/RIS
- Relatórios clínicos automatizados

---

### 4. Formato de Dados

**Pergunta:** Em qual padrão os dados reais do hospital estão?

**Opções:**
- DICOM (formato padrão de RM)
- PACS integrado
- Arquivos JPEG/PNG (exportados do PACS)
- Laudos em PDF
- Outro formato

---

### 5. Usuários do Sistema

**Pergunta:** Quem são os principais usuários deste sistema?

**Opções:**
- Médicos radiologistas
- Neurocirurgiões
- Residentes
- Enfermeiros
- Estudantes
- Outro profissional

---

### 6. Riscos Preocupantes

**Pergunta:** Quais são os riscos que mais o preocupa no uso de IA clínica?

**Opções:**
- Falso negativo (tumor não detectado)
- Falso positivo (tumor detectado onde não existe)
- Alarme excessivo
- Confiança excessiva no sistema
- Erros de interpretação
- Responsabilidade profissional

---

### 7. Métricas Aceitáveis

**Pergunta:** Quais métricas você considera mínimas para uso clínico?

**Opções:**
- Sensibilidade (recall) > 90% / 95% / 99%?
- Especificidade (precision) > 90% / 95% / 99%?
- AUC-ROC > 0.9 / 0.95 / 0.99?
- Tempo de inferência < 1s / 3s / 10s?

---

### 8. Governança e LGPD

**Pergunta:** Como devemos abordar a governança de dados no hospital?

**Opções:**
- Anonimização obrigatória
- Consentimento explícito do paciente
- Termo de uso institucional
- Logs de auditoria de todas as consultas
- Retenção de dados por período definido
- Outro requisito

---

### 9. Infraestrutura

**Pergunta:** Onde o sistema rodaria na prática?

**Opções:**
- Local (dentro do hospital)
- Nuvem (AWS, GCP, Azure)
- Híbrido (cache local, nuvem para processamento)
- Outra opção

---

### 10. Integrações Necessárias

**Pergunta:** Com quais sistemas o Neuro MVP precisaria se integrar?

**Opções:**
- PACS (Picture Archiving and Communication System)
- RIS (Radiology Information System)
- Prontuário eletrônico
- Sistema de laudos
- Sistema de agendamento
- Outro sistema

---

## 10. Contato e Equipe

### Equipe de Desenvolvimento

| Função | Nome | Email |
|--------|------|-------|
| Desenvolvedor Frontend | [Nome] | [Email] |
| Desenvolvedor Backend | [Nome] | [Email] |
| Engenheiro de ML | [Nome] | [Email] |
| Especialista em UX/UI | [Nome] | [Email] |

### Repositório do Projeto

- **GitHub:** [Link do repositório]
- **Documentação:** [Link da documentação]
- **Issues:** [Link para issues]

### Versão Atual

- **Frontend:** v1.0.0-beta
- **Backend:** v1.0.0-beta
- **Modelo:** ResNet18 (Epoch 19)
- **Data de Lançamento:** 23/01/2026

### Licença

- **Código:** MIT License
- **Modelo:** Uso educacional e de pesquisa apenas
- **Dataset:** Uso conforme licença do Kaggle

---

## Agradecimento

Agradecemos sua presença nesta apresentação e seu feedback será fundamental para o desenvolvimento da fase 2 do Neuro MVP.

---

## Anexos

### Anexo 1: Estrutura de Pastas

```
neuro-mvp/
├── backend/
│   ├── api/
│   │   ├── views.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   └── utils/
│   │       ├── ml.py
│   │       └── __init__.py
│   ├── backend/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── models/
│   │   └── best.pt (43MB)
│   ├── requirements.txt
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── UploadCard.tsx
│   │   │   ├── PreviewCard.tsx
│   │   │   ├── ResultCard.tsx
│   │   │   ├── HistorySection.tsx
│   │   │   └── ui/ (shadcn/ui)
│   │   ├── hooks/
│   │   │   ├── useAnalysis.ts
│   │   │   └── useHistory.ts
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   ├── types.ts
│   │   │   ├── storage.ts
│   │   │   ├── constants.ts
│   │   │   ├── samples.ts
│   │   │   ├── helpers.ts
│   │   │   └── utils.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   │   └── samples/ (4 imagens)
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
├── data/
│   ├── glioma/ (1,621 imagens)
│   ├── meningioma/ (1,645 imagens)
│   ├── no_tumor/ (2,000 imagens)
│   └── pituitary/ (1,757 imagens)
├── models/
│   └── best.pt (43MB)
├── src/
│   └── train.py
└── prompt_agente_neuro_mvp_front_regras_negocio_v2.md
```

### Anexo 2: Exemplo de Response da API

```json
{
  "predicted_class": "glioma",
  "probs": {
    "glioma": 0.834567,
    "meningioma": 0.103234,
    "pituitary": 0.038901,
    "no_tumor": 0.023298
  },
  "disclaimer": "Protótipo educacional/pesquisa. Não é dispositivo médico e não deve ser usado para diagnóstico."
}
```

---

**Fim do Documento de Apresentação**
