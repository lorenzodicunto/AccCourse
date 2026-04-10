import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/AuthProvider";
import { SkipToContent } from "@/components/SkipToContent";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AccCourse — Plataforma de Criação de Cursos E-Learning",
  description:
    "Crie cursos interativos e-learning com exportação SCORM 1.2 — sem código, totalmente visual.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased light`}>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <SkipToContent />
        <I18nProvider>
          <AuthProvider>{children}</AuthProvider>
        </I18nProvider>
        <Toaster />
      </body>
    </html>
  );
}
