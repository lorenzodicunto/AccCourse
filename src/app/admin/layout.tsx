import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administração — AccCourse",
  description: "Painel administrativo para gerenciar tenants, usuários e configurações da plataforma.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
