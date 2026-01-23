import { ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { motion, AnimatePresence } from "framer-motion";

interface PreviewCardProps {
  previewUrl: string | null;
  loading: boolean;
  activeSample: boolean;
}

export function PreviewCard({ previewUrl, loading, activeSample }: PreviewCardProps) {
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          Pré-visualização
        </CardTitle>
        <CardDescription>Revise a imagem antes da inferência.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-hidden rounded-xl border bg-background">
          <AnimatePresence mode="wait">
            {previewUrl ? (
              <motion.img
                key={previewUrl}
                src={previewUrl}
                alt="Preview"
                className="h-80 w-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            ) : (
              <motion.div
                key="placeholder"
                className="flex h-80 items-center justify-center text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                Nenhuma imagem selecionada.
              </motion.div>
            )}
          </AnimatePresence>

          {loading && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40 text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span className="text-xs uppercase tracking-widest">Processando</span>
            </motion.div>
          )}
        </div>
        {activeSample && <p className="mt-3 text-xs text-muted-foreground">Exemplo ativo</p>}
      </CardContent>
    </Card>
  );
}
