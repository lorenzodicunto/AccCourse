import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lixeira — AccCourse",
  description: "Cursos excluídos. Restaure ou exclua permanentemente seus cursos.",
};

export default function LixeiraLayout({ children }: { children: React.ReactNode }) {
  return children;
}
