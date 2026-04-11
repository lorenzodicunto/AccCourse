import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center max-w-md">
        <div className="h-20 w-20 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-6">
          <FileQuestion className="h-10 w-10 text-purple-600" />
        </div>
        <h1 className="text-6xl font-bold text-purple-600 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-foreground mb-2">Página não encontrada</h2>
        <p className="text-muted-foreground mb-6">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
        >
          Voltar ao Início
        </Link>
      </div>
    </div>
  );
}
