import { FileImage, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Input } from "./ui/input";
import { SAMPLE_CASES } from "@/lib/samples";
import type { SampleCase } from "@/lib/types";
import { cn } from "@/lib/utils";

interface UploadCardProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  onSubmit: (event: React.FormEvent) => Promise<void>;
  loading: boolean;
  error: string | null;
  activeSample: string | null;
  onLoadSample: (path: string, id: string) => Promise<void>;
}

export function UploadCard({
  file,
  onFileChange,
  onSubmit,
  loading,
  error,
  activeSample,
  onLoadSample,
}: UploadCardProps) {
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileImage className="h-5 w-5" />
          Envio da imagem
        </CardTitle>
        <CardDescription>Selecione uma imagem JPG/PNG de RM cerebral.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Casos de exemplo
          </span>
          <div className="grid grid-cols-2 gap-3">
            {SAMPLE_CASES.map((sample: SampleCase) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => onLoadSample(sample.path, sample.id)}
                className={cn(
                  "group flex flex-col items-start gap-2 rounded-xl border bg-background p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md",
                  activeSample === sample.id && "border-accent shadow-sm"
                )}
                disabled={loading}
              >
                <img
                  src={sample.path}
                  alt={sample.label}
                  className="h-20 w-full rounded-lg object-cover"
                  loading="lazy"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">{sample.label}</p>
                  <p className="text-xs text-muted-foreground">{sample.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <Input
            type="file"
            accept="image/png,image/jpeg"
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            className="cursor-pointer transition hover:border-accent hover:bg-accent/10 focus-visible:ring-2 focus-visible:ring-accent/40"
          />
          <Button
            type="submit"
            className="group relative w-full overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
            disabled={!file || loading || activeSample !== null}
          >
            <span className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
              <span className="absolute -left-20 top-0 h-full w-20 rotate-12 bg-white/20 blur-xl" />
            </span>
            {loading ? "Processando análise..." : "Iniciar análise"}
          </Button>
        </form>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
