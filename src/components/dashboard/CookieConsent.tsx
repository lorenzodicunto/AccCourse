"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Cookie } from "lucide-react";

const CONSENT_KEY = "acccourse-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // Slight delay for better UX — don't flash on load
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white border border-border/60 shadow-2xl shadow-black/10 p-5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-2.5 rounded-xl bg-primary/10">
            <Cookie className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-foreground">
              Utilizamos cookies e armazenamento local
            </h4>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Este site utiliza armazenamento local para salvar seus projetos e
              preferências. Nenhum dado pessoal é coletado ou compartilhado com
              terceiros. Ao continuar navegando, você concorda com nossa{" "}
              <button className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
                Política de Privacidade
              </button>{" "}
              e com a{" "}
              <button className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
                Lei Geral de Proteção de Dados (LGPD)
              </button>
              .
            </p>
            <div className="flex items-center gap-3 mt-4">
              <Button
                size="sm"
                onClick={handleAccept}
                className="rounded-xl px-5"
              >
                Aceitar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDecline}
                className="rounded-xl px-5"
              >
                Recusar
              </Button>
            </div>
          </div>
          <button
            onClick={handleDecline}
            className="p-1 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
