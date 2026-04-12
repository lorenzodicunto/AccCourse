"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  MessageCircle,
  CheckCircle2,
  Clock,
  Users,
  History,
  Bell,
  Send,
  Trash2,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectRole, ProjectMember, Comment as CommentType, Notification } from "@/lib/collaboration/types";

interface CollaborationPanelProps {
  courseId: string;
  slideIndex?: number;
  isOwner: boolean;
}

export function CollaborationPanel({
  courseId,
  slideIndex = 0,
  isOwner,
}: CollaborationPanelProps) {
  const [activeTab, setActiveTab] = useState("membros");
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  // Membros state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<ProjectRole>("reviewer");

  // Comentários state
  const [newComment, setNewComment] = useState("");
  const [commentPriority, setCommentPriority] = useState<"low" | "medium" | "high">("medium");

  useEffect(() => {
    loadData();
  }, [courseId, slideIndex]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [membersRes, commentsRes, versionsRes, notificationsRes] = await Promise.all([
        fetch(`/api/collaboration/members?courseId=${courseId}`),
        fetch(`/api/collaboration/comments?courseId=${courseId}&slideIndex=${slideIndex}`),
        fetch(`/api/collaboration/versions?courseId=${courseId}`),
        fetch(`/api/collaboration/notifications`),
      ]);

      if (membersRes.ok) {
        const data = await membersRes.json();
        setMembers(data.members || []);
      }

      if (commentsRes.ok) {
        const data = await commentsRes.json();
        setComments(data.comments || []);
      }

      if (versionsRes.ok) {
        const data = await versionsRes.json();
        setVersions(data.versions || []);
      }

      if (notificationsRes.ok) {
        const data = await notificationsRes.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!inviteEmail.trim()) return;

    try {
      const res = await fetch("/api/collaboration/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          userEmail: inviteEmail,
          role: inviteRole,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMembers([...members, data.member]);
        setInviteEmail("");
      }
    } catch (error) {
      console.error("Erro ao adicionar membro:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const res = await fetch("/api/collaboration/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          slideIndex,
          content: newComment,
          priority: commentPriority,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setComments([data.comment, ...comments]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Erro ao criar comentário:", error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/collaboration/comments/${commentId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setComments(comments.filter((c) => c.id !== commentId));
      }
    } catch (error) {
      console.error("Erro ao deletar comentário:", error);
    }
  };

  const handleResolveComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/collaboration/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved" }),
      });

      if (res.ok) {
        const data = await res.json();
        setComments(comments.map((c) => (c.id === commentId ? data.comment : c)));
      }
    } catch (error) {
      console.error("Erro ao resolver comentário:", error);
    }
  };

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      const res = await fetch("/api/collaboration/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationId,
          read: true,
        }),
      });

      if (res.ok) {
        setNotifications(
          notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
      }
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-700";
      case "wontfix":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <Card className="h-full w-96 flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle>Colaboração</CardTitle>
        <CardDescription>Gerencie membros, comentários e versões</CardDescription>
      </CardHeader>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="grid w-full grid-cols-4 mx-4">
          <TabsTrigger value="membros" className="text-xs">
            <Users className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="comentarios" className="text-xs">
            <MessageCircle className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="versoes" className="text-xs">
            <History className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="text-xs relative">
            <Bell className="w-4 h-4" />
            {notifications.filter((n) => !n.read).length > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </TabsTrigger>
        </TabsList>

        <CardContent className="flex-1 overflow-y-auto p-4">
          {/* MEMBROS TAB */}
          <TabsContent value="membros" className="space-y-4">
            {isOwner && (
              <div className="space-y-2 pb-4 border-b">
                <label className="text-sm font-medium">Adicionar Membro</label>
                <Input
                  placeholder="Email do usuário"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="text-sm"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as ProjectRole)}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                >
                  <option value="author">Autor</option>
                  <option value="reviewer">Revisor</option>
                  <option value="translator">Tradutor</option>
                  <option value="viewer">Visualizador</option>
                </select>
                <Button
                  onClick={handleAddMember}
                  disabled={!inviteEmail.trim()}
                  className="w-full"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Convidar
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Membros ({members.length})</label>
              {members.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhum membro ainda</p>
              ) : (
                <div className="space-y-2">
                  {members.map((member) => (
                    <div
                      key={member.userId}
                      className="p-2 border rounded bg-gray-50 text-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{member.userName}</p>
                          <p className="text-xs text-gray-600">{member.userEmail}</p>
                        </div>
                        <Badge variant="secondary">{member.role}</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Adicionado{" "}
                        {formatDistanceToNow(new Date(member.invitedAt), {
                          locale: ptBR,
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* COMENTÁRIOS TAB */}
          <TabsContent value="comentarios" className="space-y-4">
            <div className="space-y-2 pb-4 border-b">
              <label className="text-sm font-medium">Novo Comentário</label>
              <Textarea
                placeholder="Seu comentário..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="text-sm h-20"
              />
              <select
                value={commentPriority}
                onChange={(e) =>
                  setCommentPriority(e.target.value as "low" | "medium" | "high")
                }
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="low">Baixa Prioridade</option>
                <option value="medium">Média Prioridade</option>
                <option value="high">Alta Prioridade</option>
              </select>
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="w-full"
                size="sm"
              >
                <Send className="w-4 h-4 mr-2" />
                Comentar
              </Button>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Comentários ({comments.length})</label>
              {comments.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhum comentário ainda</p>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={cn(
                        "p-3 border rounded",
                        comment.status === "resolved" ? "bg-green-50" : "bg-white"
                      )}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{comment.author.name}</p>
                          <p className="text-xs text-gray-600">{comment.author.email}</p>
                        </div>
                        <Badge className={getPriorityColor(comment.priority)}>
                          {comment.priority === "high"
                            ? "Alta"
                            : comment.priority === "medium"
                              ? "Média"
                              : "Baixa"}
                        </Badge>
                      </div>
                      <p className="text-sm mt-2 text-gray-700">{comment.content}</p>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            locale: ptBR,
                            addSuffix: true,
                          })}
                        </p>
                        <div className="flex gap-1">
                          {comment.status !== "resolved" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResolveComment(comment.id)}
                              className="h-6 px-2 text-xs"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="h-6 px-2 text-xs"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      {comment.status !== "open" && (
                        <Badge className={cn(getStatusColor(comment.status), "mt-2")}>
                          {comment.status === "resolved"
                            ? "Resolvido"
                            : "Não Fazer"}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* VERSÕES TAB */}
          <TabsContent value="versoes" className="space-y-3">
            <label className="text-sm font-medium">Histórico de Versões ({versions.length})</label>
            {versions.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma versão registrada</p>
            ) : (
              <div className="space-y-3">
                {versions.map((version) => (
                  <div key={version.id} className="p-3 border rounded bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-sm">v{version.version}</p>
                        <p className="text-xs text-gray-600">{version.label}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        por {version.author.name}
                      </Badge>
                    </div>
                    {version.changesSummary && (
                      <p className="text-xs text-gray-700 mt-2">{version.changesSummary}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDistanceToNow(new Date(version.createdAt), {
                        locale: ptBR,
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* NOTIFICAÇÕES TAB */}
          <TabsContent value="notificacoes" className="space-y-3">
            <label className="text-sm font-medium">Notificações ({notifications.length})</label>
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma notificação</p>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-3 border rounded cursor-pointer hover:bg-gray-50 transition",
                      notification.read ? "bg-white" : "bg-blue-50"
                    )}
                    onClick={() => !notification.read && handleMarkNotificationAsRead(notification.id)}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        locale: ptBR,
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
