"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Lock, Shield, Loader2, Save, Check } from "lucide-react";
import { toast } from "sonner";

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "privacy">("profile");
  const [saving, setSaving] = useState(false);

  // Profile form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session]);

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error("Nome é obrigatório.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error();
      await updateSession();
      toast.success("Perfil atualizado com sucesso!");
    } catch {
      toast.error("Erro ao atualizar perfil.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Preencha todos os campos de senha.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não conferem.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro");
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Senha alterada com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao alterar senha.");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "profile" as const, label: "Perfil", icon: User },
    { id: "security" as const, label: "Segurança", icon: Lock },
    { id: "privacy" as const, label: "Privacidade", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="gap-2 text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-lg font-semibold text-slate-900">Configurações da Conta</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar tabs */}
        <nav className="w-48 flex-shrink-0">
          <div className="flex flex-col gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-purple-100 text-purple-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "profile" && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-1">Informações do Perfil</h2>
              <p className="text-sm text-slate-500 mb-6">Atualize suas informações pessoais.</p>

              <div className="flex flex-col gap-4 max-w-md">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Nome</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-400 mt-1">O e-mail não pode ser alterado.</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Função</label>
                  <div className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-600">
                    {(session?.user as any)?.role || "EDITOR"}
                  </div>
                </div>

                <Button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="w-fit mt-2 bg-purple-600 hover:bg-purple-700 cursor-pointer"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-1">Alterar Senha</h2>
              <p className="text-sm text-slate-500 mb-6">Mantenha sua conta segura com uma senha forte.</p>

              <div className="flex flex-col gap-4 max-w-md">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Senha Atual</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Nova Senha</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
                  />
                </div>

                <Button
                  onClick={handleChangePassword}
                  disabled={saving}
                  className="w-fit mt-2 bg-purple-600 hover:bg-purple-700 cursor-pointer"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                  Alterar Senha
                </Button>
              </div>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-1">Privacidade e Dados</h2>
              <p className="text-sm text-slate-500 mb-6">
                Gerencie suas preferências de privacidade conforme a LGPD.
              </p>

              <div className="flex flex-col gap-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-800 mb-1">Exportar Meus Dados</h3>
                  <p className="text-xs text-slate-500 mb-3">
                    Baixe uma cópia de todos os seus dados pessoais (cursos, perfil, atividade).
                  </p>
                  <Button variant="outline" size="sm" className="cursor-pointer">
                    Solicitar Exportação
                  </Button>
                </div>

                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                  <h3 className="text-sm font-semibold text-red-800 mb-1">Excluir Minha Conta</h3>
                  <p className="text-xs text-red-600/70 mb-3">
                    Essa ação é irreversível. Todos os seus dados, cursos e configurações serão permanentemente removidos.
                  </p>
                  <Button variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-100 cursor-pointer">
                    Solicitar Exclusão
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
