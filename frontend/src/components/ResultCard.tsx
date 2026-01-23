import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { formatClass } from "@/lib/constants";
import type { PredictResponse } from "@/lib/types";
import { useMemo } from "react";

interface ResultCardProps {
  result: PredictResponse | null;
  elapsedMs: number | null;
}

export function ResultCard({ result, elapsedMs }: ResultCardProps) {
  const sortedProbs = useMemo<[string, number][]>(() => {
    if (!result?.probs) return [];
    return (Object.entries(result.probs) as [string, number][]).sort((a, b) => b[1] - a[1]);
  }, [result]);

  const topTwo = useMemo(() => {
    if (!sortedProbs.length) return null;
    const [first, second] = sortedProbs;
    return { first, second: second ?? null };
  }, [sortedProbs]);

  const confidenceLabel = useMemo(() => {
    if (!topTwo?.first) return null;
    const value = topTwo.first[1];
    if (value >= 0.9) return "Confiança alta";
    if (value >= 0.75) return "Confiança moderada";
    return "Confiança baixa";
  }, [topTwo]);

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Resultado da análise
        </CardTitle>
        <CardDescription>Predição assistiva e interpretação clínica.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="resultado" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="resultado" className="flex-1">
              Resultado
            </TabsTrigger>
            <TabsTrigger value="clinico" className="flex-1">
              Interpretação clínica
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resultado" className="space-y-4">
            {result ? (
              <>
                <div className="rounded-lg border bg-muted px-3 py-2 text-sm">
                  <span className="text-xs uppercase text-muted-foreground">Classe mais provável</span>
                  <p className="text-lg font-semibold text-foreground">
                    {formatClass(result.predicted_class)}
                  </p>
                </div>
                {elapsedMs !== null && (
                  <div className="text-xs text-muted-foreground">
                    Tempo de inferência: {(elapsedMs / 1000).toFixed(2)}s
                  </div>
                )}
                <div className="space-y-3">
                  {sortedProbs.map(([label, value]) => (
                    <div key={label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>{formatClass(label)}</span>
                        <span>{(value * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={value * 100} />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                O resultado será exibido após a análise.
              </div>
            )}
          </TabsContent>

          <TabsContent value="clinico">
            {result ? (
              <div className="space-y-3 text-sm">
                <p className="font-semibold text-foreground">
                  {confidenceLabel ?? "Confiança não disponível"} na predição com base na imagem enviada.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    <strong className="text-foreground">Hipótese principal:</strong>{" "}
                    {formatClass(topTwo?.first?.[0] ?? "")} (
                    {((topTwo?.first?.[1] ?? 0) * 100).toFixed(1)}%).
                  </li>
                  {topTwo?.second && (
                    <li>
                      <strong className="text-foreground">Segunda hipótese:</strong>{" "}
                      {formatClass(topTwo.second[0])} (
                      {(topTwo.second[1] * 100).toFixed(1)}%).
                    </li>
                  )}
                  {topTwo?.second && (
                    <li>
                      <strong className="text-foreground">Diferença top‑1 vs top‑2:</strong>{" "}
                      {((topTwo.first[1] - topTwo.second[1]) * 100).toFixed(1)} p.p.
                    </li>
                  )}
                  <li>
                    <strong className="text-foreground">Observação:</strong> resultado assistivo e
                    educacional; não substitui avaliação clínica.
                  </li>
                </ul>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                A interpretação clínica será exibida após a análise.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
