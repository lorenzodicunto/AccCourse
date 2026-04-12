import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login — AccCourse",
  description: "Faça login na plataforma AccCourse para criar e gerenciar seus cursos e-learning.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
