export const DISCLAIMER =
  "Protótipo educacional e assistivo. Não é dispositivo médico e não substitui avaliação clínica.";

export const CLASS_LABELS: Record<string, string> = {
  glioma: "Glioma",
  meningioma: "Meningioma",
  pituitary: "Tumor de hipófise",
  no_tumor: "Saudável",
};

export function formatClass(label: string): string {
  return CLASS_LABELS[label] ?? label;
}
