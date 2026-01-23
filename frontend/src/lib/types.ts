export type PredictResponse = {
  predicted_class: string
  probs: Record<string, number>
  heatmap_png_base64?: string
  disclaimer: string
}

export type AnalysisHistoryItem = {
  id: string
  createdAt: string
  fileName: string
  previewUrl: string
  result: PredictResponse
  elapsedMs: number | null
}

export type SampleCase = {
  id: string
  label: string
  subtitle: string
  path: string
}
