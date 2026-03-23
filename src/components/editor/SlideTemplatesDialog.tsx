"use client";

import { useState } from "react";
import { useEditorStore, Block } from "@/store/useEditorStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LayoutTemplate, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SlideTemplate {
  id: string;
  name: string;
  preview: string; // CSS gradient for preview
  background: string;
  blocks: Omit<Block, "id">[];
}

const TEMPLATES: SlideTemplate[] = [
  {
    id: "blank",
    name: "Em Branco",
    preview: "linear-gradient(135deg, #f8fafc, #e2e8f0)",
    background: "#ffffff",
    blocks: [],
  },
  {
    id: "title",
    name: "Título Central",
    preview: "linear-gradient(135deg, #1e293b, #334155)",
    background: "#1e293b",
    blocks: [
      {
        type: "text", x: 130, y: 180, width: 700, height: 60, zIndex: 0,
        content: "Título da Apresentação",
        fontSize: 44, fontWeight: "700", fontStyle: "normal",
        textDecorationLine: "none", color: "#ffffff", textAlign: "center",
        lineHeight: 1.2, letterSpacing: 0, textShadow: "none",
        backgroundColor: "transparent", borderRadius: 0, opacity: 1, listType: "none",
      } as Omit<Block, "id">,
      {
        type: "text", x: 230, y: 260, width: 500, height: 30, zIndex: 1,
        content: "Subtítulo ou descrição breve",
        fontSize: 18, fontWeight: "400", fontStyle: "normal",
        textDecorationLine: "none", color: "#94a3b8", textAlign: "center",
        lineHeight: 1.5, letterSpacing: 1, textShadow: "none",
        backgroundColor: "transparent", borderRadius: 0, opacity: 1, listType: "none",
      } as Omit<Block, "id">,
    ],
  },
  {
    id: "title-content",
    name: "Título + Conteúdo",
    preview: "linear-gradient(135deg, #ffffff, #f1f5f9)",
    background: "#ffffff",
    blocks: [
      {
        type: "text", x: 40, y: 30, width: 880, height: 50, zIndex: 0,
        content: "Título do Slide",
        fontSize: 36, fontWeight: "700", fontStyle: "normal",
        textDecorationLine: "none", color: "#1e293b", textAlign: "left",
        lineHeight: 1.2, letterSpacing: 0, textShadow: "none",
        backgroundColor: "transparent", borderRadius: 0, opacity: 1, listType: "none",
      } as Omit<Block, "id">,
      {
        type: "shape", x: 40, y: 90, width: 100, height: 4, zIndex: 1,
        shapeType: "rectangle", fillColor: "#6366f1", strokeColor: "transparent",
        strokeWidth: 0, opacity: 1, rotation: 0,
      } as Omit<Block, "id">,
      {
        type: "text", x: 40, y: 120, width: 880, height: 380, zIndex: 2,
        content: "Adicione seu conteúdo aqui. Use pontos-chave para organizar as informações de forma clara e objetiva.",
        fontSize: 18, fontWeight: "400", fontStyle: "normal",
        textDecorationLine: "none", color: "#475569", textAlign: "left",
        lineHeight: 1.6, letterSpacing: 0, textShadow: "none",
        backgroundColor: "transparent", borderRadius: 0, opacity: 1, listType: "none",
      } as Omit<Block, "id">,
    ],
  },
  {
    id: "two-columns",
    name: "2 Colunas",
    preview: "linear-gradient(135deg, #fafafa, #e2e8f0)",
    background: "#ffffff",
    blocks: [
      {
        type: "text", x: 40, y: 30, width: 880, height: 50, zIndex: 0,
        content: "Comparação / Dois Tópicos",
        fontSize: 32, fontWeight: "700", fontStyle: "normal",
        textDecorationLine: "none", color: "#1e293b", textAlign: "center",
        lineHeight: 1.2, letterSpacing: 0, textShadow: "none",
        backgroundColor: "transparent", borderRadius: 0, opacity: 1, listType: "none",
      } as Omit<Block, "id">,
      {
        type: "text", x: 40, y: 110, width: 420, height: 380, zIndex: 1,
        content: "<strong>Coluna 1</strong><br><br>Conteúdo da primeira coluna. Descreva o primeiro tópico aqui.",
        fontSize: 16, fontWeight: "400", fontStyle: "normal",
        textDecorationLine: "none", color: "#475569", textAlign: "left",
        lineHeight: 1.6, letterSpacing: 0, textShadow: "none",
        backgroundColor: "#f1f5f9", borderRadius: 12, opacity: 1, listType: "none",
      } as Omit<Block, "id">,
      {
        type: "text", x: 500, y: 110, width: 420, height: 380, zIndex: 2,
        content: "<strong>Coluna 2</strong><br><br>Conteúdo da segunda coluna. Descreva o segundo tópico aqui.",
        fontSize: 16, fontWeight: "400", fontStyle: "normal",
        textDecorationLine: "none", color: "#475569", textAlign: "left",
        lineHeight: 1.6, letterSpacing: 0, textShadow: "none",
        backgroundColor: "#f1f5f9", borderRadius: 12, opacity: 1, listType: "none",
      } as Omit<Block, "id">,
    ],
  },
  {
    id: "image-left",
    name: "Imagem + Texto",
    preview: "linear-gradient(90deg, #dbeafe 50%, #ffffff 50%)",
    background: "#ffffff",
    blocks: [
      {
        type: "image", x: 0, y: 0, width: 460, height: 540, zIndex: 0,
        src: "", alt: "Imagem", objectFit: "cover",
        opacity: 1, borderRadius: 0, borderWidth: 0, borderColor: "#000",
        boxShadow: "none",
      } as Omit<Block, "id">,
      {
        type: "text", x: 500, y: 100, width: 420, height: 50, zIndex: 1,
        content: "Título do Conteúdo",
        fontSize: 30, fontWeight: "700", fontStyle: "normal",
        textDecorationLine: "none", color: "#1e293b", textAlign: "left",
        lineHeight: 1.2, letterSpacing: 0, textShadow: "none",
        backgroundColor: "transparent", borderRadius: 0, opacity: 1, listType: "none",
      } as Omit<Block, "id">,
      {
        type: "text", x: 500, y: 170, width: 420, height: 280, zIndex: 2,
        content: "Adicione uma descrição detalhada ao lado da imagem. Este layout é perfeito para explicações visuais.",
        fontSize: 16, fontWeight: "400", fontStyle: "normal",
        textDecorationLine: "none", color: "#64748b", textAlign: "left",
        lineHeight: 1.6, letterSpacing: 0, textShadow: "none",
        backgroundColor: "transparent", borderRadius: 0, opacity: 1, listType: "none",
      } as Omit<Block, "id">,
    ],
  },
  {
    id: "section",
    name: "Divisória de Seção",
    preview: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    blocks: [
      {
        type: "text", x: 80, y: 190, width: 800, height: 60, zIndex: 0,
        content: "Seção 01",
        fontSize: 52, fontWeight: "800", fontStyle: "normal",
        textDecorationLine: "none", color: "#ffffff", textAlign: "center",
        lineHeight: 1.1, letterSpacing: 2, textShadow: "none",
        backgroundColor: "transparent", borderRadius: 0, opacity: 1, listType: "none",
      } as Omit<Block, "id">,
      {
        type: "text", x: 180, y: 270, width: 600, height: 30, zIndex: 1,
        content: "Subtítulo descritivo da seção",
        fontSize: 18, fontWeight: "400", fontStyle: "normal",
        textDecorationLine: "none", color: "#e0e7ff", textAlign: "center",
        lineHeight: 1.5, letterSpacing: 1, textShadow: "none",
        backgroundColor: "transparent", borderRadius: 0, opacity: 0.8, listType: "none",
      } as Omit<Block, "id">,
    ],
  },
  {
    id: "quiz-template",
    name: "Quiz",
    preview: "linear-gradient(135deg, #fef3c7, #fde68a)",
    background: "#fffbeb",
    blocks: [
      {
        type: "text", x: 40, y: 30, width: 880, height: 40, zIndex: 0,
        content: "📝 Verificação de Conhecimento",
        fontSize: 24, fontWeight: "700", fontStyle: "normal",
        textDecorationLine: "none", color: "#92400e", textAlign: "left",
        lineHeight: 1.3, letterSpacing: 0, textShadow: "none",
        backgroundColor: "transparent", borderRadius: 0, opacity: 1, listType: "none",
      } as Omit<Block, "id">,
      {
        type: "quiz", x: 80, y: 100, width: 800, height: 380, zIndex: 1,
        question: "Qual é a resposta correta?",
        options: [
          { id: crypto.randomUUID(), text: "Opção A", isCorrect: false },
          { id: crypto.randomUUID(), text: "Opção B", isCorrect: true },
          { id: crypto.randomUUID(), text: "Opção C", isCorrect: false },
          { id: crypto.randomUUID(), text: "Opção D", isCorrect: false },
        ],
        feedback: { correct: "Correto! 🎉", incorrect: "Incorreto. Tente novamente." },
        pointsValue: 10,
      } as Omit<Block, "id">,
    ],
  },
  {
    id: "thank-you",
    name: "Slide Final",
    preview: "linear-gradient(135deg, #0f172a, #1e293b)",
    background: "#0f172a",
    blocks: [
      {
        type: "text", x: 130, y: 160, width: 700, height: 70, zIndex: 0,
        content: "Obrigado!",
        fontSize: 56, fontWeight: "800", fontStyle: "normal",
        textDecorationLine: "none", color: "#ffffff", textAlign: "center",
        lineHeight: 1.1, letterSpacing: 0, textShadow: "none",
        backgroundColor: "transparent", borderRadius: 0, opacity: 1, listType: "none",
      } as Omit<Block, "id">,
      {
        type: "text", x: 230, y: 250, width: 500, height: 30, zIndex: 1,
        content: "Alguma dúvida? Entre em contato.",
        fontSize: 18, fontWeight: "400", fontStyle: "normal",
        textDecorationLine: "none", color: "#94a3b8", textAlign: "center",
        lineHeight: 1.5, letterSpacing: 0, textShadow: "none",
        backgroundColor: "transparent", borderRadius: 0, opacity: 0.8, listType: "none",
      } as Omit<Block, "id">,
      {
        type: "shape", x: 420, y: 310, width: 120, height: 3, zIndex: 2,
        shapeType: "rectangle", fillColor: "#6366f1", strokeColor: "transparent",
        strokeWidth: 0, opacity: 0.6, rotation: 0,
      } as Omit<Block, "id">,
    ],
  },
];

export function SlideTemplatesDialog() {
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const getCurrentProject = useEditorStore((s) => s.getCurrentProject);
  const addSlide = useEditorStore((s) => s.addSlide);
  const setCurrentSlide = useEditorStore((s) => s.setCurrentSlide);
  const updateSlideBackground = useEditorStore((s) => s.updateSlideBackground);
  const addBlock = useEditorStore((s) => s.addBlock);

  const handleApply = () => {
    const template = TEMPLATES.find((t) => t.id === selectedTemplate);
    const project = getCurrentProject();
    if (!template || !project) return;

    // Create new slide
    addSlide(project.id);

    // Get the newly created slide (last one)
    const updatedProject = getCurrentProject();
    if (!updatedProject) return;
    const newSlide = updatedProject.slides[updatedProject.slides.length - 1];

    // Set background
    updateSlideBackground(project.id, newSlide.id, template.background);

    // Add blocks
    for (const blockData of template.blocks) {
      const block = {
        ...blockData,
        id: crypto.randomUUID(),
      } as Block;
      addBlock(project.id, newSlide.id, block);
    }

    // Navigate to new slide
    setCurrentSlide(newSlide.id);

    setOpen(false);
    setSelectedTemplate(null);
    toast.success(`Template "${template.name}" aplicado!`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 h-7 text-xs"
          title="Templates de Slide"
        >
          <LayoutTemplate className="h-3.5 w-3.5" />
          Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl" style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.06)' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4" />
            Templates de Slide
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[400px] mt-2">
          <div className="grid grid-cols-3 gap-3 p-1">
            {TEMPLATES.map((template) => (
              <div
                key={template.id}
                className={cn(
                  "group relative rounded-lg border overflow-hidden cursor-pointer transition-all",
                  selectedTemplate === template.id
                    ? "ring-2 ring-purple-500 border-purple-500/50 scale-[1.02]"
                    : "border-white/10 hover:border-purple-500/30 hover:scale-[1.01]"
                )}
                onClick={() => setSelectedTemplate(template.id)}
              >
                {/* Preview */}
                <div
                  className="aspect-video w-full"
                  style={{ background: template.preview }}
                >
                  {/* Mini block indicators */}
                  <div className="relative w-full h-full overflow-hidden">
                    {template.blocks.map((block, i) => (
                      <div
                        key={i}
                        className="absolute rounded-[1px]"
                        style={{
                          left: `${(block.x / 960) * 100}%`,
                          top: `${(block.y / 540) * 100}%`,
                          width: `${(block.width / 960) * 100}%`,
                          height: `${(block.height / 540) * 100}%`,
                          backgroundColor:
                            block.type === "text" ? "rgba(255,255,255,0.15)" :
                            block.type === "image" ? "rgba(59,130,246,0.3)" :
                            block.type === "quiz" ? "rgba(239,68,68,0.2)" :
                            block.type === "shape" ? "rgba(99,102,241,0.4)" :
                            "rgba(255,255,255,0.1)",
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div className="px-2 py-1.5" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <p className="text-xs font-medium text-center text-slate-300">{template.name}</p>
                </div>

                {/* Selected indicator */}
                {selectedTemplate === template.id && (
                  <div className="absolute top-1 right-1 bg-purple-500 text-white rounded-full p-0.5">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            className="h-7 text-xs"
            onClick={handleApply}
            disabled={!selectedTemplate}
          >
            <Check className="h-3 w-3 mr-1" />
            Criar Slide com Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
