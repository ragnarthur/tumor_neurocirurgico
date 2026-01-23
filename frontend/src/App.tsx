import { useState } from "react";
import { toast, Toaster } from "sonner";
import { useAnalysis } from "@/hooks/useAnalysis";
import { useHistory } from "@/hooks/useHistory";
import { fileToDataUrl } from "@/lib/helpers";
import type { AnalysisHistoryItem, PredictResponse } from "@/lib/types";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { UploadCard } from "@/components/UploadCard";
import { PreviewCard } from "@/components/PreviewCard";
import { ResultCard } from "@/components/ResultCard";
import { HistorySection } from "@/components/HistorySection";

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeSample, setActiveSample] = useState<string | null>(null);

  const { result, loading, error, elapsedMs, analyze } = useAnalysis();
  const { items, addItem, clear } = useHistory();

  const handleResult = async (
    fileRef: File,
    data: PredictResponse,
    elapsed: number | null,
    preview: string
  ) => {
    const item: AnalysisHistoryItem = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      fileName: fileRef.name,
      previewUrl: preview,
      result: data,
      elapsedMs: elapsed,
    };
    addItem(item);
  };

  const onFileChange = async (selected: File | null) => {
    setFile(selected);
    setActiveSample(null);

    if (selected) {
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const runAnalysis = async (target: File) => {
    const preview = await fileToDataUrl(target);
    const response = await analyze(target);
    if (response?.data) {
      toast.success("Análise concluída com sucesso.");
      await handleResult(target, response.data, response.elapsedMs ?? null, preview);
    } else if (error) {
      toast.error("Falha na análise.");
    }
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) return;
    await runAnalysis(file);
  };

  const loadSample = async (samplePath: string, sampleId: string) => {
    try {
      const res = await fetch(samplePath);
      if (!res.ok) {
        throw new Error("Não foi possível carregar o exemplo local.");
      }
      const blob = await res.blob();
      const sampleFile = new File([blob], `${sampleId}.jpg`, { type: blob.type });
      setFile(sampleFile);
      setPreviewUrl(URL.createObjectURL(sampleFile));
      setActiveSample(sampleId);
      await runAnalysis(sampleFile);
    } catch (err) {
      toast.error("Erro ao carregar exemplo.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-foreground">
      <Toaster richColors position="top-right" />

      <Header />

      <main className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-6 px-8 pb-16 lg:grid-cols-3 xl:px-12 2xl:px-20">
        <UploadCard
          file={file}
          onFileChange={onFileChange}
          onSubmit={onSubmit}
          loading={loading}
          error={error}
          activeSample={activeSample}
          onLoadSample={loadSample}
        />

        <PreviewCard
          previewUrl={previewUrl}
          loading={loading}
          activeSample={activeSample !== null}
        />

        <ResultCard
          result={result}
          elapsedMs={elapsedMs}
        />

        <HistorySection
          items={items}
          clear={clear}
        />
      </main>

      <Footer disclaimer={result?.disclaimer} />
    </div>
  );
}

export default App;
