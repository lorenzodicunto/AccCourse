"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorFallbackProps {
  componentName: string;
  onRetry?: () => void;
}

export function ErrorFallback({ componentName, onRetry }: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6 text-center" role="alert">
      <AlertTriangle className="h-8 w-8 text-amber-500" aria-hidden="true" />
      <p className="text-sm font-medium text-foreground">
        Erro ao carregar {componentName}
      </p>
      <p className="text-xs text-muted-foreground max-w-xs">
        Tente recarregar a página. Se o problema persistir, entre em contato com o suporte.
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-2 rounded-xl" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
