"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, Loader2, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou senha inválidos.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Ambient glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)' }}
      />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)' }}
      />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center h-16 w-16 rounded-2xl mb-4 shadow-lg shadow-purple-200"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}
          >
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            AccCourse
          </h1>
          <span className="text-xs font-semibold tracking-widest uppercase mt-1 text-purple-600">
            2.0
          </span>
          <p className="text-sm text-slate-500 mt-2">
            Plataforma Enterprise de E-Learning
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl p-8 animate-slide-up bg-white shadow-xl border border-slate-200">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Entrar na plataforma
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Acesse sua conta para criar e gerenciar cursos
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email-input" className="text-sm font-medium text-slate-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
                <Input
                  id="email-input"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:bg-white transition-all"
                  required
                  aria-required="true"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password-input" className="text-sm font-medium text-slate-700">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
                <Input
                  id="password-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:bg-white transition-all"
                  required
                  aria-required="true"
                />
              </div>
            </div>

            {error && (
              <div id="error-message" role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-600 flex-shrink-0" aria-hidden="true" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl text-white font-medium shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all cursor-pointer bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center">
              Acesso restrito. Contas são provisionadas pelo administrador do
              sistema.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-slate-500 text-center mt-6">
          © 2026 AccCourse — Accuracy Tecnologia
        </p>
      </div>
    </div>
  );
}
