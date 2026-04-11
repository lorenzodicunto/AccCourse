"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center max-w-md">
        <div className="h-20 w-20 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Algo deu errado</h1>
        <p className="text-muted-foreground mb-6">
          Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => (window.location.href = "/")}
          >
            Voltar ao Início
          </Button>
          <Button
            className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white"
            onClick={reset}
          >
            Tentar Novamente
          </Button>
        </div>
      </div>
    </div>
  );
}
