"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";

const SHORTCUTS = [
  { category: "Geral", items: [
    { keys: "Ctrl + S", action: "Salvar curso" },
    { keys: "Ctrl + Z", action: "Desfazer" },
    { keys: "Ctrl + Y", action: "Refazer" },
  ]},
  { category: "Seleção", items: [
    { keys: "Esc", action: "Deselecionar tudo" },
    { keys: "Shift + Click", action: "Selecionar múltiplos blocos" },
    { keys: "Ctrl + A", action: "Selecionar todos os blocos" },
  ]},
  { category: "Blocos", items: [
    { keys: "Ctrl + C", action: "Copiar bloco(s)" },
    { keys: "Ctrl + V", action: "Colar bloco(s)" },
    { keys: "Ctrl + X", action: "Recortar bloco(s)" },
    { keys: "Ctrl + D", action: "Duplicar bloco(s)/slide" },
    { keys: "Delete / Backspace", action: "Excluir bloco(s)" },
  ]},
  { category: "Posicionamento e Camadas", items: [
    { keys: "↑ ↓ ← →", action: "Mover bloco(s) em 1px" },
    { keys: "Shift + Setas", action: "Mover bloco(s) em 10px" },
    { keys: "Ctrl + ]", action: "Avançar bloco(s)" },
    { keys: "Ctrl + [", action: "Recuar bloco(s)" },
    { keys: "Ctrl + Shift + ]", action: "Trazer para o primeiro plano" },
    { keys: "Ctrl + Shift + [", action: "Enviar para o plano de fundo" },
  ]},
];

export function KeyboardShortcutsDialog() {
  return (
    <Dialog>
      <DialogTrigger>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 rounded text-slate-500 hover:text-foreground hover:bg-muted"
          title="Atalhos de teclado"
        >
          <Keyboard className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-4 w-4" />
            Atalhos de Teclado
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {SHORTCUTS.map((group) => (
            <div key={group.category}>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {group.category}
              </h4>
              <div className="space-y-1">
                {group.items.map((shortcut) => (
                  <div
                    key={shortcut.keys}
                    className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50"
                  >
                    <span className="text-sm text-foreground/80">
                      {shortcut.action}
                    </span>
                    <kbd className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-mono bg-muted border border-border rounded-md text-muted-foreground shadow-sm">
                      {shortcut.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          Auto-save: o curso é salvo automaticamente a cada 3 segundos
        </p>
      </DialogContent>
    </Dialog>
  );
}
