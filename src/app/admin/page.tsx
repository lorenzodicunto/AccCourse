"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  GraduationCap,
  Users,
  Building2,
  Plus,
  Shield,
  LogOut,
  Loader2,
  ArrowLeft,
  X,
  Pencil,
  Trash2,
  KeyRound,
  UserPlus,
  MoreHorizontal,
} from "lucide-react";
import {
  listTenants,
  listUsers,
  provisionClient,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
} from "@/actions/admin";
import { toast } from "sonner";

type TenantRow = {
  id: string;
  name: string;
  createdAt: Date;
  _count: { users: number; courses: number };
};

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  tenant: { name: string } | null;
};

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  EDITOR: "Editor",
  REVIEWER: "Reviewer",
  VIEWER: "Viewer",
};

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "bg-red-100 text-red-700 border border-red-200",
  ADMIN: "bg-orange-100 text-orange-700 border border-orange-200",
  EDITOR: "bg-purple-100 text-purple-700 border border-purple-200",
  REVIEWER: "bg-blue-100 text-blue-700 border border-blue-200",
  VIEWER: "bg-muted text-foreground/80 border border-border",
};

export default function AdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"tenants" | "users">("tenants");

  // Provision dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    userName: "",
    userEmail: "",
    userPassword: "",
    userRole: "EDITOR",
  });

  // Create user dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "EDITOR",
    tenantId: "",
  });

  // Edit user dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTarget, setEditTarget] = useState<UserRow | null>(null);
  const [editForm, setEditForm] = useState({ name: "", role: "" });

  // Reset password dialog
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetTarget, setResetTarget] = useState<UserRow | null>(null);
  const [newPassword, setNewPassword] = useState("");

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Action menu
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [t, u] = await Promise.all([listTenants(), listUsers()]);
      setTenants(t);
      setUsers(u);
    } catch {
      toast.error("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    setProvisioning(true);
    try {
      await provisionClient(form);
      toast.success(`Cliente "${form.companyName}" provisionado com sucesso!`);
      setDialogOpen(false);
      setForm({ companyName: "", userName: "", userEmail: "", userPassword: "", userRole: "EDITOR" });
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao provisionar.");
    } finally {
      setProvisioning(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createUser(createForm);
      toast.success("Usuário criado com sucesso!");
      setCreateDialogOpen(false);
      setCreateForm({ name: "", email: "", password: "", role: "EDITOR", tenantId: "" });
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar usuário.");
    } finally {
      setCreating(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setEditing(true);
    try {
      await updateUser(editTarget.id, editForm);
      toast.success("Usuário atualizado!");
      setEditDialogOpen(false);
      setEditTarget(null);
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar.");
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      toast.success("Usuário excluído.");
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir.");
    } finally {
      setDeleting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;
    setResetting(true);
    try {
      await resetUserPassword(resetTarget.id, newPassword);
      toast.success("Senha redefinida!");
      setResetDialogOpen(false);
      setResetTarget(null);
      setNewPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao redefinir senha.");
    } finally {
      setResetting(false);
    }
  };

  const openEdit = (u: UserRow) => {
    setEditTarget(u);
    setEditForm({ name: u.name, role: u.role });
    setEditDialogOpen(true);
    setMenuOpenId(null);
  };

  const openResetPassword = (u: UserRow) => {
    setResetTarget(u);
    setNewPassword("");
    setResetDialogOpen(true);
    setMenuOpenId(null);
  };

  const openDelete = (u: UserRow) => {
    setDeleteTarget(u);
    setMenuOpenId(null);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col flex-shrink-0 bg-muted border-r border-border">
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-600 to-purple-700">
              <Shield className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-foreground">Admin Portal</h1>
              <p className="text-[10px] text-muted-foreground">AccCourse 2.0</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <button
            onClick={() => setActiveTab("tenants")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === "tenants"
                ? "bg-primary text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"
            }`}
          >
            <Building2 className="h-4 w-4" />
            Empresas
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === "users"
                ? "bg-primary text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"
            }`}
          >
            <Users className="h-4 w-4" />
            Usuários
          </button>
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10 rounded-xl cursor-pointer"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Editor
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10 rounded-xl cursor-pointer"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>

        <div className="px-4 pb-4">
          <div className="bg-muted-foreground/10 rounded-xl p-3">
            <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Super Admin</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8" onClick={() => setMenuOpenId(null)}>
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {activeTab === "tenants" ? "Empresas (Tenants)" : "Usuários"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {activeTab === "tenants"
                  ? `${tenants.length} empresa${tenants.length !== 1 ? "s" : ""} registrada${tenants.length !== 1 ? "s" : ""}`
                  : `${users.length} usuário${users.length !== 1 ? "s" : ""} registrado${users.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {activeTab === "users" && (
                <Button
                  variant="outline"
                  className="gap-2 rounded-xl cursor-pointer"
                  onClick={() => setCreateDialogOpen(true)}
                >
                  <UserPlus className="h-4 w-4" />
                  Novo Usuário
                </Button>
              )}
              <Button
                className="gap-2 rounded-xl text-white font-medium shadow-lg shadow-purple-500/25 cursor-pointer bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Provisionar Cliente
              </Button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : activeTab === "tenants" ? (
            <div className="rounded-2xl overflow-hidden border border-border bg-card">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3.5">Empresa</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3.5">Usuários</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3.5">Cursos</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3.5">Criado em</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tenants.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground">
                        <Building2 className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                        Nenhuma empresa provisionada ainda
                      </td>
                    </tr>
                  ) : (
                    tenants.map((t) => (
                      <tr key={t.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-purple-100 flex items-center justify-center">
                              <Building2 className="h-4 w-4 text-purple-600" />
                            </div>
                            <span className="text-sm font-medium text-foreground">{t.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{t._count.users}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{t._count.courses}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(t.createdAt).toLocaleDateString("pt-BR")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden border border-border bg-card">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3.5">Usuário</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3.5">Role</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3.5">Empresa</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3.5">Criado em</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3.5">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">
                        <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                        Nenhum usuário encontrado
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-foreground">{u.name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[u.role] || ROLE_COLORS.VIEWER}`}>
                            {ROLE_LABELS[u.role] || u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{u.tenant?.name ?? "—"}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="relative inline-block">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-lg cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpenId(menuOpenId === u.id ? null : u.id);
                              }}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            {menuOpenId === u.id && (
                              <div
                                className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-xl shadow-lg z-50 py-1 animate-in fade-in zoom-in-95 duration-150"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                                  onClick={() => openEdit(u)}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  Editar
                                </button>
                                <button
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                                  onClick={() => openResetPassword(u)}
                                >
                                  <KeyRound className="h-3.5 w-3.5" />
                                  Redefinir Senha
                                </button>
                                <div className="border-t border-border my-1" />
                                <button
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                  onClick={() => openDelete(u)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Excluir
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ═══ Provision Client Dialog ═══ */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setDialogOpen(false)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in-95 duration-200 border border-border" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Provisionar Cliente</h3>
                  <p className="text-xs text-muted-foreground">Criar empresa e primeiro usuário</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={() => setDialogOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleProvision} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Nome da Empresa</label>
                <Input placeholder="Acme Corp" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="rounded-xl h-10" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Nome do Usuário</label>
                <Input placeholder="John Doe" value={form.userName} onChange={(e) => setForm({ ...form, userName: e.target.value })} className="rounded-xl h-10" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input type="email" placeholder="john@acme.com" value={form.userEmail} onChange={(e) => setForm({ ...form, userEmail: e.target.value })} className="rounded-xl h-10" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Senha</label>
                <Input type="password" placeholder="••••••••" value={form.userPassword} onChange={(e) => setForm({ ...form, userPassword: e.target.value })} className="rounded-xl h-10" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Role</label>
                <select value={form.userRole} onChange={(e) => setForm({ ...form, userRole: e.target.value })} className="rounded-xl h-10 w-full border border-border bg-background text-foreground px-3 text-sm" required>
                  <option value="EDITOR">Editor</option>
                  <option value="ADMIN">Admin</option>
                  <option value="REVIEWER">Reviewer</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" className="rounded-xl" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={provisioning} className="rounded-xl gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium">
                  {provisioning ? (<><Loader2 className="h-4 w-4 animate-spin" />Provisionando...</>) : "Provisionar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ Create User Dialog ═══ */}
      {createDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setCreateDialogOpen(false)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in-95 duration-200 border border-border" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Novo Usuário</h3>
                  <p className="text-xs text-muted-foreground">Adicionar a empresa existente</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={() => setCreateDialogOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Nome</label>
                <Input placeholder="Nome completo" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} className="rounded-xl h-10" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input type="email" placeholder="email@empresa.com" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} className="rounded-xl h-10" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Senha</label>
                <Input type="password" placeholder="••••••••" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} className="rounded-xl h-10" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Empresa</label>
                <select value={createForm.tenantId} onChange={(e) => setCreateForm({ ...createForm, tenantId: e.target.value })} className="rounded-xl h-10 w-full border border-border bg-background text-foreground px-3 text-sm">
                  <option value="">Sem empresa (freelancer)</option>
                  {tenants.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Role</label>
                <select value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })} className="rounded-xl h-10 w-full border border-border bg-background text-foreground px-3 text-sm">
                  <option value="EDITOR">Editor</option>
                  <option value="ADMIN">Admin</option>
                  <option value="REVIEWER">Reviewer</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" className="rounded-xl" onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={creating} className="rounded-xl gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium">
                  {creating ? (<><Loader2 className="h-4 w-4 animate-spin" />Criando...</>) : "Criar Usuário"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ Edit User Dialog ═══ */}
      {editDialogOpen && editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setEditDialogOpen(false)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in-95 duration-200 border border-border" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                  <Pencil className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Editar Usuário</h3>
                  <p className="text-xs text-muted-foreground">{editTarget.email}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={() => setEditDialogOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Nome</label>
                <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="rounded-xl h-10" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Role</label>
                <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="rounded-xl h-10 w-full border border-border bg-background text-foreground px-3 text-sm">
                  <option value="EDITOR">Editor</option>
                  <option value="ADMIN">Admin</option>
                  <option value="REVIEWER">Reviewer</option>
                  <option value="VIEWER">Viewer</option>
                  {session?.user?.role === "SUPER_ADMIN" && <option value="SUPER_ADMIN">Super Admin</option>}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" className="rounded-xl" onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={editing} className="rounded-xl gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium">
                  {editing ? (<><Loader2 className="h-4 w-4 animate-spin" />Salvando...</>) : "Salvar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ Reset Password Dialog ═══ */}
      {resetDialogOpen && resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setResetDialogOpen(false)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in-95 duration-200 border border-border" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center">
                  <KeyRound className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Redefinir Senha</h3>
                  <p className="text-xs text-muted-foreground">{resetTarget.email}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={() => setResetDialogOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Nova Senha</label>
                <Input type="password" placeholder="Mínimo 6 caracteres" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="rounded-xl h-10" required minLength={6} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" className="rounded-xl" onClick={() => setResetDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={resetting} className="rounded-xl gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium">
                  {resetting ? (<><Loader2 className="h-4 w-4 animate-spin" />Redefinindo...</>) : "Redefinir Senha"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ Delete Confirmation ═══ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 animate-in fade-in zoom-in-95 duration-200 border border-border" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Excluir Usuário</h3>
                <p className="text-xs text-muted-foreground">Esta ação não pode ser desfeita</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              Tem certeza que deseja excluir <strong className="text-foreground">{deleteTarget.name}</strong> ({deleteTarget.email})?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" className="rounded-xl" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
              <Button
                disabled={deleting}
                className="rounded-xl gap-2 bg-red-600 hover:bg-red-700 text-white font-medium"
                onClick={handleDeleteUser}
              >
                {deleting ? (<><Loader2 className="h-4 w-4 animate-spin" />Excluindo...</>) : "Excluir"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
