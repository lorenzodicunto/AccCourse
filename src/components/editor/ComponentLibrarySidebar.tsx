"use client";

import { useState } from "react";
import { useEditorStore, Block } from "@/store/useEditorStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Type,
  Image,
  CreditCard,
  HelpCircle,
  Play,
  Hexagon,
  Music,
  CheckCircle2,
  Link2,
  PenLine,
  ArrowUpDown,
  MousePointer,
  ChevronDown,
  PanelTop,
  GitBranch,
  Clock,
  GripVertical,
  Video,
  Search,
  X,
  Sparkles,
  Layers,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ComponentItem {
  type: Block["type"];
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  category: string;
}

const CATEGORIES = [
  { id: "all", label: "Todos", icon: <Layers className="h-3.5 w-3.5" /> },
  { id: "basico", label: "Básico", icon: <Type className="h-3.5 w-3.5" /> },
  { id: "media", label: "Mídia", icon: <Image className="h-3.5 w-3.5" /> },
  { id: "interacao", label: "Interações", icon: <Sparkles className="h-3.5 w-3.5" /> },
  { id: "avancado", label: "Avançado", icon: <GitBranch className="h-3.5 w-3.5" /> },
];

const COMPONENTS: ComponentItem[] = [
  { type: "text", label: "Texto", description: "Bloco de texto editável", icon: <Type className="h-5 w-5" />, color: "#7C3AED", category: "basico" },
  { type: "image", label: "Imagem", description: "Upload ou URL de imagem", icon: <Image className="h-5 w-5" />, color: "#3B82F6", category: "media" },
  { type: "video", label: "Vídeo", description: "Player de vídeo embed", icon: <Play className="h-5 w-5" />, color: "#F97316", category: "media" },
  { type: "shape", label: "Forma", description: "Retângulo, círculo, linha", icon: <Hexagon className="h-5 w-5" />, color: "#6366F1", category: "basico" },
  { type: "audio", label: "Áudio", description: "Player de áudio", icon: <Music className="h-5 w-5" />, color: "#8B5CF6", category: "media" },
  { type: "quiz", label: "Quiz", description: "Múltipla escolha", icon: <HelpCircle className="h-5 w-5" />, color: "#EF4444", category: "interacao" },
  { type: "flashcard", label: "Flashcard", description: "Frente e verso interativo", icon: <CreditCard className="h-5 w-5" />, color: "#10B981", category: "interacao" },
  { type: "truefalse", label: "V ou F", description: "Verdadeiro ou Falso", icon: <CheckCircle2 className="h-5 w-5" />, color: "#059669", category: "interacao" },
  { type: "matching", label: "Associação", description: "Conectar pares", icon: <Link2 className="h-5 w-5" />, color: "#3B82F6", category: "interacao" },
  { type: "fillblank", label: "Preencher", description: "Complete a lacuna", icon: <PenLine className="h-5 w-5" />, color: "#D97706", category: "interacao" },
  { type: "sorting", label: "Ordenação", description: "Ordenar itens", icon: <ArrowUpDown className="h-5 w-5" />, color: "#7C3AED", category: "interacao" },
  { type: "hotspot", label: "Hotspot", description: "Pontos clicáveis em imagem", icon: <MousePointer className="h-5 w-5" />, color: "#06B6D4", category: "interacao" },
  { type: "accordion", label: "Acordeão", description: "Seções expansíveis", icon: <ChevronDown className="h-5 w-5" />, color: "#64748B", category: "avancado" },
  { type: "tabs", label: "Abas", description: "Conteúdo em abas", icon: <PanelTop className="h-5 w-5" />, color: "#6366F1", category: "avancado" },
  { type: "branching", label: "Cenário", description: "Cenário ramificado", icon: <GitBranch className="h-5 w-5" />, color: "#EF4444", category: "avancado" },
  { type: "timeline", label: "Linha do Tempo", description: "Eventos cronológicos", icon: <Clock className="h-5 w-5" />, color: "#0EA5E9", category: "avancado" },
  { type: "dragdrop", label: "Drag & Drop", description: "Arrastar para categorias", icon: <GripVertical className="h-5 w-5" />, color: "#14B8A6", category: "avancado" },
  { type: "interactiveVideo", label: "Vídeo Interativo", description: "Vídeo com quiz points", icon: <Video className="h-5 w-5" />, color: "#F97316", category: "avancado" },
];

interface ComponentLibrarySidebarProps {
  open: boolean;
  onClose: () => void;
}

export function ComponentLibrarySidebar({ open, onClose }: ComponentLibrarySidebarProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const getCurrentProject = useEditorStore((s) => s.getCurrentProject);
  const getCurrentSlide = useEditorStore((s) => s.getCurrentSlide);
  const addBlock = useEditorStore((s) => s.addBlock);

  const project = getCurrentProject();
  const slide = getCurrentSlide();

  const filteredComponents = COMPONENTS.filter((comp) => {
    const matchesSearch =
      comp.label.toLowerCase().includes(search.toLowerCase()) ||
      comp.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || comp.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddComponent = (comp: ComponentItem) => {
    if (!project || !slide) {
      toast.error("Selecione um slide primeiro.");
      return;
    }

    // Dispatch to the existing handleAddBlock logic in TopToolbar
    // We create a minimal block and let the store handle defaults
    const baseBlock = {
      id: crypto.randomUUID(),
      x: 80 + Math.random() * 200,
      y: 60 + Math.random() * 100,
      zIndex: slide.blocks.length,
    };

    let newBlock: Block;
    switch (comp.type) {
      case "text":
        newBlock = { ...baseBlock, type: "text", width: 300, height: 40, content: "Digite seu texto...", fontSize: 18, fontWeight: "normal", fontStyle: "normal", textDecorationLine: "none", color: "#1a1a2e", textAlign: "left", lineHeight: 1.5, letterSpacing: 0, textShadow: "none", backgroundColor: "transparent", borderRadius: 0, opacity: 1, listType: "none" };
        break;
      case "image":
        newBlock = { ...baseBlock, type: "image", width: 300, height: 200, src: "", alt: "Imagem", objectFit: "cover", opacity: 1, borderRadius: 12, borderWidth: 0, borderColor: "#e2e8f0", boxShadow: "none" };
        break;
      case "flashcard":
        newBlock = { ...baseBlock, type: "flashcard", width: 320, height: 200, frontContent: "Frente do Flashcard", backContent: "Verso do Flashcard", frontBg: "#7c3aed", backBg: "#4f46e5" };
        break;
      case "quiz":
        newBlock = { ...baseBlock, type: "quiz", width: 450, height: 280, question: "Qual é a resposta correta?", options: [{ id: crypto.randomUUID(), text: "Opção A", isCorrect: true }, { id: crypto.randomUUID(), text: "Opção B", isCorrect: false }, { id: crypto.randomUUID(), text: "Opção C", isCorrect: false }], feedback: { correct: "Parabéns!", incorrect: "Tente novamente." }, pointsValue: 10 };
        break;
      case "video":
        newBlock = { ...baseBlock, type: "video", width: 480, height: 270, url: "", interactions: [] };
        break;
      case "shape":
        newBlock = { ...baseBlock, type: "shape", width: 200, height: 200, shapeType: "rectangle", fillColor: "#7c3aed", strokeColor: "#6d28d9", strokeWidth: 2, opacity: 1, rotation: 0 };
        break;
      case "audio":
        newBlock = { ...baseBlock, type: "audio", width: 300, height: 80, src: "", autoplay: false, loop: false, showControls: true };
        break;
      case "truefalse":
        newBlock = { ...baseBlock, type: "truefalse", width: 600, height: 200, statement: "A Terra é redonda", isTrue: true, feedbackCorrect: "Correto!", feedbackIncorrect: "Incorreto!", pointsValue: 10 };
        break;
      case "matching":
        newBlock = { ...baseBlock, type: "matching", width: 600, height: 300, pairs: [{ id: crypto.randomUUID(), left: "Item A", right: "Par A" }, { id: crypto.randomUUID(), left: "Item B", right: "Par B" }], feedbackCorrect: "Correto!", feedbackIncorrect: "Tente novamente.", pointsValue: 10, shuffleRight: true };
        break;
      case "fillblank":
        newBlock = { ...baseBlock, type: "fillblank", width: 600, height: 150, segments: [{ type: "text" as const, content: "A capital do Brasil é " }, { type: "blank" as const, id: crypto.randomUUID(), correctAnswer: "Brasília", acceptedVariants: ["brasilia"] }, { type: "text" as const, content: "." }], caseSensitive: false, feedbackCorrect: "Correto!", feedbackIncorrect: "Tente novamente.", pointsValue: 10 };
        break;
      case "sorting":
        newBlock = { ...baseBlock, type: "sorting", width: 400, height: 300, items: [{ id: crypto.randomUUID(), content: "Item 1" }, { id: crypto.randomUUID(), content: "Item 2" }, { id: crypto.randomUUID(), content: "Item 3" }], correctOrder: [], feedbackCorrect: "Ordem correta!", feedbackIncorrect: "Tente novamente.", pointsValue: 10 };
        break;
      case "hotspot":
        newBlock = { ...baseBlock, type: "hotspot", width: 600, height: 400, imageSrc: "", spots: [], mode: "explore", pointsValue: 10 };
        break;
      case "accordion":
        newBlock = { ...baseBlock, type: "accordion", width: 600, height: 300, sections: [{ id: crypto.randomUUID(), title: "Seção 1", content: "Conteúdo da seção 1" }, { id: crypto.randomUUID(), title: "Seção 2", content: "Conteúdo da seção 2" }], allowMultipleOpen: false, style: "boxed" };
        break;
      case "tabs":
        newBlock = { ...baseBlock, type: "tabs", width: 600, height: 300, tabs: [{ id: crypto.randomUUID(), label: "Aba 1", content: "Conteúdo da aba 1" }, { id: crypto.randomUUID(), label: "Aba 2", content: "Conteúdo da aba 2" }], orientation: "horizontal", style: "underline" };
        break;
      case "branching":
        newBlock = { ...baseBlock, type: "branching", width: 700, height: 350, scenario: "O que fazer?", choices: [{ id: crypto.randomUUID(), text: "Opção 1", targetSlideId: "", feedback: "Feedback", isCorrect: true }, { id: crypto.randomUUID(), text: "Opção 2", targetSlideId: "", feedback: "Feedback", isCorrect: false }], pointsValue: 10 };
        break;
      case "timeline":
        newBlock = { ...baseBlock, type: "timeline", width: 800, height: 200, events: [{ id: crypto.randomUUID(), date: "2024", title: "Evento", description: "Descrição", icon: "📌" }], orientation: "horizontal", style: "detailed" };
        break;
      case "dragdrop":
        newBlock = { ...baseBlock, type: "dragdrop", width: 700, height: 350, categories: [{ id: crypto.randomUUID(), label: "Cat A" }, { id: crypto.randomUUID(), label: "Cat B" }], items: [{ id: crypto.randomUUID(), content: "Item 1", correctCategoryId: "" }], feedbackCorrect: "Correto!", feedbackIncorrect: "Tente novamente.", pointsValue: 10 };
        break;
      case "interactiveVideo":
        newBlock = { ...baseBlock, type: "interactiveVideo", width: 640, height: 360, src: "", poster: "", chapters: [], quizPoints: [], bookmarks: [], autoplay: false, loop: false };
        break;
      default:
        return;
    }

    addBlock(project.id, slide.id, newBlock);
    toast.success(`${comp.label} adicionado!`);
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-[320px] flex flex-col transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          background: '#1E293B',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          boxShadow: open ? '16px 0 48px rgba(0,0,0,0.4)' : 'none',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(124, 58, 237, 0.15)' }}>
              <Layers className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Componentes</h3>
              <p className="text-[10px] text-slate-500">{COMPONENTS.length} disponíveis</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="px-3 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <Input
              placeholder="Buscar componentes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs rounded-lg bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500/30"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 px-3 pb-2 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all cursor-pointer",
                activeCategory === cat.id
                  ? "bg-purple-500/20 text-purple-300"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-300"
              )}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Components List */}
        <ScrollArea className="flex-1">
          <div className="px-3 pb-3 space-y-1">
            {filteredComponents.map((comp) => (
              <button
                key={comp.type}
                onClick={() => handleAddComponent(comp)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-white/5 group cursor-pointer text-left"
              >
                <div
                  className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110"
                  style={{ background: `${comp.color}15`, color: comp.color }}
                >
                  {comp.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white group-hover:text-purple-300 transition-colors">
                    {comp.label}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {comp.description}
                  </p>
                </div>
                <ChevronRight className="h-3 w-3 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </button>
            ))}

            {filteredComponents.length === 0 && (
              <div className="text-center py-8">
                <Search className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                <p className="text-xs text-slate-500">Nenhum componente encontrado</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer tip */}
        <div className="px-4 py-2.5 border-t border-white/5">
          <p className="text-[10px] text-slate-500 text-center">
            Clique em um componente para adicioná-lo ao slide
          </p>
        </div>
      </div>
    </>
  );
}
