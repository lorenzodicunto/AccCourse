# Exemplos de Uso - Novos Componentes

Guia rápido de como integrar os novos componentes na aplicação AccCourse.

---

## 1. WebcamRecorder - Gravador de Webcam

### Exemplo Básico

```tsx
"use client";

import { useState } from "react";
import { WebcamRecorder } from "@/components/media";
import { Button } from "@/components/ui/button";

export function MyCourseEditor() {
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string>("");

  const handleRecordingComplete = (blob: Blob, url: string) => {
    console.log("Gravação concluída:", url);
    setRecordingUrl(url);
    // Aqui você pode salvar a URL no seu banco de dados
  };

  return (
    <div>
      <Button onClick={() => setIsRecorderOpen(true)}>
        Gravar com Webcam
      </Button>

      <WebcamRecorder
        open={isRecorderOpen}
        onOpenChange={setIsRecorderOpen}
        onRecordingComplete={handleRecordingComplete}
      />

      {recordingUrl && (
        <video
          src={recordingUrl}
          controls
          className="w-full max-w-2xl mt-4"
        />
      )}
    </div>
  );
}
```

### Com Integração de Banco de Dados

```tsx
import { useState } from "react";
import { WebcamRecorder } from "@/components/media";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function CourseSlideEditor({ courseId, slideId }: Props) {
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);

  const handleRecordingComplete = async (blob: Blob, url: string) => {
    try {
      // Salvar no banco de dados
      const response = await fetch("/api/courses/slides/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          slideId,
          videoUrl: url,
          videoType: "webcam",
        }),
      });

      if (response.ok) {
        toast.success("Vídeo salvo com sucesso!");
      } else {
        toast.error("Erro ao salvar o vídeo");
      }
    } catch (error) {
      toast.error("Erro ao salvar: " + error.message);
    }
  };

  return (
    <div>
      <Button onClick={() => setIsRecorderOpen(true)}>
        Adicionar Webcam
      </Button>

      <WebcamRecorder
        open={isRecorderOpen}
        onOpenChange={setIsRecorderOpen}
        onRecordingComplete={handleRecordingComplete}
      />
    </div>
  );
}
```

---

## 2. ScreenRecorder - Gravador de Tela

### Exemplo Básico

```tsx
"use client";

import { useState } from "react";
import { ScreenRecorder } from "@/components/media";
import { Button } from "@/components/ui/button";

export function DemoRecorder() {
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);

  const handleRecordingComplete = (blob: Blob, url: string) => {
    console.log("Tela gravada:", url);
    // Fazer algo com o vídeo
    const link = document.createElement("a");
    link.href = url;
    link.download = "screen-recording.webm";
    link.click();
  };

  return (
    <div>
      <Button onClick={() => setIsRecorderOpen(true)}>
        Gravar Tela
      </Button>

      <ScreenRecorder
        open={isRecorderOpen}
        onOpenChange={setIsRecorderOpen}
        onRecordingComplete={handleRecordingComplete}
      />
    </div>
  );
}
```

### Com Webcam Overlay

```tsx
<ScreenRecorder
  open={isRecorderOpen}
  onOpenChange={setIsRecorderOpen}
  onRecordingComplete={(blob, url) => {
    // Incluir webcam como picture-in-picture
    // Isso é controlado pelo usuário no modal
    console.log("Gravação com webcam overlay completa");
  }}
/>

// O usuário pode clicar em "Incluir webcam (picture-in-picture)" no modal
// para adicionar sua webcam ao canto inferior direito da gravação
```

---

## 3. AccessibilityChecker - Verificador de Acessibilidade

### Exemplo Básico

```tsx
"use client";

import { useState } from "react";
import { AccessibilityChecker } from "@/components/accessibility";
import { Button } from "@/components/ui/button";

export function CourseAccessibilityPanel({ courseData }: Props) {
  const [isCheckerOpen, setIsCheckerOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setIsCheckerOpen(true)}>
        Verificar Acessibilidade
      </Button>

      <AccessibilityChecker
        courseData={courseData}
        open={isCheckerOpen}
        onOpenChange={setIsCheckerOpen}
      />
    </div>
  );
}
```

### Com Dados de Currículo

```tsx
import { AccessibilityChecker } from "@/components/accessibility";

const courseData = {
  title: "Meu Curso",
  slides: [
    {
      id: 1,
      title: "Slide 1",
      content: "...",
      narration: "Narração aqui", // Se vazio, vai alertar
      audioDescription: "...",
    },
    {
      id: 2,
      title: "Slide 2",
      narration: "", // Vai aparecer como alerta
    },
  ],
};

export function CourseReview() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AccessibilityChecker
      courseData={courseData}
      open={isOpen}
      onOpenChange={setIsOpen}
    />
  );
}
```

### Interpretando os Resultados

```
Pontuação: 75%
- Crítico (3): -30 pontos (10 cada)
- Alerta (2): -10 pontos (5 cada)
- Sugestão (4): -4 pontos (1 cada)
Total: 100 - 30 - 10 - 4 = 56% (exemplo)

A pontuação ideal é:
- 90-100%: Excelente ✅
- 70-89%: Bom ⚠️
- 50-69%: Precisa melhorias 🔧
- <50%: Crítico ❌
```

---

## 4. DualModeToggle - Toggle de Modo Acessível

### Exemplo em Layout

```tsx
"use client";

import { useState } from "react";
import { DualModeToggle } from "@/components/accessibility";

export function AppLayout({ children }: Props) {
  const [mode, setMode] = useState<"standard" | "accessible">("standard");

  return (
    <div>
      {/* Header com toggle */}
      <header className="flex justify-between items-center p-4">
        <h1>AccCourse</h1>
        <DualModeToggle
          mode={mode}
          onModeChange={setMode}
        />
      </header>

      {/* Conteúdo muda baseado no modo */}
      <main>
        {children}
      </main>
    </div>
  );
}
```

### Com Persistência em LocalStorage

```tsx
import { useEffect, useState } from "react";
import { DualModeToggle } from "@/components/accessibility";

export function AppWithPersistence() {
  const [mode, setMode] = useState<"standard" | "accessible">("standard");

  // Carregar preferência salva
  useEffect(() => {
    const saved = localStorage.getItem("accessibility-mode");
    if (saved === "accessible") {
      setMode("accessible");
    }
  }, []);

  // Salvar preferência
  const handleModeChange = (newMode: "standard" | "accessible") => {
    setMode(newMode);
    localStorage.setItem("accessibility-mode", newMode);
  };

  return (
    <DualModeToggle
      mode={mode}
      onModeChange={handleModeChange}
    />
  );
}
```

### Efeito Visual do Modo Acessível

```
MODO PADRÃO:
- Font size: padrão
- Line height: 1.5
- Animações: ativas
- Contraste: moderado
- Espaçamento: normal

MODO ACESSÍVEL:
- Font size: +50% maior
- Line height: 1.8 (mais respiro)
- Animações: desabilitadas
- Contraste: máximo (preto/branco)
- Espaçamento: aumentado
- Focus rings: 3px roxa
```

---

## 5. ReviewPanel - Painel de Revisão

### Exemplo Básico

```tsx
"use client";

import { useState } from "react";
import { ReviewPanel } from "@/components/collaboration";

export function SlideReview({ courseId, slideId }: Props) {
  const [comments, setComments] = useState([]);

  const handleAddComment = (newComment: any) => {
    const comment = {
      id: `comment-${Date.now()}`,
      timestamp: new Date(),
      replies: [],
      ...newComment,
    };
    setComments([...comments, comment]);
  };

  return (
    <ReviewPanel
      courseId={courseId}
      slideId={slideId}
      comments={comments}
      onAddComment={handleAddComment}
    />
  );
}
```

### Com Integração de API

```tsx
import { useEffect, useState } from "react";
import { ReviewPanel } from "@/components/collaboration";
import { toast } from "sonner";

interface Comment {
  id: string;
  author: string;
  avatarUrl?: string;
  text: string;
  timestamp: Date;
  status: "pendente" | "resolvido";
  replies?: Comment[];
}

export function CourseReviewWithAPI({ courseId, slideId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar comentários
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(
          `/api/courses/${courseId}/slides/${slideId}/comments`
        );
        const data = await res.json();
        setComments(data.comments);
      } catch (error) {
        toast.error("Erro ao carregar comentários");
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [courseId, slideId]);

  // Adicionar comentário
  const handleAddComment = async (newComment: any) => {
    try {
      const res = await fetch(
        `/api/courses/${courseId}/slides/${slideId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newComment),
        }
      );

      if (!res.ok) throw new Error();

      const savedComment = await res.json();
      setComments([...comments, savedComment]);
      toast.success("Comentário adicionado!");
    } catch (error) {
      toast.error("Erro ao salvar comentário");
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <ReviewPanel
      courseId={courseId}
      slideId={slideId}
      comments={comments}
      onAddComment={handleAddComment}
    />
  );
}
```

### Estrutura de Comentário Esperada

```typescript
interface Comment {
  id: string;                              // ID único
  author: string;                          // Nome do autor
  avatarUrl?: string;                      // URL da imagem (opcional)
  text: string;                            // Texto do comentário
  timestamp: Date;                         // Data/hora
  status: "pendente" | "resolvido";        // Status
  replies?: Comment[];                     // Respostas aninhadas
}

// Exemplo de uso:
const comment = {
  id: "comment-123",
  author: "João Silva",
  avatarUrl: "https://api.example.com/avatars/joao.jpg",
  text: "Este slide precisa de melhor contraste",
  timestamp: new Date(),
  status: "pendente",
  replies: [
    {
      id: "reply-456",
      author: "Maria",
      text: "Concordo, vou melhorar",
      timestamp: new Date(Date.now() - 3600000),
      status: "pendente",
    }
  ]
};
```

---

## Integração Completa

### Page Component Exemplo

```tsx
// app/courses/[courseId]/editor/page.tsx
"use client";

import { useState } from "react";
import { WebcamRecorder, ScreenRecorder } from "@/components/media";
import { AccessibilityChecker, DualModeToggle } from "@/components/accessibility";
import { ReviewPanel } from "@/components/collaboration";
import { Button } from "@/components/ui/button";

export default function CourseEditorPage({ params }: Props) {
  const [webcamOpen, setWebcamOpen] = useState(false);
  const [screenOpen, setScreenOpen] = useState(false);
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);
  const [accessibilityMode, setAccessibilityMode] = useState("standard");
  const [comments, setComments] = useState([]);

  const courseId = params.courseId;
  const slideId = "slide-1"; // Do seu estado

  return (
    <div>
      {/* Top Bar */}
      <div className="flex justify-between items-center p-4 border-b">
        <h1>Editor de Curso</h1>
        <DualModeToggle
          mode={accessibilityMode as any}
          onModeChange={setAccessibilityMode as any}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-4 p-4">
        {/* Editor */}
        <div className="col-span-2">
          {/* Seu editor de slides aqui */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={() => setWebcamOpen(true)}>
                📹 Webcam
              </Button>
              <Button onClick={() => setScreenOpen(true)}>
                🖥️ Tela
              </Button>
              <Button onClick={() => setAccessibilityOpen(true)}>
                ♿ Acessibilidade
              </Button>
            </div>
          </div>
        </div>

        {/* Review Panel */}
        <div className="col-span-1 border-l p-4">
          <ReviewPanel
            courseId={courseId}
            slideId={slideId}
            comments={comments}
            onAddComment={(comment) => {
              setComments([...comments, {
                id: `comment-${Date.now()}`,
                timestamp: new Date(),
                replies: [],
                ...comment
              }]);
            }}
          />
        </div>
      </div>

      {/* Modals */}
      <WebcamRecorder
        open={webcamOpen}
        onOpenChange={setWebcamOpen}
        onRecordingComplete={(blob, url) => {
          console.log("Webcam:", url);
          setWebcamOpen(false);
        }}
      />

      <ScreenRecorder
        open={screenOpen}
        onOpenChange={setScreenOpen}
        onRecordingComplete={(blob, url) => {
          console.log("Screen:", url);
          setScreenOpen(false);
        }}
      />

      <AccessibilityChecker
        courseData={{ slides: [] }}
        open={accessibilityOpen}
        onOpenChange={setAccessibilityOpen}
      />
    </div>
  );
}
```

---

## Dicas de Implementação

1. **Permissões de Mídia**: Sempre peça permissão ao usuário antes de acessar câmera/microfone
2. **Erros de HTTPS**: getDisplayMedia requer contexto seguro (HTTPS ou localhost)
3. **Cleanup**: Limpe streams de mídia após o componente desmontar
4. **Upload**: Certifique-se que `/api/upload` está implementado
5. **Estado**: Use Context API ou Zustand para gerenciar estado global de modo acessível
6. **Feedback**: Use Sonner para toast notifications de sucesso/erro

---

**Última atualização:** 10 de Abril de 2026
