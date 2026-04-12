"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";

interface DeleteCourseDialogProps {
  courseTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteCourseDialog({ courseTitle, onConfirm, onCancel }: DeleteCourseDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Focus trap: focus cancel button on mount, trap Escape key
  useEffect(() => {
    cancelRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-desc"
    >
      <div className="bg-card border border-border rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
            <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true" />
          </div>
          <h3 id="delete-dialog-title" className="text-lg font-semibold text-foreground">
            Excluir curso
          </h3>
        </div>
        <p id="delete-dialog-desc" className="text-muted-foreground mb-6">
          Tem certeza que deseja excluir <strong className="text-foreground">&quot;{courseTitle}&quot;</strong>? O curso será movido para a lixeira.
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            ref={cancelRef}
            variant="outline"
            size="sm"
            className="rounded-xl cursor-pointer"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            className="rounded-xl bg-red-600 hover:bg-red-700 text-white cursor-pointer"
            onClick={onConfirm}
          >
            Excluir
          </Button>
        </div>
      </div>
    </div>
  );
}
