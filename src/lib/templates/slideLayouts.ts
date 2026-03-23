import { Block, TextBlock, ImageBlock, FlashcardBlock } from "@/store/useEditorStore";

export type SlideTemplateId =
  | "title_slide"
  | "two_columns"
  | "bullet_points"
  | "media_showcase"
  | "flashcards_grid";

export interface SlideTemplate {
  id: SlideTemplateId;
  name: string;
  description: string;
  icon: string; // lucide icon name
  generateBlocks: () => Block[];
}

const createDefaultTextProps = (): Omit<TextBlock, "id" | "type" | "x" | "y" | "width" | "height" | "content"> => ({
  fontSize: 20,
  fontWeight: "400",
  fontStyle: "normal",
  textDecorationLine: "none",
  color: "#333333",
  textAlign: "left",
  lineHeight: 1.5,
  letterSpacing: 0,
  textShadow: "none",
  backgroundColor: "transparent",
  borderRadius: 0,
  opacity: 1,
  listType: "none",
  zIndex: 10,
});

const createDefaultImageProps = (): Omit<ImageBlock, "id" | "type" | "x" | "y" | "width" | "height"> => ({
  src: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=600&auto=format&fit=crop",
  alt: "Template Image",
  objectFit: "cover",
  opacity: 1,
  borderRadius: 8,
  borderWidth: 0,
  borderColor: "#000000",
  boxShadow: "none",
  zIndex: 10,
});

export const SLIDE_TEMPLATES: SlideTemplate[] = [
  {
    id: "title_slide",
    name: "Capa do Curso",
    description: "Ideal para iniciar um módulo com título de impacto.",
    icon: "LayoutTemplate",
    generateBlocks: () => [
      {
        id: crypto.randomUUID(),
        type: "text",
        x: 80,
        y: 180,
        width: 800,
        height: 100,
        content: "<p>Título Principal do Módulo</p>",
        ...createDefaultTextProps(),
        fontSize: 56,
        fontWeight: "700",
        textAlign: "center",
      } as TextBlock,
      {
        id: crypto.randomUUID(),
        type: "text",
        x: 80,
        y: 300,
        width: 800,
        height: 60,
        content: "<p>Breve descrição ou subtítulo apresentando o objetivo deste módulo.</p>",
        ...createDefaultTextProps(),
        fontSize: 24,
        textAlign: "center",
        opacity: 0.7,
      } as TextBlock,
    ],
  },
  {
    id: "two_columns",
    name: "Duas Colunas",
    description: "Texto de apoio à esquerda e recurso visual à direita.",
    icon: "Columns",
    generateBlocks: () => [
      {
        id: crypto.randomUUID(),
        type: "text",
        x: 60,
        y: 60,
        width: 840,
        height: 60,
        content: "<p>Tópico Principal</p>",
        ...createDefaultTextProps(),
        fontSize: 40,
        fontWeight: "600",
        color: "#1e293b",
      } as TextBlock,
      {
        id: crypto.randomUUID(),
        type: "text",
        x: 60,
        y: 150,
        width: 400,
        height: 330,
        content: "<p>Use esta área para descrever detalhadamente o tópico apresentado. Os blocos estão perfeitamente ajustados em um layout lado a lado para facilitar a compreensão e guiar a leitura de forma harmônica.</p>",
        ...createDefaultTextProps(),
        fontSize: 20,
      } as TextBlock,
      {
        id: crypto.randomUUID(),
        type: "image",
        x: 500,
        y: 150,
        width: 400,
        height: 330,
        ...createDefaultImageProps(),
      } as ImageBlock,
    ],
  },
  {
    id: "bullet_points",
    name: "Lista de Destaque",
    description: "Lista estruturada para facilitar o escaneamento e a memorização.",
    icon: "ListOrdered",
    generateBlocks: () => [
      {
        id: crypto.randomUUID(),
        type: "text",
        x: 80,
        y: 60,
        width: 800,
        height: 60,
        content: "<p>Pontos-Chave para Lembrar</p>",
        ...createDefaultTextProps(),
        fontSize: 40,
        fontWeight: "600",
      } as TextBlock,
      {
        id: crypto.randomUUID(),
        type: "text",
        x: 80,
        y: 160,
        width: 800,
        height: 300,
        content: "<ul><li>Primeiro conceito fundamental;</li><li>Abordagem prática do tema;</li><li>Melhores exemplos da indústria.</li></ul>",
        ...createDefaultTextProps(),
        fontSize: 24,
        listType: "ul",
        lineHeight: 1.8,
      } as TextBlock,
    ],
  },
  {
    id: "media_showcase",
    name: "Mídia em Foco",
    description: "Destaca uma grande imagem com título chamativo.",
    icon: "Image",
    generateBlocks: () => [
      {
        id: crypto.randomUUID(),
        type: "text",
        x: 60,
        y: 200,
        width: 350,
        height: 150,
        content: "<p>Uma Imagem<br/>Vale Mil<br/>Palavras</p>",
        ...createDefaultTextProps(),
        fontSize: 48,
        fontWeight: "800",
        lineHeight: 1.2,
      } as TextBlock,
      {
        id: crypto.randomUUID(),
        type: "image",
        x: 450,
        y: 60,
        width: 450,
        height: 420,
        ...createDefaultImageProps(),
      } as ImageBlock,
    ],
  },
  {
    id: "flashcards_grid",
    name: "Grid de Flashcards",
    description: "Uma sessão interativa contendo 3 cards viráveis para fixação.",
    icon: "GalleryHorizontal",
    generateBlocks: () => {
      const getFlashcard = (x: number): FlashcardBlock => ({
        id: crypto.randomUUID(),
        type: "flashcard",
        x,
        y: 160,
        width: 240,
        height: 300,
        zIndex: 10,
        frontContent: "<p>Conceito</p>",
        backContent: "<p>Definição oculta</p>",
        frontBg: "#4f46e5",
        backBg: "#1e293b",
        frontColor: "#ffffff",
        backColor: "#ffffff",
      });

      return [
        {
          id: crypto.randomUUID(),
          type: "text",
          x: 60,
          y: 60,
          width: 840,
          height: 60,
          content: "<p>Revisão Interativa (Clique para Virar)</p>",
          ...createDefaultTextProps(),
          fontSize: 36,
          fontWeight: "600",
          textAlign: "center",
        } as TextBlock,
        getFlashcard(80),
        getFlashcard(360),
        getFlashcard(640),
      ];
    },
  },
];
