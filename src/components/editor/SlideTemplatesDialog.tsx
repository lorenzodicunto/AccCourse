"use client";

import { useState } from "react";
import { useEditorStore, Block } from "@/store/useEditorStore";
import { SLIDE_TEMPLATES } from "@/lib/templates/slideLayouts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LayoutTemplate, Check, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "@/lib/constants/canvas";

interface SlideTemplate {
  id: string;
  name: string;
  category: "abertura" | "conteudo" | "dados" | "interativo" | "encerramento";
  preview: string;
  background: string;
  thumbnail: string;
  blocks: Omit<Block, "id">[];
}

const CATEGORIES = [
  { id: "all", label: "Todos", icon: "📋" },
  { id: "abertura", label: "Abertura", icon: "📌" },
  { id: "conteudo", label: "Conteúdo", icon: "📝" },
  { id: "dados", label: "Dados", icon: "📊" },
  { id: "interativo", label: "Interativo", icon: "🎯" },
  { id: "encerramento", label: "Encerramento", icon: "🏁" },
];

const TEMPLATES: SlideTemplate[] = [
  // Abertura
  {
    id: "title_slide",
    name: "Slide de Título",
    category: "abertura",
    thumbnail: "📌",
    preview: "linear-gradient(135deg, #f8f9ff, #e0e7ff)",
    background: "#f8f9ff",
    blocks: [],
  },
  {
    id: "title_subtitle",
    name: "Título + Subtítulo",
    category: "abertura",
    thumbnail: "✨",
    preview: "linear-gradient(135deg, #ffffff, #f1f5f9)",
    background: "#ffffff",
    blocks: [],
  },
  {
    id: "welcome_slide",
    name: "Slide de Boas-vindas",
    category: "abertura",
    thumbnail: "🎉",
    preview: "linear-gradient(135deg, #faf5f0, #fde68a)",
    background: "rgba(255, 255, 255, 0.85)",
    blocks: [],
  },
  // Conteúdo
  {
    id: "one_column",
    name: "Uma Coluna",
    category: "conteudo",
    thumbnail: "📝",
    preview: "linear-gradient(135deg, #ffffff, #f8fafc)",
    background: "#ffffff",
    blocks: [],
  },
  {
    id: "two_columns",
    name: "Duas Colunas",
    category: "conteudo",
    thumbnail: "⬌",
    preview: "linear-gradient(135deg, #f1f5f9, #e2e8f0)",
    background: "#ffffff",
    blocks: [],
  },
  {
    id: "three_columns",
    name: "Três Colunas",
    category: "conteudo",
    thumbnail: "≡",
    preview: "linear-gradient(135deg, #f8fafc, #eef2ff)",
    background: "#ffffff",
    blocks: [],
  },
  {
    id: "text_image_left",
    name: "Imagem à Esquerda",
    category: "conteudo",
    thumbnail: "🖼️",
    preview: "linear-gradient(90deg, #dbeafe 50%, #ffffff 50%)",
    background: "#ffffff",
    blocks: [],
  },
  {
    id: "text_image_right",
    name: "Imagem à Direita",
    category: "conteudo",
    thumbnail: "📸",
    preview: "linear-gradient(90deg, #ffffff 50%, #dbeafe 50%)",
    background: "#ffffff",
    blocks: [],
  },
  {
    id: "full_image",
    name: "Imagem Full Screen",
    category: "conteudo",
    thumbnail: "🌅",
    preview: "linear-gradient(135deg, #93c5fd, #60a5fa)",
    background: "#60a5fa",
    blocks: [],
  },
  {
    id: "quote_citation",
    name: "Citação/Quote",
    category: "conteudo",
    thumbnail: "💬",
    preview: "linear-gradient(135deg, #f0f4ff, #e8eef7)",
    background: "#f0f4ff",
    blocks: [],
  },
  // Dados
  {
    id: "statistics_big",
    name: "Estatísticas em Destaque",
    category: "dados",
    thumbnail: "📊",
    preview: "linear-gradient(135deg, #fafafa, #f5f5f5)",
    background: "#ffffff",
    blocks: [],
  },
  {
    id: "comparison_two",
    name: "Comparação Dupla",
    category: "dados",
    thumbnail: "⚖️",
    preview: "linear-gradient(90deg, #eff6ff 50%, #fef3c7 50%)",
    background: "#ffffff",
    blocks: [],
  },
  {
    id: "comparison_three",
    name: "Comparação Tripla",
    category: "dados",
    thumbnail: "🔀",
    preview: "linear-gradient(135deg, #dbeafe, #fde047)",
    background: "#ffffff",
    blocks: [],
  },
  {
    id: "process_steps",
    name: "Passos do Processo",
    category: "dados",
    thumbnail: "📋",
    preview: "linear-gradient(135deg, #f8fafc, #e5e7eb)",
    background: "#ffffff",
    blocks: [],
  },
  // Interativo
  {
    id: "quiz_intro",
    name: "Introdução Quiz",
    category: "interativo",
    thumbnail: "❓",
    preview: "linear-gradient(135deg, #fef3c7, #fde68a)",
    background: "#fef3c7",
    blocks: [],
  },
  {
    id: "knowledge_check",
    name: "Verificação de Conhecimento",
    category: "interativo",
    thumbnail: "✅",
    preview: "linear-gradient(135deg, #dbeafe, #c7d2fe)",
    background: "#f0fdf4",
    blocks: [],
  },
  {
    id: "activity_description",
    name: "Descrição de Atividade",
    category: "interativo",
    thumbnail: "🎬",
    preview: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
    background: "#dbeafe",
    blocks: [],
  },
  // Encerramento
  {
    id: "thank_you",
    name: "Obrigado",
    category: "encerramento",
    thumbnail: "🙏",
    preview: "linear-gradient(135deg, #0f172a, #1e293b)",
    background: "#0f172a",
    blocks: [],
  },
  {
    id: "summary",
    name: "Resumo",
    category: "encerramento",
    thumbnail: "📌",
    preview: "linear-gradient(135deg, #f8fafc, #e2e8f0)",
    background: "#ffffff",
    blocks: [],
  },
  {
    id: "call_to_action",
    name: "Call to Action",
    category: "encerramento",
    thumbnail: "🚀",
    preview: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    blocks: [],
  },
  {
    id: "contact_info",
    name: "Informações de Contato",
    category: "encerramento",
    thumbnail: "📧",
    preview: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
    background: "#f8fafc",
    blocks: [],
  },
];

export function SlideTemplatesDialog() {
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const getCurrentProject = useEditorStore((s) => s.getCurrentProject);
  const addSlide = useEditorStore((s) => s.addSlide);
  const setCurrentSlide = useEditorStore((s) => s.setCurrentSlide);
  const updateSlideBackground = useEditorStore((s) => s.updateSlideBackground);
  const addBlock = useEditorStore((s) => s.addBlock);
  const addBlocks = useEditorStore((s) => s.addBlocks);

  const handleApply = () => {
    // Find template in SLIDE_TEMPLATES
    const slideTemplate = SLIDE_TEMPLATES.find((t) => t.id === selectedTemplate);
    // Find template in local TEMPLATES for background
    const displayTemplate = TEMPLATES.find((t) => t.id === selectedTemplate);

    const project = getCurrentProject();
    if (!slideTemplate || !displayTemplate || !project) return;

    // Create new slide
    addSlide(project.id);

    // Get the newly created slide (last one)
    const updatedProject = getCurrentProject();
    if (!updatedProject) return;
    const newSlide = updatedProject.slides[updatedProject.slides.length - 1];

    // Set background
    updateSlideBackground(project.id, newSlide.id, displayTemplate.background);

    // Generate and add all blocks atomically (single undo entry)
    const blocks = slideTemplate.generateBlocks();
    if (blocks.length > 0) {
      addBlocks(project.id, newSlide.id, blocks);
    }

    // Navigate to new slide
    setCurrentSlide(newSlide.id);

    setOpen(false);
    setSelectedTemplate(null);
    toast.success(`Template "${slideTemplate.name}" aplicado!`);
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
      <DialogContent className="sm:max-w-4xl" style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-slate-200">
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <LayoutTemplate className="h-5 w-5 text-purple-600" />
            Galeria de Templates
          </DialogTitle>
          <button
            onClick={() => setOpen(false)}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </DialogHeader>

        {/* Search Bar */}
        <div className="flex gap-3 items-center pt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar templates por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-9 text-sm rounded-lg bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 pt-3 border-b border-slate-200">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2",
                activeCategory === cat.id
                  ? "bg-purple-100 text-purple-700 border border-purple-300"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
              )}
            >
              <span className="text-base">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <ScrollArea className="h-[450px] rounded-lg border border-slate-200">
          <div className="grid grid-cols-4 gap-3 p-4">
            {TEMPLATES
              .filter((t) => {
                const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
                const matchesCategory = activeCategory === "all" || t.category === activeCategory;
                return matchesSearch && matchesCategory;
              })
              .map((template) => (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={cn(
                  "group relative rounded-lg border-2 overflow-hidden cursor-pointer transition-all hover:shadow-md",
                  selectedTemplate === template.id
                    ? "ring-2 ring-purple-500 border-purple-500 scale-[1.02] shadow-lg"
                    : "border-slate-200 hover:border-purple-300"
                )}
              >
                {/* Preview Background */}
                <div
                  className="aspect-video w-full flex items-center justify-center relative"
                  style={{ background: template.preview }}
                >
                  {/* Thumbnail Icon */}
                  <div className="text-4xl opacity-60 group-hover:opacity-100 transition-opacity">
                    {template.thumbnail}
                  </div>

                  {/* Mini block indicators from SLIDE_TEMPLATES */}
                  <div className="absolute inset-0 pointer-events-none">
                    {(() => {
                      const st = SLIDE_TEMPLATES.find((s) => s.id === template.id);
                      if (!st) return null;
                      const previewBlocks = st.generateBlocks();
                      return previewBlocks.map((block, i) => (
                        <div
                          key={i}
                          className="absolute rounded-[1px]"
                          style={{
                            left: `${(block.x / CANVAS_WIDTH) * 100}%`,
                            top: `${(block.y / CANVAS_HEIGHT) * 100}%`,
                            width: `${(block.width / CANVAS_WIDTH) * 100}%`,
                            height: `${(block.height / CANVAS_HEIGHT) * 100}%`,
                            backgroundColor:
                              block.type === "text" ? "rgba(99,102,241,0.25)" :
                              block.type === "image" ? "rgba(59,130,246,0.2)" :
                              block.type === "shape" ? ((block as unknown as Record<string, unknown>).fillColor as string || "rgba(99,102,241,0.15)") :
                              "rgba(0,0,0,0.05)",
                            opacity: block.type === "shape" ? 0.4 : 1,
                          }}
                        />
                      ));
                    })()}
                  </div>
                </div>

                {/* Info Section */}
                <div className="px-3 py-2.5 bg-white border-t border-slate-200">
                  <p className="text-xs font-semibold text-slate-900 truncate">{template.name}</p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    {template.category}
                  </p>
                </div>

                {/* Selected Checkmark */}
                {selectedTemplate === template.id && (
                  <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full p-1.5 shadow-lg">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-lg" />
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            {TEMPLATES.filter((t) => {
              const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
              const matchesCategory = activeCategory === "all" || t.category === activeCategory;
              return matchesSearch && matchesCategory;
            }).length}{" "}
            template{TEMPLATES.filter((t) => {
              const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
              const matchesCategory = activeCategory === "all" || t.category === activeCategory;
              return matchesSearch && matchesCategory;
            }).length !== 1 ? "s" : ""} disponível{TEMPLATES.filter((t) => {
              const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
              const matchesCategory = activeCategory === "all" || t.category === activeCategory;
              return matchesSearch && matchesCategory;
            }).length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-sm border-slate-300 text-slate-700 hover:bg-slate-50"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              className="h-8 text-sm bg-purple-600 hover:bg-purple-700 text-white"
              onClick={handleApply}
              disabled={!selectedTemplate}
            >
              <Check className="h-4 w-4 mr-1.5" />
              Criar Slide
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
