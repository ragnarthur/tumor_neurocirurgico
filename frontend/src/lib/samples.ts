import type { SampleCase } from "./types";

export const SAMPLE_CASES: SampleCase[] = [
  {
    id: "glioma",
    label: "Glioma",
    subtitle: "Tumor glial",
    path: "/samples/glioma.jpg",
  },
  {
    id: "meningioma",
    label: "Meningioma",
    subtitle: "Tumor das meninges",
    path: "/samples/meningioma.jpg",
  },
  {
    id: "pituitary",
    label: "Tumor de Hipófise",
    subtitle: "Tumor hipofisário",
    path: "/samples/pituitary.jpg",
  },
  {
    id: "no_tumor",
    label: "Saudável",
    subtitle: "Sem evidência de tumor",
    path: "/samples/no_tumor.jpg",
  },
];
