import { Loader2 } from "lucide-react";

export default function EditorLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <p className="text-sm text-muted-foreground">Carregando editor...</p>
      </div>
    </div>
  );
}
