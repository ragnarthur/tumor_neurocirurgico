# Roteiro de Reunião — Neurocirurgia

Data sugerida: 27/01/2026

## Objetivo da reunião
- Demonstrar fluxo completo: **upload → resultado → texto clínico guiado**.
- Validar utilidade clínica percebida (triagem, ensino, pesquisa, apoio à decisão).
- Levantar requisitos para a fase 2 (dados reais, LGPD, validação).

## Escopo do MVP (deixar claro)
- Classificação em 4 classes: **glioma, meningioma, tumor de hipófise, sem tumor**.
- Dataset público (Kaggle). Sem validação clínica.
- **Não é diagnóstico** e não substitui avaliação médica.

## Métricas (treino local)
> Ajuste/valide estes valores antes da reunião
- Val acc: **0.9651**
- Val F1 (macro): **0.9637**
- Test acc: **0.9573**
- Test F1 (macro): **0.9555**

## Demonstração (passo a passo)
1. Abrir o app e mostrar o disclaimer.
2. Usar exemplos locais (4 imagens).
3. Executar inferência e mostrar resultado + texto clínico guiado.
4. Explicar limitações e próximos passos.

## Perguntas chave (para coletar requisitos)
1. Em que momento do fluxo clínico isso seria usado?
2. Classificação é suficiente ou precisa de segmentação/contorno?
3. Formato real dos dados: DICOM/PACS/prints?
4. Latência aceitável? Onde deve rodar (local vs nuvem)?
5. Quem usaria (médico, residente, equipe técnica)?
6. Principais riscos (falso negativo, falso positivo)?
7. Métricas mínimas aceitáveis?
8. Requisitos LGPD e governança?

## Próximos passos propostos
- Coleta controlada de dados reais (anonimizados).
- Validação com especialistas.
- Integração com PACS/DICOM.
- Ajuste do escopo clínico (classes/segmentação).

## Mensagem final (para fechar)
"Este é um protótipo educacional que comprova viabilidade técnica e UX.
A próxima fase depende de dados reais, validação clínica e governança LGPD."
