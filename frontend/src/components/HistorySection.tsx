import { History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { formatClass } from "@/lib/constants";
import type { AnalysisHistoryItem } from "@/lib/types";

interface HistorySectionProps {
  items: AnalysisHistoryItem[];
  clear: () => void;
}

export function HistorySection({ items, clear }: HistorySectionProps) {
  return (
    <Card className="lg:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de análises
          </CardTitle>
          <CardDescription>Últimas 10 análises realizadas neste navegador.</CardDescription>
        </div>
        <Button variant="outline" onClick={clear} disabled={!items.length}>
          Limpar histórico
        </Button>
      </CardHeader>
      <CardContent>
        {items.length ? (
          <ScrollArea className="h-[240px]">
            <div className="space-y-4 pr-4">
              {items.map((item: AnalysisHistoryItem) => (
                <div key={item.id} className="rounded-xl border bg-background p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <img
                      src={item.previewUrl}
                      alt={item.fileName}
                      className="h-24 w-24 rounded-lg object-cover"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-foreground">
                          {formatClass(item.result.predicted_class)}
                        </p>
                        <Badge variant="secondary">{item.fileName}</Badge>
                      </div>
                      <Separator />
                      <div className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Nenhuma análise registrada ainda.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
