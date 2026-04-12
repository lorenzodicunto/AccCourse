import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configurações — AccCourse",
  description: "Gerencie suas configurações pessoais e preferências da plataforma.",
};

export default function ConfiguracoesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
