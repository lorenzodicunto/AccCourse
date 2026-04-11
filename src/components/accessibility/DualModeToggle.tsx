"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface DualModeToggleProps {
  mode: "standard" | "accessible";
  onModeChange: (mode: "standard" | "accessible") => void;
}

export function DualModeToggle({ mode, onModeChange }: DualModeToggleProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Aplicar estilos de acessibilidade quando o modo mudar
    applyAccessibilityStyles(mode);
  }, [mode]);

  const applyAccessibilityStyles = (selectedMode: "standard" | "accessible") => {
    const root = document.documentElement;

    if (selectedMode === "accessible") {
      // Aumentar fontes globais
      root.style.fontSize = "18px";
      root.style.lineHeight = "1.8";
      root.style.letterSpacing = "0.5px";

      // Adicionar classe de acessibilidade
      document.body.classList.add("accessible-mode");
      document.body.classList.remove("standard-mode");

      // Aumentar contraste
      document.body.style.backgroundColor = "#ffffff";
      document.body.style.color = "#000000";

      // Desabilitar animações
      document.documentElement.style.setProperty(
        "--animation-duration",
        "0.001ms",
        "important"
      );

      // Adicionar espaçamento extra
      const style = document.createElement("style");
      style.id = "accessibility-styles";
      if (!document.getElementById("accessibility-styles")) {
        style.textContent = `
          .accessible-mode {
            --focus-ring-color: #7c3aed;
          }

          .accessible-mode * {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
          }

          .accessible-mode a:focus,
          .accessible-mode button:focus,
          .accessible-mode input:focus,
          .accessible-mode select:focus,
          .accessible-mode textarea:focus {
            outline: 3px solid var(--focus-ring-color);
            outline-offset: 2px;
          }

          .accessible-mode button,
          .accessible-mode a {
            padding: 12px 16px;
            min-height: 44px;
            font-size: 16px;
          }

          .accessible-mode label {
            font-size: 16px;
            font-weight: 600;
            display: block;
            margin-bottom: 8px;
          }

          .accessible-mode input,
          .accessible-mode select,
          .accessible-mode textarea {
            font-size: 16px;
            padding: 12px;
            border: 2px solid #000;
            border-radius: 4px;
          }

          .accessible-mode h1 {
            font-size: 32px;
            margin-bottom: 16px;
          }

          .accessible-mode h2 {
            font-size: 28px;
            margin-bottom: 14px;
          }

          .accessible-mode h3 {
            font-size: 24px;
            margin-bottom: 12px;
          }

          .accessible-mode p {
            font-size: 18px;
            line-height: 1.8;
            margin-bottom: 12px;
          }

          .accessible-mode body {
            background-color: #ffffff;
            color: #000000;
          }
        `;
        document.head.appendChild(style);
      }
    } else {
      // Remover estilos de acessibilidade
      root.style.fontSize = "";
      root.style.lineHeight = "";
      root.style.letterSpacing = "";

      document.body.classList.remove("accessible-mode");
      document.body.classList.add("standard-mode");

      document.body.style.backgroundColor = "";
      document.body.style.color = "";

      document.documentElement.style.removeProperty("--animation-duration");

      const accessibilityStyles = document.getElementById("accessibility-styles");
      if (accessibilityStyles) {
        accessibilityStyles.remove();
      }
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
      <Button
        variant={mode === "standard" ? "default" : "ghost"}
        size="sm"
        onClick={() => onModeChange("standard")}
        className={cn(
          "gap-2",
          mode === "standard"
            ? "bg-purple-600 hover:bg-purple-700 text-white"
            : "text-gray-700 hover:bg-gray-200"
        )}
      >
        <Eye className="h-4 w-4" />
        Modo Padrão
      </Button>

      <Button
        variant={mode === "accessible" ? "default" : "ghost"}
        size="sm"
        onClick={() => onModeChange("accessible")}
        className={cn(
          "gap-2",
          mode === "accessible"
            ? "bg-purple-600 hover:bg-purple-700 text-white"
            : "text-gray-700 hover:bg-gray-200"
        )}
      >
        <EyeOff className="h-4 w-4" />
        Modo Acessível
      </Button>
    </div>
  );
}
