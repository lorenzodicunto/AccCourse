"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, FileText, Accessibility, PenLine, Image, HelpCircle, Wand2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useEditorStore } from "@/store/useEditorStore";

interface AiToolsPanelProps {
  projectId: string;
}

export function AiToolsPanel({ projectId }: AiToolsPanelProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("outline");
  const [loading, setLoading] = useState(false);

  // Outline form state
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("Learners");
  const [duration, setDuration] = useState("4 hours");
  const [style, setStyle] = useState("interactive");
  const [includeQuizzes, setIncludeQuizzes] = useState(true);
  const [includeGames, setIncludeGames] = useState(true);

  // Rewrite form state
  const [rewriteContent, setRewriteContent] = useState("");
  const [rewriteAudience, setRewriteAudience] = useState("adults");
  const [rewriteLevel, setRewriteLevel] = useState("intermediate");
  const [rewriteTone, setRewriteTone] = useState("friendly");
  const [rewriteResult, setRewriteResult] = useState("");

  // Image describe form state
  const [imageUrl, setImageUrl] = useState("");
  const [imageContext, setImageContext] = useState("");
  const [describeResult, setDescribeResult] = useState("");

  // Quiz form state
  const [quizCount, setQuizCount] = useState(5);
  const [quizDifficulty, setQuizDifficulty] = useState("medium");
  const [quizResult, setQuizResult] = useState("");

  const projects = useEditorStore((s) => s.projects);
  const addSlide = useEditorStore((s) => s.addSlide);
  const addBlock = useEditorStore((s) => s.addBlock);

  async function handleGenerateOutline() {
    if (topic.trim().length === 0) {
      toast.error("Digite o tópico do curso.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          audience,
          duration,
          style,
          includeQuizzes,
          includeGames,
          language: "pt-BR",
        }),
      });

      if (!res.ok) throw new Error("Erro na API");

      const data = await res.json();
      console.log("Outline gerado:", data);
      toast.success("Esboço do curso gerado com sucesso!");
      setTopic("");
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar esboço do curso.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAnalyzeAccessibility() {
    setLoading(true);
    try {
      const project = projects.find((p) => p.id === projectId);
      if (!project) throw new Error("Projeto não encontrado");

      const courseData = {
        title: project.title,
        slides: project.slides,
      };

      const res = await fetch("/api/ai/accessibility-fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseData,
          fixTypes: ["all"],
        }),
      });

      if (!res.ok) throw new Error("Erro na API");

      const data = await res.json();
      console.log("Análise de acessibilidade:", data);
      toast.success(`${data.totalIssues} problemas encontrados. Verifique o console.`);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao analisar acessibilidade.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRewriteContent() {
    if (rewriteContent.trim().length === 0) {
      toast.error("Digite o conteúdo para reescrever.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: rewriteContent,
          targetAudience: rewriteAudience,
          targetLevel: rewriteLevel,
          tone: rewriteTone,
          preserveKeyTerms: true,
        }),
      });

      if (!res.ok) throw new Error("Erro na API");

      const data = await res.json();
      setRewriteResult(data.rewritten);
      toast.success("Conteúdo reescrito com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao reescrever conteúdo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDescribeImage() {
    if (imageUrl.trim().length === 0) {
      toast.error("Digite a URL da imagem.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/describe-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          context: imageContext,
          language: "pt-BR",
          maxLength: 200,
        }),
      });

      if (!res.ok) throw new Error("Erro na API");

      const data = await res.json();
      setDescribeResult(data.description);
      toast.success("Descrição da imagem gerada com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao descrever imagem.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateQuiz() {
    setLoading(true);
    try {
      const project = projects.find((p) => p.id === projectId);
      if (!project) throw new Error("Projeto não encontrado");

      const slides = project.slides.map((s) => ({
        content: s.blocks?.map((b) => (b as any).content || "").join(" "),
      }));

      const res = await fetch("/api/ai/quiz-from-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slides,
          questionTypes: ["multiple_choice", "true_false"],
          count: quizCount,
          difficulty: quizDifficulty,
          language: "pt-BR",
        }),
      });

      if (!res.ok) throw new Error("Erro na API");

      const data = await res.json();
      console.log("Quiz gerado:", data);
      toast.success(`Quiz gerado com ${data.questions.length} questões!`);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar quiz do conteúdo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="gap-2" />}>
        <Sparkles className="w-4 h-4" />
        Ferramentas IA
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            Ferramentas IA Avançadas
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="outline" className="text-xs gap-1">
              <FileText className="w-3 h-3" />
              <span className="hidden sm:inline">Esboço</span>
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="text-xs gap-1">
              <Accessibility className="w-3 h-3" />
              <span className="hidden sm:inline">Acessibilidade</span>
            </TabsTrigger>
            <TabsTrigger value="rewrite" className="text-xs gap-1">
              <PenLine className="w-3 h-3" />
              <span className="hidden sm:inline">Reescrever</span>
            </TabsTrigger>
            <TabsTrigger value="image" className="text-xs gap-1">
              <Image className="w-3 h-3" />
              <span className="hidden sm:inline">Imagem</span>
            </TabsTrigger>
            <TabsTrigger value="quiz" className="text-xs gap-1">
              <HelpCircle className="w-3 h-3" />
              <span className="hidden sm:inline">Quiz</span>
            </TabsTrigger>
          </TabsList>

          {/* Gerar Outline Tab */}
          <TabsContent value="outline" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Tópico do Curso *</Label>
              <Input
                placeholder="Ex: Python para Iniciantes"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Público-Alvo</Label>
              <Input
                placeholder="Ex: Estudantes de programação"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Duração Estimada</Label>
              <Input
                placeholder="Ex: 4 horas"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Estilo</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="conversational">Conversacional</SelectItem>
                  <SelectItem value="interactive">Interativo</SelectItem>
                  <SelectItem value="storytelling">Narrativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeQuizzes}
                  onChange={(e) => setIncludeQuizzes(e.target.checked)}
                />
                <span className="text-sm">Incluir Quizzes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeGames}
                  onChange={(e) => setIncludeGames(e.target.checked)}
                />
                <span className="text-sm">Incluir Jogos</span>
              </label>
            </div>

            <Button onClick={handleGenerateOutline} disabled={loading} className="w-full gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Gerando..." : "Gerar Esboço"}
            </Button>
          </TabsContent>

          {/* Corrigir Acessibilidade Tab */}
          <TabsContent value="accessibility" className="space-y-4 mt-4">
            <p className="text-sm text-gray-600">
              Analise seu curso para problemas de acessibilidade (WCAG 2.1)
            </p>

            <Button onClick={handleAnalyzeAccessibility} disabled={loading} className="w-full gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Analisando..." : "Analisar Acessibilidade"}
            </Button>

            <div className="p-3 bg-blue-50 rounded text-sm text-blue-700">
              <p>Os problemas encontrados serão exibidos no console do navegador.</p>
            </div>
          </TabsContent>

          {/* Reescrever Conteúdo Tab */}
          <TabsContent value="rewrite" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Conteúdo para Reescrever *</Label>
              <Textarea
                placeholder="Cole o texto que deseja reescrever..."
                value={rewriteContent}
                onChange={(e) => setRewriteContent(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Público-Alvo</Label>
              <Select value={rewriteAudience} onValueChange={setRewriteAudience}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="children">Crianças</SelectItem>
                  <SelectItem value="teenagers">Adolescentes</SelectItem>
                  <SelectItem value="adults">Adultos</SelectItem>
                  <SelectItem value="professionals">Profissionais</SelectItem>
                  <SelectItem value="academic">Acadêmico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Nível</Label>
                <Select value={rewriteLevel} onValueChange={setRewriteLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Iniciante</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tom</Label>
                <Select value={rewriteTone} onValueChange={setRewriteTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="friendly">Amigável</SelectItem>
                    <SelectItem value="technical">Técnico</SelectItem>
                    <SelectItem value="narrative">Narrativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleRewriteContent} disabled={loading} className="w-full gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Reescrevendo..." : "Reescrever Conteúdo"}
            </Button>

            {rewriteResult && (
              <div className="p-3 bg-green-50 rounded border border-green-200">
                <p className="text-sm font-medium text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Resultado:
                </p>
                <p className="text-sm text-green-800">{rewriteResult}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(rewriteResult);
                    toast.success("Copiado para a área de transferência!");
                  }}
                  className="mt-2"
                >
                  Copiar
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Descrever Imagem Tab */}
          <TabsContent value="image" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>URL da Imagem *</Label>
              <Input
                placeholder="https://exemplo.com/imagem.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Contexto (opcional)</Label>
              <Input
                placeholder="Ex: Diagrama de arquitetura de sistema"
                value={imageContext}
                onChange={(e) => setImageContext(e.target.value)}
              />
            </div>

            <Button onClick={handleDescribeImage} disabled={loading} className="w-full gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Descrevendo..." : "Gerar Descrição"}
            </Button>

            {describeResult && (
              <div className="p-3 bg-green-50 rounded border border-green-200">
                <p className="text-sm font-medium text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Texto Alt:
                </p>
                <p className="text-sm text-green-800">{describeResult}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(describeResult);
                    toast.success("Copiado para a área de transferência!");
                  }}
                  className="mt-2"
                >
                  Copiar
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Gerar Quiz Tab */}
          <TabsContent value="quiz" className="space-y-4 mt-4">
            <p className="text-sm text-gray-600">
              Gera questões automaticamente a partir do conteúdo dos seus slides.
            </p>

            <div className="space-y-2">
              <Label>Número de Questões</Label>
              <Input
                type="number"
                min="1"
                max="50"
                value={quizCount}
                onChange={(e) => setQuizCount(parseInt(e.target.value) || 5)}
              />
            </div>

            <div className="space-y-2">
              <Label>Nível de Dificuldade</Label>
              <Select value={quizDifficulty} onValueChange={setQuizDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Fácil</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="hard">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleGenerateQuiz} disabled={loading} className="w-full gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Gerando..." : "Gerar Quiz"}
            </Button>

            <div className="p-3 bg-blue-50 rounded text-sm text-blue-700">
              <p>O quiz será gerado a partir do conteúdo dos seus slides atuais.</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
