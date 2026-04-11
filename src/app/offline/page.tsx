"use client";

import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center max-w-md">
        <div className="h-20 w-20 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-6">
          <WifiOff className="h-10 w-10 text-purple-600" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Você está offline
        </h1>
        <p className="text-muted-foreground mb-6">
          Parece que você perdeu a conexão com a internet. Verifique sua conexão e tente novamente.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
