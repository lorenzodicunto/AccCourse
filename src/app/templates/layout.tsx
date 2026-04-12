import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Templates — AccCourse",
  description: "Explore templates prontos para criar cursos e-learning rapidamente.",
};

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
