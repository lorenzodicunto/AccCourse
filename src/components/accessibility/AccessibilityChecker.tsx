"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, AlertTriangle, Lightbulb, Loader2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccessibilityIssue {
  id: string;
  type: "crítico" | "alerta" | "sugestão";
  title: string;
  description: string;
  affectedElement: string;
  howToFix: string;
  autoFixable: boolean;
  severity: number; // 1-3, where 3 is most critical
}

interface AccessibilityCheckerProps {
  courseData: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Calcular contraste WCAG
function getContrastRatio(
  rgb1: [number, number, number],
  rgb2: [number, number, number]
): number {
  const getLuminance = (rgb: [number, number, number]) => {
    const [r, g, b] = rgb.map((val) => {
      const v = val / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(rgb1);
  const l2 = getLuminance(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

// Extrair RGB de cor
function parseColor(color: string): [number, number, number] | null {
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = color;
  const rgb = ctx.fillStyle;

  if (rgb.startsWith("#")) {
    const hex = rgb.slice(1);
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
    ];
  }

  const match = rgb.match(/\d+/g);
  if (match && match.length >= 3) {
    return [parseInt(match[0]), parseInt(match[1]), parseInt(match[2])];
  }

  return null;
}

export function AccessibilityChecker({
  courseData,
  open,
  onOpenChange,
}: AccessibilityCheckerProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [issues, setIssues] = useState<AccessibilityIssue[]>([]);
  const [isFixed, setIsFixed] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  // Executar verificação
  const runCheck = useCallback(async () => {
    setIsChecking(true);
    setIsFixed(false);
    const foundIssues: AccessibilityIssue[] = [];

    // Simular análise assíncrona
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 1. Verificar imagens sem alt text
    const images = document.querySelectorAll("img");
    images.forEach((img) => {
      if (!img.alt || img.alt.trim() === "") {
        foundIssues.push({
          id: `img-${img.src}`,
          type: "alerta",
          title: "Imagem sem texto alternativo",
          description: `A imagem "${img.src.split("/").pop()}" não possui atributo alt`,
          affectedElement: `<img src="${img.src}" />`,
          howToFix: 'Adicione um atributo alt descritivo: <img alt="Descrição da imagem" ... />',
          autoFixable: false,
          severity: 2,
        });
      }
    });

    // 2. Verificar contraste de cores
    const allElements = document.querySelectorAll("*");
    allElements.forEach((el) => {
      const styles = window.getComputedStyle(el);
      const bgColor = styles.backgroundColor;
      const textColor = styles.color;

      if (bgColor !== "rgba(0, 0, 0, 0)" && textColor !== "rgba(0, 0, 0, 0)") {
        const bgRgb = parseColor(bgColor);
        const textRgb = parseColor(textColor);

        if (bgRgb && textRgb) {
          const ratio = getContrastRatio(bgRgb, textRgb);

          if (ratio < 4.5) {
            foundIssues.push({
              id: `contrast-${Math.random()}`,
              type: "crítico",
              title: "Contraste insuficiente",
              description: `Contraste de ${ratio.toFixed(2)}:1. Recomendado mínimo 4.5:1`,
              affectedElement: el.tagName,
              howToFix: "Ajuste as cores de fundo e texto para aumentar o contraste",
              autoFixable: false,
              severity: 3,
            });
          }
        }
      }
    });

    // 3. Verificar tamanho de texto
    allElements.forEach((el) => {
      const styles = window.getComputedStyle(el);
      const fontSize = parseFloat(styles.fontSize);

      if (
        fontSize < 14 &&
        el.childNodes.length > 0 &&
        el.textContent?.trim().length > 0
      ) {
        foundIssues.push({
          id: `font-${el.className}`,
          type: "alerta",
          title: "Texto muito pequeno",
          description: `Tamanho de fonte: ${fontSize.toFixed(0)}px (recomendado mínimo 14px)`,
          affectedElement: `<${el.tagName.toLowerCase()}>`,
          howToFix: `Aumente o tamanho da fonte para pelo menos 14px usando CSS`,
          autoFixable: true,
          severity: 2,
        });
      }
    });

    // 4. Verificar vídeos sem legendas
    const videos = document.querySelectorAll("video");
    videos.forEach((video) => {
      const hasTracks = Array.from(video.querySelectorAll("track")).some(
        (track) => track.kind === "captions" || track.kind === "subtitles"
      );

      if (!hasTracks) {
        foundIssues.push({
          id: `video-${Math.random()}`,
          type: "crítico",
          title: "Vídeo sem legendas",
          description: "Este vídeo não possui faixas de legenda",
          affectedElement: "<video>",
          howToFix: 'Adicione faixas de legenda: <track kind="captions" ... />',
          autoFixable: false,
          severity: 3,
        });
      }
    });

    // 5. Verificar elementos interativos sem acesso ao teclado
    const interactiveElements = document.querySelectorAll("button, a, input, select, textarea");
    interactiveElements.forEach((el) => {
      const tabIndex = el.getAttribute("tabindex");
      if (tabIndex === "-1") {
        foundIssues.push({
          id: `keyboard-${el.className}`,
          type: "alerta",
          title: "Elemento interativo não acessível por teclado",
          description: `${el.tagName} tem tabindex="-1"`,
          affectedElement: `<${el.tagName.toLowerCase()}>`,
          howToFix: "Remova ou ajuste o tabindex para permitir navegação por teclado",
          autoFixable: false,
          severity: 2,
        });
      }
    });

    // 6. Verificar hierarquia de headings
    const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
    let lastLevel = 0;
    headings.forEach((heading) => {
      const level = parseInt(heading.tagName[1]);
      if (level - lastLevel > 1) {
        foundIssues.push({
          id: `heading-${heading.textContent}`,
          type: "sugestão",
          title: "Hierarquia de headings incorreta",
          description: `Pulou de H${lastLevel} para H${level}`,
          affectedElement: `<${heading.tagName.toLowerCase()}>`,
          howToFix: "Use uma progressão lógica de headings (H1 → H2 → H3, etc)",
          autoFixable: false,
          severity: 1,
        });
      }
      lastLevel = level;
    });

    // Se courseData tem informações de slides
    if (courseData?.slides) {
      courseData.slides.forEach((slide: any, index: number) => {
        if (!slide.narration && !slide.audioDescription) {
          foundIssues.push({
            id: `audio-${index}`,
            type: "alerta",
            title: "Slide sem narração ou descrição de áudio",
            description: `Slide ${index + 1} não possui narração`,
            affectedElement: `Slide ${index + 1}`,
            howToFix: "Adicione narração de áudio ou descrição de áudio ao slide",
            autoFixable: false,
            severity: 2,
          });
        }
      });
    }

    setIssues(foundIssues);
    setHasRun(true);
    setIsChecking(false);
  }, [courseData]);

  // Corrigir automaticamente
  const autoFix = useCallback(() => {
    const autoFixableIssues = issues.filter((issue) => issue.autoFixable);

    autoFixableIssues.forEach((issue) => {
      if (issue.type === "alerta" && issue.title.includes("Texto muito pequeno")) {
        const elements = document.querySelectorAll(
          issue.affectedElement.toLowerCase()
        );
        elements.forEach((el) => {
          (el as HTMLElement).style.fontSize = "14px";
        });
      }
    });

    setIsFixed(true);
  }, [issues]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    const críticos = issues.filter((i) => i.type === "crítico").length;
    const alertas = issues.filter((i) => i.type === "alerta").length;
    const sugestões = issues.filter((i) => i.type === "sugestão").length;

    const total = issues.length;
    let score = 100;

    score -= críticos * 10;
    score -= alertas * 5;
    score -= sugestões * 1;

    return {
      críticos,
      alertas,
      sugestões,
      total,
      score: Math.max(0, score),
    };
  }, [issues]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-purple-600" />
            Verificador de Acessibilidade
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Score e estatísticas */}
          {hasRun && (
            <div className="space-y-4">
              {/* Score geral */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">
                    Pontuação de Acessibilidade
                  </h3>
                  <span className="text-3xl font-bold text-purple-600">
                    {stats.score}%
                  </span>
                </div>

                {/* Barra de progresso */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all",
                      stats.score >= 80
                        ? "bg-green-500"
                        : stats.score >= 60
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    )}
                    style={{ width: `${stats.score}%` }}
                  />
                </div>
              </div>

              {/* Contadores */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-600">
                      Crítico
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-red-700">
                    {stats.críticos}
                  </p>
                </div>

                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-600">
                      Alerta
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-700">
                    {stats.alertas}
                  </p>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Lightbulb className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">
                      Sugestão
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">
                    {stats.sugestões}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Lista de problemas */}
          {issues.length > 0 && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {issues
                .sort((a, b) => b.severity - a.severity)
                .map((issue) => (
                  <div
                    key={issue.id}
                    className={cn(
                      "p-3 rounded-lg border",
                      issue.type === "crítico"
                        ? "bg-red-50 border-red-200"
                        : issue.type === "alerta"
                        ? "bg-yellow-50 border-yellow-200"
                        : "bg-blue-50 border-blue-200"
                    )}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {issue.type === "crítico" ? (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        ) : issue.type === "alerta" ? (
                          <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        ) : (
                          <Lightbulb className="h-5 w-5 text-blue-600" />
                        )}
                      </div>

                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {issue.title}
                        </h4>
                        <p className="text-sm text-gray-700 mt-1">
                          {issue.description}
                        </p>

                        <div className="mt-2 text-xs space-y-1">
                          <p className="text-gray-600">
                            <span className="font-medium">Elemento afetado:</span>{" "}
                            <code className="bg-gray-200 px-2 py-1 rounded">
                              {issue.affectedElement}
                            </code>
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium">Como corrigir:</span>{" "}
                            {issue.howToFix}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Estado vazio */}
          {hasRun && issues.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">
                Excelente acessibilidade!
              </h3>
              <p className="text-gray-600">
                Nenhum problema encontrado neste currículo.
              </p>
            </div>
          )}

          {/* Botão de verificação */}
          {!hasRun && (
            <div className="text-center py-8">
              <Button
                onClick={runCheck}
                disabled={isChecking}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isChecking && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isChecking ? "Verificando..." : "Iniciar Verificação"}
              </Button>
            </div>
          )}

          {/* Mensagem de sucesso */}
          {isFixed && (
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg flex gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">
                Correções automáticas aplicadas com sucesso!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>

          {hasRun && issues.some((i) => i.autoFixable) && !isFixed && (
            <Button
              onClick={autoFix}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Zap className="h-4 w-4 mr-2" />
              Corrigir Automaticamente
            </Button>
          )}

          {hasRun && (
            <Button
              onClick={runCheck}
              disabled={isChecking}
              variant="outline"
            >
              {isChecking && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Verificar Novamente
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
