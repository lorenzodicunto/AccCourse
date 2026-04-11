"use client";

import { useState, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  MessageCircle,
  CheckCircle2,
  Clock,
  Reply,
  Trash2,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Função para formatar tempo relativo
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "agora mesmo";
  if (diffMin < 60) return `${diffMin} minuto${diffMin > 1 ? "s" : ""} atrás`;
  if (diffHour < 24) return `${diffHour} hora${diffHour > 1 ? "s" : ""} atrás`;
  if (diffDay < 7) return `${diffDay} dia${diffDay > 1 ? "s" : ""} atrás`;

  const weeks = Math.floor(diffDay / 7);
  if (weeks < 4) return `${weeks} semana${weeks > 1 ? "s" : ""} atrás`;

  const months = Math.floor(diffDay / 30);
  if (months < 12) return `${months} mês${months > 1 ? "es" : ""} atrás`;

  const years = Math.floor(diffDay / 365);
  return `${years} ano${years > 1 ? "s" : ""} atrás`;
}

interface Comment {
  id: string;
  author: string;
  avatarUrl?: string;
  text: string;
  timestamp: Date;
  status: "pendente" | "resolvido";
  replies?: Comment[];
}

interface ReviewPanelProps {
  courseId: string;
  slideId: string;
  comments?: Comment[];
  onAddComment: (comment: Omit<Comment, "id" | "timestamp">) => void;
}

export function ReviewPanel({
  courseId,
  slideId,
  comments = [],
  onAddComment,
}: ReviewPanelProps) {
  const [newCommentText, setNewCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    new Set()
  );

  // Adicionar comentário
  const handleAddComment = useCallback(async () => {
    if (!newCommentText.trim()) return;

    setIsLoading(true);
    try {
      onAddComment({
        author: "Você",
        text: newCommentText,
        status: "pendente",
        replies: [],
      });
      setNewCommentText("");
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
    } finally {
      setIsLoading(false);
    }
  }, [newCommentText, onAddComment]);

  // Adicionar resposta
  const handleAddReply = useCallback(
    async (parentId: string) => {
      if (!replyText.trim()) return;

      setIsLoading(true);
      try {
        // Encontrar comentário pai e adicionar resposta
        const updateComments = (items: Comment[]): Comment[] => {
          return items.map((comment) => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: [
                  ...(comment.replies || []),
                  {
                    id: `reply-${Math.random()}`,
                    author: "Você",
                    text: replyText,
                    timestamp: new Date(),
                    status: "pendente" as const,
                  },
                ],
              };
            }
            return comment;
          });
        };

        // Aqui você faria a chamada à API
        setReplyingTo(null);
        setReplyText("");
      } catch (error) {
        console.error("Erro ao adicionar resposta:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [replyText]
  );

  // Alternar status de resolução
  const toggleResolved = useCallback(
    (commentId: string) => {
      // Implementar toggle de resolução
    },
    []
  );

  // Toggle de respostas expandidas
  const toggleReplies = useCallback((commentId: string) => {
    setExpandedReplies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  }, []);

  const pendingComments = comments.filter((c) => c.status === "pendente");
  const resolvedComments = comments.filter((c) => c.status === "resolvido");

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-purple-600" />
            Painel de Revisão
          </CardTitle>
          <CardDescription>
            Slide {slideId} do Curso {courseId}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Novo comentário */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Adicionar Comentário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Digite seu comentário ou feedback..."
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            className="min-h-24 resize-none"
          />
          <Button
            onClick={handleAddComment}
            disabled={!newCommentText.trim() || isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? (
              <>
                <AlertCircle className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Comentário
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Comentários pendentes */}
      {pendingComments.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-600" />
            <h3 className="font-semibold text-gray-900">
              Comentários Pendentes ({pendingComments.length})
            </h3>
          </div>

          {pendingComments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="pt-6 space-y-3">
                {/* Cabeçalho do comentário */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {comment.avatarUrl && (
                      <img
                        src={comment.avatarUrl}
                        alt={comment.author}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {comment.author}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatRelativeTime(comment.timestamp)}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleResolved(comment.id)}
                    className="text-xs"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Resolver
                  </Button>
                </div>

                {/* Texto do comentário */}
                <p className="text-gray-700">{comment.text}</p>

                {/* Respostas */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="space-y-2 border-t pt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleReplies(comment.id)}
                      className="text-xs text-purple-600"
                    >
                      <Reply className="h-3 w-3 mr-1" />
                      {expandedReplies.has(comment.id) ? "Ocultar" : "Mostrar"}{" "}
                      {comment.replies.length} resposta
                      {comment.replies.length !== 1 ? "s" : ""}
                    </Button>

                    {expandedReplies.has(comment.id) && (
                      <div className="space-y-2 ml-4 border-l-2 border-gray-200 pl-3">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="py-2">
                            <div className="flex items-center gap-2 mb-1">
                              {reply.avatarUrl && (
                                <img
                                  src={reply.avatarUrl}
                                  alt={reply.author}
                                  className="h-6 w-6 rounded-full object-cover"
                                />
                              )}
                              <p className="text-sm font-medium text-gray-900">
                                {reply.author}
                              </p>
                              <p className="text-xs text-gray-600">
                                {formatDistanceToNow(reply.timestamp, {
                                  addSuffix: true,
                                  locale: ptBR,
                                })}
                              </p>
                            </div>
                            <p className="text-sm text-gray-700">{reply.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Formulário de resposta */}
                {replyingTo === comment.id ? (
                  <div className="space-y-2 border-t pt-3">
                    <Textarea
                      placeholder="Digite sua resposta..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="min-h-16 resize-none text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAddReply(comment.id)}
                        disabled={!replyText.trim() || isLoading}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Enviar Resposta
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText("");
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(comment.id)}
                    className="text-purple-600 text-xs"
                  >
                    <Reply className="h-3 w-3 mr-1" />
                    Responder
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Comentários resolvidos */}
      {resolvedComments.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <h3 className="font-semibold text-gray-900">
              Comentários Resolvidos ({resolvedComments.length})
            </h3>
          </div>

          {resolvedComments.map((comment) => (
            <Card key={comment.id} className="opacity-75">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {comment.avatarUrl && (
                      <img
                        src={comment.avatarUrl}
                        alt={comment.author}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {comment.author}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatRelativeTime(comment.timestamp)}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Resolvido
                  </span>
                </div>

                <p className="text-gray-700 line-through opacity-70">
                  {comment.text}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Estado vazio */}
      {comments.length === 0 && (
        <Card className="text-center py-12">
          <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 mb-1">Nenhum comentário ainda</p>
          <p className="text-sm text-gray-500">
            Seja o primeiro a deixar um comentário sobre este slide
          </p>
        </Card>
      )}
    </div>
  );
}
