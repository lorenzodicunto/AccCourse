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
  Gamepad2,
  Brain,
  BookA,
  MapPin,
  ListOrdered,
  Maximize,
  Quote,
  Download,
  Hash,
  MousePointerClick,
  Minus,
  Code,
  BarChart3,
  FileText,
  Calculator,
  Grid3x3,
  User,
  Film,
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
  { id: "texto", label: "Texto & Mídia", icon: <Type className="h-3.5 w-3.5" /> },
  { id: "avaliacoes", label: "Avaliações", icon: <HelpCircle className="h-3.5 w-3.5" /> },
  { id: "jogos", label: "Jogos", icon: <Gamepad2 className="h-3.5 w-3.5" /> },
  { id: "apresentacao", label: "Apresentação", icon: <PanelTop className="h-3.5 w-3.5" /> },
  { id: "avancado", label: "Avançado", icon: <Sparkles className="h-3.5 w-3.5" /> },
];

const COMPONENTS: ComponentItem[] = [
  { type: "text", label: "Texto", description: "Bloco de texto editável", icon: <Type className="h-5 w-5" />, color: "#7C3AED", category: "texto" },
  { type: "image", label: "Imagem", description: "Upload ou URL de imagem", icon: <Image className="h-5 w-5" />, color: "#3B82F6", category: "texto" },
  { type: "video", label: "Vídeo", description: "Player de vídeo embed", icon: <Play className="h-5 w-5" />, color: "#F97316", category: "texto" },
  { type: "shape", label: "Forma", description: "Retângulo, círculo, linha", icon: <Hexagon className="h-5 w-5" />, color: "#6366F1", category: "apresentacao" },
  { type: "audio", label: "Áudio", description: "Player de áudio", icon: <Music className="h-5 w-5" />, color: "#8B5CF6", category: "texto" },
  { type: "quiz", label: "Quiz", description: "Múltipla escolha", icon: <HelpCircle className="h-5 w-5" />, color: "#EF4444", category: "avaliacoes" },
  { type: "flashcard", label: "Flashcard", description: "Frente e verso interativo", icon: <CreditCard className="h-5 w-5" />, color: "#10B981", category: "avaliacoes" },
  { type: "truefalse", label: "V ou F", description: "Verdadeiro ou Falso", icon: <CheckCircle2 className="h-5 w-5" />, color: "#059669", category: "avaliacoes" },
  { type: "matching", label: "Associação", description: "Conectar pares", icon: <Link2 className="h-5 w-5" />, color: "#3B82F6", category: "avaliacoes" },
  { type: "fillblank", label: "Preencher", description: "Complete a lacuna", icon: <PenLine className="h-5 w-5" />, color: "#D97706", category: "avaliacoes" },
  { type: "sorting", label: "Ordenação", description: "Ordenar itens", icon: <ArrowUpDown className="h-5 w-5" />, color: "#7C3AED", category: "avaliacoes" },
  { type: "hotspot", label: "Hotspot", description: "Pontos clicáveis em imagem", icon: <MousePointer className="h-5 w-5" />, color: "#06B6D4", category: "apresentacao" },
  { type: "accordion", label: "Acordeão", description: "Seções expansíveis", icon: <ChevronDown className="h-5 w-5" />, color: "#64748B", category: "apresentacao" },
  { type: "tabs", label: "Abas", description: "Conteúdo em abas", icon: <PanelTop className="h-5 w-5" />, color: "#6366F1", category: "apresentacao" },
  { type: "branching", label: "Cenário", description: "Cenário ramificado", icon: <GitBranch className="h-5 w-5" />, color: "#EF4444", category: "avancado" },
  { type: "timeline", label: "Linha do Tempo", description: "Eventos cronológicos", icon: <Clock className="h-5 w-5" />, color: "#0EA5E9", category: "avancado" },
  { type: "dragdrop", label: "Drag & Drop", description: "Arrastar para categorias", icon: <GripVertical className="h-5 w-5" />, color: "#14B8A6", category: "avancado" },
  { type: "interactiveVideo", label: "Vídeo Interativo", description: "Vídeo com quiz points", icon: <Video className="h-5 w-5" />, color: "#F97316", category: "avancado" },
  { type: "game", label: "Trivia", description: "Jogo de perguntas e respostas", icon: <Gamepad2 className="h-5 w-5" />, color: "#8B5CF6", category: "jogos" },
  { type: "game", label: "Memória", description: "Jogo de memória com pares", icon: <Brain className="h-5 w-5" />, color: "#06B6D4", category: "jogos" },
  { type: "game", label: "Palavras", description: "Jogo de encontrar palavras", icon: <Type className="h-5 w-5" />, color: "#10B981", category: "jogos" },
  { type: "game", label: "Swipe", description: "Jogo de cards deslizáveis", icon: <Gamepad2 className="h-5 w-5" />, color: "#F59E0B", category: "jogos" },
  { type: "game", label: "Alfabeto", description: "Jogo de ordenação de letras", icon: <BookA className="h-5 w-5" />, color: "#EC4899", category: "jogos" },
  { type: "labeled-graphic", label: "Imagem Interativa", description: "Imagem com pontos clicáveis", icon: <MapPin className="h-5 w-5" />, color: "#0891B2", category: "apresentacao" },
  { type: "process", label: "Processo", description: "Passo a passo visual", icon: <ListOrdered className="h-5 w-5" />, color: "#059669", category: "apresentacao" },
  { type: "lightbox", label: "Lightbox", description: "Conteúdo em popup modal", icon: <Maximize className="h-5 w-5" />, color: "#7C3AED", category: "apresentacao" },
  { type: "quote", label: "Citação", description: "Bloco de citação estilizado", icon: <Quote className="h-5 w-5" />, color: "#D97706", category: "texto" },
  { type: "download", label: "Download", description: "Anexos para download", icon: <Download className="h-5 w-5" />, color: "#2563EB", category: "texto" },
  { type: "counter", label: "Contador", description: "Números animados", icon: <Hash className="h-5 w-5" />, color: "#DC2626", category: "apresentacao" },
  { type: "button", label: "Botão", description: "Botão de ação (link, slide)", icon: <MousePointerClick className="h-5 w-5" />, color: "#7C3AED", category: "apresentacao" },
  { type: "divider", label: "Divisor", description: "Linha separadora", icon: <Minus className="h-5 w-5" />, color: "#94A3B8", category: "apresentacao" },
  { type: "embed", label: "Embed", description: "Conteúdo externo (iframe)", icon: <Code className="h-5 w-5" />, color: "#0EA5E9", category: "avancado" },
  { type: "likert", label: "Likert", description: "Escala de opinião", icon: <BarChart3 className="h-5 w-5" />, color: "#8B5CF6", category: "avaliacoes" },
  { type: "ranking", label: "Ranking", description: "Ordenar itens por posição", icon: <ListOrdered className="h-5 w-5" />, color: "#0891B2", category: "avaliacoes" },
  { type: "essay", label: "Dissertativa", description: "Resposta livre em texto", icon: <FileText className="h-5 w-5" />, color: "#D97706", category: "avaliacoes" },
  { type: "numeric", label: "Numérico", description: "Resposta numérica com tolerância", icon: <Calculator className="h-5 w-5" />, color: "#059669", category: "avaliacoes" },
  { type: "dropdown", label: "Dropdown", description: "Preencher com menu dropdown", icon: <ChevronDown className="h-5 w-5" />, color: "#6366F1", category: "avaliacoes" },
  { type: "matrix", label: "Matriz", description: "Grid de múltipla escolha", icon: <Grid3x3 className="h-5 w-5" />, color: "#DC2626", category: "avaliacoes" },
  { type: "image-choice", label: "Escolha Visual", description: "Selecionar entre imagens", icon: <Image className="h-5 w-5" />, color: "#2563EB", category: "avaliacoes" },
  { type: "character", label: "Personagem", description: "Avatar com expressões e poses", icon: <User className="h-5 w-5" />, color: "#EC4899", category: "avancado" },
  { type: "scenario", label: "Cenário", description: "Diálogo interativo com personagem", icon: <Film className="h-5 w-5" />, color: "#F97316", category: "avancado" },
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

  // Group components by category for better visual hierarchy
  const groupedComponents = filteredComponents.reduce((acc, comp) => {
    if (!acc[comp.category]) {
      acc[comp.category] = [];
    }
    acc[comp.category].push(comp);
    return acc;
  }, {} as Record<string, ComponentItem[]>);

  // Define category order and names
  const categoryOrder = ["texto", "avaliacoes", "jogos", "apresentacao", "avancado"];
  const categoryLabels: Record<string, string> = {
    texto: "Texto & Mídia",
    avaliacoes: "Avaliações",
    jogos: "Jogos",
    apresentacao: "Apresentação",
    avancado: "Avançado",
  };

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
        newBlock = { ...baseBlock, type: "flashcard", width: 320, height: 200, frontContent: "Frente do Flashcard", backContent: "Verso do Flashcard", frontBg: "#7c3aed", backBg: "#4f46e5", frontColor: "#ffffff", backColor: "#ffffff" };
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
      case "labeled-graphic":
        newBlock = { ...baseBlock, type: "labeled-graphic", width: 600, height: 400, backgroundImage: "", markers: [], markerStyle: "pin", markerColor: "#7C3AED", popupPosition: "auto", completionRule: "none" };
        break;
      case "process":
        newBlock = { ...baseBlock, type: "process", width: 700, height: 200, steps: [{ id: crypto.randomUUID(), title: "Etapa 1", content: "Descrição da etapa", image: "", icon: "1" }, { id: crypto.randomUUID(), title: "Etapa 2", content: "Descrição da etapa", image: "", icon: "2" }, { id: crypto.randomUUID(), title: "Etapa 3", content: "Descrição da etapa", image: "", icon: "3" }], layout: "horizontal", style: "numbered", connectorStyle: "arrow", activeColor: "#7C3AED", interactive: true };
        break;
      case "lightbox":
        newBlock = { ...baseBlock, type: "lightbox", width: 200, height: 60, triggerType: "button", triggerLabel: "Saiba mais", triggerImage: "", modalTitle: "Título do Modal", modalContent: "Conteúdo do modal aqui...", modalImage: "", modalVideo: "", modalWidth: "medium", overlayColor: "rgba(0,0,0,0.5)" };
        break;
      case "quote":
        newBlock = { ...baseBlock, type: "quote", width: 500, height: 180, text: "Uma citação inspiradora vai aqui.", author: "Autor", authorTitle: "Cargo", authorImage: "", quoteStyle: "modern", accentColor: "#7C3AED", alignment: "left" };
        break;
      case "download":
        newBlock = { ...baseBlock, type: "download", width: 400, height: 200, files: [{ id: crypto.randomUUID(), name: "arquivo.pdf", url: "", size: 0, fileType: "pdf", description: "Descrição do arquivo" }], downloadStyle: "card", icon: "file" };
        break;
      case "counter":
        newBlock = { ...baseBlock, type: "counter", width: 600, height: 150, items: [{ id: crypto.randomUUID(), value: 100, prefix: "", suffix: "+", label: "Alunos", icon: "", color: "#7C3AED" }, { id: crypto.randomUUID(), value: 50, prefix: "", suffix: "%", label: "Aprovação", icon: "", color: "#059669" }], layout: "row", animationDuration: 2, counterStyle: "card" };
        break;
      case "button":
        newBlock = { ...baseBlock, type: "button", width: 200, height: 50, label: "Clique aqui", action: "link", url: "", targetSlideIndex: 0, downloadUrl: "", buttonStyle: "primary", size: "medium", icon: "", iconPosition: "left", fullWidth: false };
        break;
      case "divider":
        newBlock = { ...baseBlock, type: "divider", width: 600, height: 20, dividerStyle: "solid", color: "#CBD5E1", thickness: 2 };
        break;
      case "embed":
        newBlock = { ...baseBlock, type: "embed", width: 560, height: 315, url: "", title: "Conteúdo Incorporado", aspectRatio: "16:9", allowFullscreen: true };
        break;
      case "game":
        newBlock = { ...baseBlock, type: "game", width: 500, height: 400, gameType: "trivia", gameData: {}, title: "Novo Jogo" };
        break;
      case "likert":
        newBlock = { ...baseBlock, type: "likert", width: 650, height: 300, question: "Avalie as afirmações abaixo:", statements: [{ id: crypto.randomUUID(), text: "Afirmação 1" }, { id: crypto.randomUUID(), text: "Afirmação 2" }], scale: { labels: ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"], values: [1, 2, 3, 4, 5] }, required: true, points: 10 };
        break;
      case "ranking":
        newBlock = { ...baseBlock, type: "ranking", width: 500, height: 300, question: "Ordene os itens:", items: [{ id: crypto.randomUUID(), text: "Item 1", correctPosition: 1 }, { id: crypto.randomUUID(), text: "Item 2", correctPosition: 2 }, { id: crypto.randomUUID(), text: "Item 3", correctPosition: 3 }], shuffleOnLoad: true, showNumbers: true, partialCredit: true, points: 10, feedbackCorrect: "Ordem correta!", feedbackIncorrect: "Tente novamente." };
        break;
      case "essay":
        newBlock = { ...baseBlock, type: "essay", width: 600, height: 250, question: "Descreva sua resposta:", placeholder: "Digite aqui...", minWords: 10, maxWords: 500, showWordCount: true, rubric: "", sampleAnswer: "", autoGrade: false, points: 10, feedbackAfterSubmit: "Resposta enviada com sucesso!" };
        break;
      case "numeric":
        newBlock = { ...baseBlock, type: "numeric", width: 500, height: 200, question: "Qual é o resultado?", correctAnswer: 0, tolerance: 0.5, unit: "", decimalPlaces: 2, min: undefined, max: undefined, points: 10, feedbackCorrect: "Correto!", feedbackIncorrect: "Incorreto.", feedbackClose: "Quase! Tente novamente." };
        break;
      case "dropdown":
        newBlock = { ...baseBlock, type: "dropdown", width: 600, height: 200, question: "Complete as lacunas:", items: [{ id: crypto.randomUUID(), text: "A capital do Brasil é ", options: ["São Paulo", "Brasília", "Rio de Janeiro"], correctOption: "Brasília" }], points: 10, feedbackCorrect: "Correto!", feedbackIncorrect: "Tente novamente." };
        break;
      case "matrix":
        newBlock = { ...baseBlock, type: "matrix", width: 650, height: 350, question: "Selecione as respostas corretas:", rows: [{ id: crypto.randomUUID(), label: "Linha 1" }, { id: crypto.randomUUID(), label: "Linha 2" }], columns: [{ id: crypto.randomUUID(), label: "Coluna A" }, { id: crypto.randomUUID(), label: "Coluna B" }, { id: crypto.randomUUID(), label: "Coluna C" }], inputType: "radio", correctAnswers: {}, points: 10, feedbackCorrect: "Correto!", feedbackIncorrect: "Tente novamente." };
        break;
      case "image-choice":
        newBlock = { ...baseBlock, type: "image-choice", width: 600, height: 400, question: "Selecione a imagem correta:", choices: [{ id: crypto.randomUUID(), image: "", label: "Opção 1", isCorrect: true }, { id: crypto.randomUUID(), image: "", label: "Opção 2", isCorrect: false }], multiSelect: false, columns: 2, showLabels: true, points: 10, feedbackCorrect: "Correto!", feedbackIncorrect: "Tente novamente." };
        break;
      case "character":
        newBlock = { ...baseBlock, type: "character", width: 250, height: 350, characterId: "", currentPose: "standing", currentExpression: "neutral", speechBubble: undefined, mirrorHorizontal: false, scale: 1 };
        break;
      case "scenario":
        newBlock = { ...baseBlock, type: "scenario", width: 700, height: 400, scenes: [{ id: crypto.randomUUID(), backgroundImage: "", character: undefined, narration: "Cena inicial do cenário.", choices: [{ id: crypto.randomUUID(), text: "Opção 1", nextSceneId: "", feedback: "", isCorrect: true, points: 10 }] }], startSceneId: "", scenarioStyle: "visual-novel" };
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
          background: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          boxShadow: open ? '16px 0 48px rgba(0,0,0,0.08)' : 'none',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(124, 58, 237, 0.1)' }}>
              <Layers className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Biblioteca</h3>
              <p className="text-[10px] text-slate-500">{COMPONENTS.length} disponíveis</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="px-3 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
            <Input
              placeholder="Buscar componentes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
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
                  ? "bg-purple-100 text-purple-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-700"
              )}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Components List */}
        <ScrollArea className="flex-1">
          <div className="pb-3">
            {filteredComponents.length === 0 ? (
              <div className="text-center py-8">
                <Search className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                <p className="text-xs text-slate-500">Nenhum componente encontrado</p>
              </div>
            ) : (
              categoryOrder.map((categoryId) => {
                const components = groupedComponents[categoryId];
                if (!components || components.length === 0) return null;

                return (
                  <div key={categoryId}>
                    {/* Category Header */}
                    <div className="px-3 pt-3 pb-1.5 border-t border-slate-200 first:border-t-0 first:pt-0">
                      <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        {categoryLabels[categoryId]}
                      </h4>
                    </div>
                    {/* Components in Category */}
                    <div className="px-3 space-y-1 pb-2">
                      {components.map((comp) => (
                        <button
                          key={comp.type}
                          onClick={() => handleAddComponent(comp)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 group cursor-pointer text-left"
                        >
                          <div
                            className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110"
                            style={{ background: `${comp.color}15`, color: comp.color }}
                          >
                            {comp.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-900 group-hover:text-purple-700 transition-colors">
                              {comp.label}
                            </p>
                            <p className="text-[10px] text-slate-600 truncate">
                              {comp.description}
                            </p>
                          </div>
                          <ChevronRight className="h-3 w-3 text-slate-600 group-hover:text-purple-600 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Footer tip */}
        <div className="px-4 py-2.5 border-t border-slate-200">
          <p className="text-[10px] text-slate-500 text-center">
            Clique em um componente para adicioná-lo ao slide
          </p>
        </div>
      </div>
    </>
  );
}
