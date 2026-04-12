import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Biblioteca de Assets — AccCourse",
  description: "Gerencie imagens, vídeos e outros recursos para seus cursos e-learning.",
};

export default function BibliotecaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
