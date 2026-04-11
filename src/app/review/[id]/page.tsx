"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import {
  getSharedCourse,
  registerReviewer,
  addComment,
  getSlideComments,
  toggleCommentStatus as toggleCommentStatusAction,
  deleteComment as deleteCommentAction,
} from "@/actions/review";
import type { CourseProject, Block, FlashcardBlock, QuizBlock, VideoBlock as VideoBlockType, VideoInteraction } from "@/store/useEditorStore";
import { sanitizeHtml } from "@/lib/sanitize";
import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });
import {
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Send,
  User,
  Mail,
  Loader2,
  CreditCard,
  HelpCircle,
  Upload,
  Play,
  CheckCircle,
  Check,
} from "lucide-react";

// ─── Types ───
interface ReviewerInfo {
  id: string;
  name: string;
}

interface CommentWithReviewer {
  id: string;
  text: string;
  slideId: string;
  createdAt: Date;
  status?: "pending" | "resolved";
  reviewer: { id: string; name: string; email: string };
}

// Helper function for relative time format
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "agora";
  if (diffMins < 60) return `há ${diffMins}m`;
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays === 1) return "ontem";
  if (diffDays < 7) return `há ${diffDays}d`;

  return date.toLocaleDateString("pt-BR");
}

export default function ReviewPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<CourseProject | null>(null);
  const [reviewer, setReviewer] = useState<ReviewerInfo | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [comments, setComments] = useState<CommentWithReviewer[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [commentStatuses, setCommentStatuses] = useState<Record<string, "pending" | "resolved">>({});

  // Gatekeeper form
  const [gkName, setGkName] = useState("");
  const [gkEmail, setGkEmail] = useState("");
  const [gkLoading, setGkLoading] = useState(false);

  // ─── Load course data ───
  useEffect(() => {
    async function load() {
      try {
        const data = await getSharedCourse(courseId);
        if (!data) {
          setError("Curso não encontrado.");
          setLoading(false);
          return;
        }
        const parsed = (typeof data.courseData === 'string' ? JSON.parse(data.courseData) : data.courseData) as CourseProject;
        setProject(parsed);

        // Check for existing reviewer in localStorage
        const stored = localStorage.getItem(`reviewer_${courseId}`);
        if (stored) {
          setReviewer(JSON.parse(stored));
        }
      } catch {
        setError("Erro ao carregar o curso.");
      }
      setLoading(false);
    }
    load();
  }, [courseId]);

  // ─── Load comments for current slide ───
  const slides = project
    ? [...project.slides].sort((a, b) => a.order - b.order)
    : [];
  const currentSlide = slides[currentSlideIndex] ?? null;

  const loadComments = useCallback(async () => {
    if (!currentSlide) return;
    try {
      const data = await getSlideComments(courseId, currentSlide.id);
      setComments(data.map((c: { createdAt: string | Date; [key: string]: unknown }) => ({
        ...c,
        createdAt: new Date(c.createdAt),
      })));
      // Initialize statuses from database
      const statuses: Record<string, "pending" | "resolved"> = {};
      data.forEach((c: { id: string; status?: string }) => {
        statuses[c.id] = (c.status === "resolved" ? "resolved" : "pending");
      });
      setCommentStatuses((prev) => ({ ...prev, ...statuses }));
    } catch {
      // silently fail
    }
  }, [courseId, currentSlide]);

  useEffect(() => {
    if (reviewer && currentSlide) {
      loadComments();
    }
  }, [reviewer, currentSlide, loadComments]);

  // ─── Gatekeeper Submit ───
  const handleGatekeeperSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gkName.trim() || !gkEmail.trim()) return;
    setGkLoading(true);
    try {
      const result = await registerReviewer(gkName.trim(), gkEmail.trim());
      const reviewerInfo = { id: result.id, name: result.name };
      setReviewer(reviewerInfo);
      localStorage.setItem(
        `reviewer_${courseId}`,
        JSON.stringify(reviewerInfo)
      );
    } catch {
      setError("Erro ao registrar revisor.");
    }
    setGkLoading(false);
  };

  // ─── Add Comment ───
  const handleAddComment = async () => {
    if (!newComment.trim() || !reviewer || !currentSlide || submitting) return;
    setSubmitting(true);
    try {
      const result = await addComment(
        courseId,
        currentSlide.id,
        reviewer.id,
        newComment.trim()
      );
      const newCommentObj = {
        ...result,
        createdAt: new Date(result.createdAt),
        status: "pending" as const,
      };
      setComments((prev) => [...prev, newCommentObj]);
      setCommentStatuses((prev) => ({ ...prev, [result.id]: "pending" }));
      setNewComment("");
    } catch {
      // silently fail
    }
    setSubmitting(false);
  };

  // ─── Toggle Comment Status (persisted) ───
  const toggleCommentStatus = async (commentId: string) => {
    // Optimistic update
    setCommentStatuses((prev) => ({
      ...prev,
      [commentId]: prev[commentId] === "resolved" ? "pending" : "resolved",
    }));
    try {
      await toggleCommentStatusAction(commentId);
    } catch {
      // Revert on error
      setCommentStatuses((prev) => ({
        ...prev,
        [commentId]: prev[commentId] === "resolved" ? "pending" : "resolved",
      }));
    }
  };

  // ─── Delete Comment ───
  const handleDeleteComment = async (commentId: string) => {
    if (!reviewer) return;
    try {
      await deleteCommentAction(commentId, reviewer.id);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      // silently fail — user might not own this comment
    }
  };

  // ─── Navigation ───
  const goNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  // ─── LOADING ───
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          <p className="text-sm text-gray-600 font-medium">
            Carregando curso...
          </p>
        </div>
      </div>
    );
  }

  // ─── ERROR ───
  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-sm">
          <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            {error || "Curso não encontrado"}
          </h2>
          <p className="text-sm text-gray-600">
            Verifique o link e tente novamente.
          </p>
        </div>
      </div>
    );
  }

  // ─── GATEKEEPER ───
  if (!reviewer) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl shadow-lg p-8 bg-white border border-gray-200">
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">
                {project.title}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Identifique-se para acessar e deixar comentários
              </p>
            </div>

            <form onSubmit={handleGatekeeperSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1.5">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={gkName}
                    onChange={(e) => setGkName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1.5">
                  E-mail Corporativo
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={gkEmail}
                    onChange={(e) => setGkEmail(e.target.value)}
                    placeholder="nome@empresa.com"
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-gray-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={gkLoading}
                className="w-full py-2.5 text-sm font-semibold bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {gkLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {gkLoading ? "Entrando..." : "Acessar Revisão"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ─── REVIEW PORTAL (Read-only Player + Comments) ───
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-6 flex-shrink-0 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
            <GraduationCap className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {project.title}
          </span>
          <span className="text-xs text-gray-600 bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
            Revisão
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <User className="h-3.5 w-3.5" />
          <span>{reviewer.name}</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Slide Navigator */}
        <div className="w-32 border-r border-gray-200 bg-gray-50 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-200">
            <p className="text-xs font-semibold text-gray-700 text-center">
              Slides
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`w-full aspect-video rounded-lg text-xs font-medium transition-all flex items-center justify-center ${
                  currentSlideIndex === idx
                    ? "ring-2 ring-purple-500 bg-white text-gray-900"
                    : "bg-white text-gray-500 hover:ring-1 hover:ring-purple-300"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Center - Canvas + Navigation */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-gray-50">
          {/* 16:9 Canvas */}
          <div
            className="relative w-full max-w-[860px] bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
            style={{ aspectRatio: "16 / 9" }}
          >
            {currentSlide && (
              <>
                <div
                  className="absolute inset-0 z-0"
                  style={{ backgroundColor: currentSlide.background }}
                />
                {currentSlide.blocks.map((block) => (
                  <ReadOnlyBlock key={block.id} block={block} />
                ))}
              </>
            )}
          </div>

          {/* Slide Navigation */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={goPrev}
              disabled={currentSlideIndex === 0}
              className="h-10 w-10 rounded-xl border border-gray-300 shadow-sm flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 transition-all text-gray-600 cursor-pointer bg-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-[90px] text-center">
              {currentSlideIndex + 1} de {slides.length}
            </span>
            <button
              onClick={goNext}
              disabled={currentSlideIndex === slides.length - 1}
              className="h-10 w-10 rounded-xl border border-gray-300 shadow-sm flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 transition-all text-gray-600 cursor-pointer bg-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right Sidebar - Comments */}
        <aside className="w-[380px] flex flex-col flex-shrink-0 bg-white border-l border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-600" />
              <h3 className="text-sm font-semibold text-gray-900">
                Comentários
              </h3>
              <span className="inline-flex items-center justify-center h-5 min-w-[20px] text-[10px] font-bold bg-purple-100 text-purple-700 rounded-full px-1.5">
                {comments.length}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Slide {currentSlideIndex + 1}
            </p>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {comments.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500">
                  Nenhum comentário neste slide
                </p>
              </div>
            )}
            {comments.map((comment) => {
              const status = commentStatuses[comment.id] || "pending";
              const isResolved = status === "resolved";
              return (
                <div
                  key={comment.id}
                  className={`rounded-xl p-3.5 border-l-4 transition-all ${
                    isResolved
                      ? "bg-green-50 border-l-green-500"
                      : "bg-orange-50 border-l-orange-500"
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-white">
                        {comment.reviewer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-gray-900">
                          {comment.reviewer.name}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            isResolved
                              ? "bg-green-200 text-green-800"
                              : "bg-orange-200 text-orange-800"
                          }`}
                        >
                          {isResolved ? "Resolvido" : "Pendente"}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-500">
                        {getRelativeTime(new Date(comment.createdAt))}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed mb-2">
                    {comment.text}
                  </p>
                  <button
                    onClick={() => toggleCommentStatus(comment.id)}
                    className={`w-full text-xs font-medium py-1.5 rounded-lg transition-all ${
                      isResolved
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                    }`}
                  >
                    {isResolved ? "Marcar como Pendente" : "Resolver"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Comment Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escreva um comentário..."
                rows={2}
                className="flex-1 text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none transition-all placeholder:text-gray-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim() || submitting}
                className="h-10 w-10 self-end rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-40 transition-all cursor-pointer"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── Read-Only Block Renderer ───
function ReadOnlyBlock({ block }: { block: Block }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const leftPct = (block.x / 960) * 100;
  const topPct = (block.y / 540) * 100;
  const widthPct = (block.width / 960) * 100;
  const heightPct = (block.height / 540) * 100;

  const style: React.CSSProperties = {
    position: "absolute",
    left: `${leftPct}%`,
    top: `${topPct}%`,
    width: `${widthPct}%`,
    height: `${heightPct}%`,
    zIndex: 10,
  };

  if (block.type === "text") {
    return (
      <div
        className="rounded-xl overflow-hidden p-3"
        style={{
          ...style,
          fontSize: `${Math.max(10, block.fontSize * 0.7)}px`,
          fontWeight: block.fontWeight,
          color: block.color,
          textAlign: block.textAlign,
          lineHeight: 1.6,
        }}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.content) }}
      />
    );
  }

  if (block.type === "image") {
    if (!block.src) {
      return (
        <div
          className="rounded-xl bg-muted/30 flex items-center justify-center border border-dashed border-muted-foreground/20"
          style={style}
        >
          <Upload className="h-6 w-6 text-muted-foreground/30" />
        </div>
      );
    }
    return (
      <div className="rounded-xl overflow-hidden" style={style}>
        <img
          src={block.src}
          alt={block.alt}
          className="w-full h-full"
          style={{ objectFit: block.objectFit }}
          draggable={false}
        />
      </div>
    );
  }

  if (block.type === "flashcard") {
    const fb = block as FlashcardBlock;
    const frontColor = fb.frontBg === "#ffffff" || fb.frontBg === "white" ? "#000000" : "#ffffff";
    const backColor = fb.backBg === "#ffffff" || fb.backBg === "white" ? "#000000" : "#ffffff";
    return (
      <div
        className="rounded-xl cursor-pointer shadow-lg"
        style={{ ...style, perspective: "600px" }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className="relative w-full h-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          <div
            className="absolute inset-0 rounded-xl flex items-center justify-center font-semibold text-sm"
            style={{
              backgroundColor: fb.frontBg,
              color: frontColor,
              backfaceVisibility: "hidden",
            }}
          >
            <div className="text-center px-4">
              <CreditCard className="h-5 w-5 mx-auto mb-2 opacity-60" />
              <p className="line-clamp-3">{fb.frontContent}</p>
              <span className="text-[10px] opacity-50 mt-2 block">
                Clique para virar →
              </span>
            </div>
          </div>
          <div
            className="absolute inset-0 rounded-xl flex items-center justify-center font-semibold text-sm"
            style={{
              backgroundColor: fb.backBg,
              color: backColor,
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="text-center px-4">
              <p className="line-clamp-4">{fb.backContent}</p>
              <span className="text-[10px] opacity-50 mt-2 block">
                ← Clique para voltar
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (block.type === "quiz") {
    const qb = block as QuizBlock;
    return (
      <div
        className="rounded-xl bg-white border border-gray-200 p-3 overflow-hidden shadow-md"
        style={style}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <HelpCircle className="h-4 w-4 text-purple-600 flex-shrink-0" />
          <p className="text-xs font-semibold text-gray-900 line-clamp-1">
            {qb.question}
          </p>
        </div>
        <div className="space-y-1">
          {qb.options.map((opt) => (
            <div
              key={opt.id}
              className="text-[10px] px-2 py-1 rounded-md line-clamp-1 bg-purple-50 text-gray-700"
            >
              {opt.text}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "video") {
    return <InteractiveVideoBlock block={block as VideoBlockType} style={style} />;
  }

  return null;
}

// ─── Relative time helper ───
function formatRelativeTime(date: Date): string {
  return getRelativeTime(date);
}

// ─── Interactive Video Block for Review ───
function InteractiveVideoBlock({ block, style }: { block: VideoBlockType; style: React.CSSProperties }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeInteraction, setActiveInteraction] = useState<VideoInteraction | null>(null);
  const answeredRef = useRef<Set<string>>(new Set());
  const playerRef = useRef<{ seekTo: (s: number) => void } | null>(null);

  const handleProgress = useCallback(({ playedSeconds }: { playedSeconds: number }) => {
    if (activeInteraction) return; // already showing quiz
    for (const interaction of block.interactions) {
      if (answeredRef.current.has(interaction.id)) continue;
      if (Math.abs(playedSeconds - interaction.timestampSeconds) < 0.5) {
        setIsPlaying(false);
        setActiveInteraction(interaction);
        break;
      }
    }
  }, [block.interactions, activeInteraction]);

  const handleAnswer = (optionIdx: number) => {
    if (!activeInteraction) return;
    const opt = activeInteraction.options[optionIdx];
    if (opt.isCorrect) {
      answeredRef.current.add(activeInteraction.id);
      setActiveInteraction(null);
      setIsPlaying(true);
    }
  };

  if (!block.url) {
    return (
      <div className="rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shadow-lg" style={style}>
        <Play className="h-6 w-6 text-white/40" />
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden bg-black shadow-lg" style={style}>
      <div className="relative w-full h-full">
        <ReactPlayer
          url={block.url}
          width="100%"
          height="100%"
          playing={isPlaying}
          controls
          onProgress={handleProgress}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          progressInterval={250}
        />

        {/* Quiz Overlay */}
        {activeInteraction && (
          <div className="absolute inset-0 z-20 bg-black/70 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                  <Play className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs text-gray-600 font-medium">
                  Pergunta em {activeInteraction.timestampSeconds}s
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                {activeInteraction.question}
              </h3>
              <div className="space-y-2">
                {activeInteraction.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className="w-full text-left text-sm px-4 py-2.5 rounded-xl border border-gray-200 bg-purple-50 hover:bg-purple-100 hover:border-purple-300 transition-all flex items-center gap-2 text-gray-900"
                  >
                    <span className="h-5 w-5 rounded-full border-2 border-gray-300 flex items-center justify-center text-[10px] font-bold flex-shrink-0 bg-white">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {opt.text}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-600 mt-3 text-center">
                Selecione a resposta correta para continuar
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
