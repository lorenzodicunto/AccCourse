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
} from "lucide-react";
import { listTenants, listUsers, provisionClient } from "@/actions/admin";
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

export default function AdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"tenants" | "users">("tenants");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    userName: "",
    userEmail: "",
    userPassword: "",
  });

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
      setForm({ companyName: "", userName: "", userEmail: "", userPassword: "" });
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao provisionar.");
    } finally {
      setProvisioning(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 text-white flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
              <Shield className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">Admin Portal</h1>
              <p className="text-[10px] text-zinc-400">AccCourse Enterprise</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <button
            onClick={() => setActiveTab("tenants")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === "tenants"
                ? "bg-primary text-white"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
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
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Users className="h-4 w-4" />
            Usuários
          </button>
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Editor
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>

        <div className="px-4 pb-4">
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-xs text-zinc-400">{session?.user?.email}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Super Admin</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
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
            <Button
              className="gap-2 rounded-xl bg-primary shadow-lg shadow-primary/25"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Provisionar Cliente
            </Button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : activeTab === "tenants" ? (
            <div className="bg-white rounded-2xl shadow-sm border border-border/50 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-zinc-50/50">
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3.5">
                      Empresa
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3.5">
                      Usuários
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3.5">
                      Cursos
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3.5">
                      Criado em
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {tenants.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-12 text-center text-sm text-muted-foreground"
                      >
                        <Building2 className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                        Nenhuma empresa provisionada ainda
                      </td>
                    </tr>
                  ) : (
                    tenants.map((t) => (
                      <tr key={t.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Building2 className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-sm font-medium text-foreground">
                              {t.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {t._count.users}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {t._count.courses}
                        </td>
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
            <div className="bg-white rounded-2xl shadow-sm border border-border/50 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-zinc-50/50">
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3.5">
                      Usuário
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3.5">
                      Role
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3.5">
                      Empresa
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3.5">
                      Criado em
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {u.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {u.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            u.role === "SUPER_ADMIN"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-violet-50 text-violet-700 border border-violet-200"
                          }`}
                        >
                          {u.role === "SUPER_ADMIN" ? "Super Admin" : "Author"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {u.tenant?.name ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Provision Client Dialog */}
      {dialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setDialogOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">
                    Provisionar Cliente
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Criar empresa e primeiro usuário
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg"
                onClick={() => setDialogOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleProvision} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome da Empresa</label>
                <Input
                  placeholder="Acme Corp"
                  value={form.companyName}
                  onChange={(e) =>
                    setForm({ ...form, companyName: e.target.value })
                  }
                  className="rounded-xl h-10"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome do Usuário</label>
                <Input
                  placeholder="John Doe"
                  value={form.userName}
                  onChange={(e) =>
                    setForm({ ...form, userName: e.target.value })
                  }
                  className="rounded-xl h-10"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="john@acme.com"
                  value={form.userEmail}
                  onChange={(e) =>
                    setForm({ ...form, userEmail: e.target.value })
                  }
                  className="rounded-xl h-10"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Senha</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={form.userPassword}
                  onChange={(e) =>
                    setForm({ ...form, userPassword: e.target.value })
                  }
                  className="rounded-xl h-10"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-xl"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={provisioning}
                  className="rounded-xl gap-2"
                >
                  {provisioning ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Provisionando...
                    </>
                  ) : (
                    "Provisionar"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
