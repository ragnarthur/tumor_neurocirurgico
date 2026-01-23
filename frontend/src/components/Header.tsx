import { Brain } from "lucide-react";
import { Badge } from "./ui/badge";

export function Header() {
  return (
    <header className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-8 pb-6 pt-10 xl:px-12 2xl:px-20">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Plataforma Institucional
        </p>
        <h1 className="text-3xl font-semibold text-foreground">Suporte Diagnóstico em Neuroimagem</h1>
        <p className="text-sm text-muted-foreground">
          Protótipo educacional para apoio à avaliação de RM cerebral.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          Neuroimagem — Suporte Assistivo
        </Badge>
        <Badge variant="secondary">Versão Beta</Badge>
      </div>
    </header>
  );
}
