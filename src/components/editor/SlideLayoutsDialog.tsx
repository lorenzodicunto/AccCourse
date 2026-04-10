"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Type, Columns2, Image, Presentation, Grid3X3, ListChecks, Quote } from "lucide-react";
import { useEditorStore } from "@/store/useEditorStore";
import { toast } from "sonner";

interface SlideLayout {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  blocks: {
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    props: Record<string, any>;
  }[];
}

const LAYOUTS: SlideLayout[] = [
  {
    id: "title",
    name: "Título Central",
    icon: <Presentation className="h-5 w-5" />,
    description: "Título grande centralizado com subtítulo",
    blocks: [
      { type: "text", x: 80, y: 160, width: 800, height: 80, props: { content: "Título do Slide", fontSize: 48, fontWeight: "bold", color: "#1e293b", textAlign: "center", backgroundColor: "transparent" } },
      { type: "text", x: 180, y: 260, width: 600, height: 50, props: { content: "Subtítulo ou descrição breve", fontSize: 20, fontWeight: "normal", color: "#64748b", textAlign: "center", backgroundColor: "transparent" } },
    ],
  },
  {
    id: "title-body",
    name: "Título + Corpo",
    icon: <Type className="h-5 w-5" />,
    description: "Título no topo com área de texto abaixo",
    blocks: [
      { type: "text", x: 60, y: 40, width: 840, height: 60, props: { content: "Título da Seção", fontSize: 36, fontWeight: "bold", color: "#1e293b", textAlign: "left", backgroundColor: "transparent" } },
      { type: "shape", x: 60, y: 110, width: 100, height: 4, props: { shapeType: "rectangle", fillColor: "#7c3aed", strokeColor: "transparent", strokeWidth: 0, opacity: 1, rotation: 0 } },
      { type: "text", x: 60, y: 140, width: 840, height: 340, props: { content: "Conteúdo detalhado do slide. Edite este texto para adicionar sua informação.", fontSize: 18, fontWeight: "normal", color: "#374151", textAlign: "left", backgroundColor: "transparent" } },
    ],
  },
  {
    id: "two-columns",
    name: "Duas Colunas",
    icon: <Columns2 className="h-5 w-5" />,
    description: "Conteúdo dividido em duas colunas",
    blocks: [
      { type: "text", x: 40, y: 30, width: 880, height: 50, props: { content: "Título Comparativo", fontSize: 32, fontWeight: "bold", color: "#1e293b", textAlign: "center", backgroundColor: "transparent" } },
      { type: "text", x: 40, y: 100, width: 420, height: 380, props: { content: "Coluna Esquerda\n\n• Ponto 1\n• Ponto 2\n• Ponto 3", fontSize: 16, fontWeight: "normal", color: "#374151", textAlign: "left", backgroundColor: "#f8fafc" } },
      { type: "text", x: 500, y: 100, width: 420, height: 380, props: { content: "Coluna Direita\n\n• Ponto A\n• Ponto B\n• Ponto C", fontSize: 16, fontWeight: "normal", color: "#374151", textAlign: "left", backgroundColor: "#f8fafc" } },
    ],
  },
  {
    id: "image-text",
    name: "Imagem + Texto",
    icon: <Image className="h-5 w-5" />,
    description: "Imagem à esquerda com texto explicativo",
    blocks: [
      { type: "image", x: 40, y: 40, width: 420, height: 460, props: { src: "", alt: "Adicione uma imagem", objectFit: "cover", opacity: 1, borderRadius: 12 } },
      { type: "text", x: 500, y: 40, width: 420, height: 60, props: { content: "Título Visual", fontSize: 28, fontWeight: "bold", color: "#1e293b", textAlign: "left", backgroundColor: "transparent" } },
      { type: "text", x: 500, y: 120, width: 420, height: 380, props: { content: "Descrição do conteúdo visual. Use este espaço para explicar a imagem ao lado.", fontSize: 16, fontWeight: "normal", color: "#64748b", textAlign: "left", backgroundColor: "transparent" } },
    ],
  },
  {
    id: "three-cards",
    name: "3 Cards",
    icon: <Grid3X3 className="h-5 w-5" />,
    description: "Três cards lado a lado para tópicos",
    blocks: [
      { type: "text", x: 80, y: 20, width: 800, height: 50, props: { content: "Nossos Pilares", fontSize: 32, fontWeight: "bold", color: "#1e293b", textAlign: "center", backgroundColor: "transparent" } },
      { type: "text", x: 40, y: 90, width: 270, height: 400, props: { content: "📊\n\nTópico 1\n\nDescrição breve do primeiro tópico.", fontSize: 14, fontWeight: "normal", color: "#374151", textAlign: "center", backgroundColor: "#f0fdf4" } },
      { type: "text", x: 340, y: 90, width: 270, height: 400, props: { content: "🎯\n\nTópico 2\n\nDescrição breve do segundo tópico.", fontSize: 14, fontWeight: "normal", color: "#374151", textAlign: "center", backgroundColor: "#eff6ff" } },
      { type: "text", x: 640, y: 90, width: 270, height: 400, props: { content: "⚡\n\nTópico 3\n\nDescrição breve do terceiro tópico.", fontSize: 14, fontWeight: "normal", color: "#374151", textAlign: "center", backgroundColor: "#faf5ff" } },
    ],
  },
  {
    id: "checklist",
    name: "Checklist",
    icon: <ListChecks className="h-5 w-5" />,
    description: "Lista de itens com checkmarks",
    blocks: [
      { type: "text", x: 60, y: 30, width: 840, height: 50, props: { content: "Checklist de Aprendizado", fontSize: 32, fontWeight: "bold", color: "#1e293b", textAlign: "left", backgroundColor: "transparent" } },
      { type: "text", x: 60, y: 100, width: 840, height: 400, props: { content: "✅ Item concluído número um\n\n✅ Item concluído número dois\n\n⬜ Item pendente número três\n\n⬜ Item pendente número quatro\n\n⬜ Item pendente número cinco", fontSize: 20, fontWeight: "normal", color: "#374151", textAlign: "left", backgroundColor: "transparent" } },
    ],
  },
  {
    id: "quote",
    name: "Citação",
    icon: <Quote className="h-5 w-5" />,
    description: "Citação destacada com autor",
    blocks: [
      { type: "shape", x: 120, y: 80, width: 720, height: 300, props: { shapeType: "rounded-rect", fillColor: "#faf5ff", strokeColor: "#7c3aed", strokeWidth: 2, opacity: 1, rotation: 0 } },
      { type: "text", x: 160, y: 120, width: 640, height: 180, props: { content: "\"A educação é a arma mais poderosa que você pode usar para mudar o mundo.\"", fontSize: 28, fontWeight: "normal", color: "#3b0764", textAlign: "center", backgroundColor: "transparent" } },
      { type: "text", x: 160, y: 310, width: 640, height: 40, props: { content: "— Nelson Mandela", fontSize: 18, fontWeight: "600", color: "#7c3aed", textAlign: "center", backgroundColor: "transparent" } },
    ],
  },
  {
    id: "section-break",
    name: "Divisão de Seção",
    icon: <LayoutGrid className="h-5 w-5" />,
    description: "Slide de transição entre seções",
    blocks: [
      { type: "shape", x: 0, y: 0, width: 480, height: 540, props: { shapeType: "rectangle", fillColor: "#7c3aed", strokeColor: "transparent", strokeWidth: 0, opacity: 1, rotation: 0 } },
      { type: "text", x: 40, y: 180, width: 400, height: 80, props: { content: "Seção 2", fontSize: 48, fontWeight: "bold", color: "#ffffff", textAlign: "left", backgroundColor: "transparent" } },
      { type: "text", x: 40, y: 270, width: 400, height: 40, props: { content: "Subtítulo da seção", fontSize: 18, fontWeight: "normal", color: "#c4b5fd", textAlign: "left", backgroundColor: "transparent" } },
      { type: "text", x: 520, y: 160, width: 400, height: 220, props: { content: "Resumo do que será abordado nesta seção do curso.", fontSize: 18, fontWeight: "normal", color: "#374151", textAlign: "left", backgroundColor: "transparent" } },
    ],
  },
];

export function SlideLayoutsDialog() {
  const [open, setOpen] = useState(false);
  const project = useEditorStore((s) => s.getCurrentProject());
  const addSlide = useEditorStore((s) => s.addSlide);
  const addBlock = useEditorStore((s) => s.addBlock);

  const handleApplyLayout = (layout: SlideLayout) => {
    if (!project) return;
    const slideId = addSlide(project.id);
    if (!slideId) return;

    layout.blocks.forEach((blockDef) => {
      const baseBlock = {
        id: crypto.randomUUID(),
        type: blockDef.type,
        x: blockDef.x,
        y: blockDef.y,
        width: blockDef.width,
        height: blockDef.height,
        zIndex: 1,
        ...blockDef.props,
      };

      // Fill required fields based on type
      if (blockDef.type === "text") {
        addBlock(project.id, slideId, {
          ...baseBlock,
          fontFamily: "Inter, sans-serif",
          fontStyle: "normal",
          textDecorationLine: "none",
          lineHeight: 1.6,
          letterSpacing: 0,
          borderRadius: blockDef.props.backgroundColor !== "transparent" ? 12 : 0,
          opacity: 1,
        } as any);
      } else if (blockDef.type === "image") {
        addBlock(project.id, slideId, {
          ...baseBlock,
          borderWidth: 0,
          borderColor: "#000",
          boxShadow: "none",
        } as any);
      } else if (blockDef.type === "shape") {
        addBlock(project.id, slideId, baseBlock as any);
      }
    });

    toast.success(`Layout "${layout.name}" aplicado!`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-7 px-2">
          <LayoutGrid className="h-3.5 w-3.5 text-violet-500" />
          Layouts
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg" style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base text-slate-900">
            <LayoutGrid className="h-5 w-5 text-purple-600" />
            Slide Layouts
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {LAYOUTS.map((layout) => (
            <button
              key={layout.id}
              onClick={() => handleApplyLayout(layout)}
              className="p-4 rounded-xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-purple-100 text-purple-600 group-hover:bg-purple-200 transition-colors">
                  {layout.icon}
                </div>
                <span className="text-sm font-medium text-slate-800">{layout.name}</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">{layout.description}</p>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
