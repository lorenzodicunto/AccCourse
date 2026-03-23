// i18n — Internationalization for AccCourse Editor
// Supports PT-BR and EN by default

export type Locale = "pt-BR" | "en";

export interface I18nStrings {
  // Editor
  editor: {
    save: string;
    saving: string;
    export: string;
    exporting: string;
    preview: string;
    undo: string;
    redo: string;
    share: string;
    linkCopied: string;
    emptySlide: string;
    emptySlideHint: string;
    slideOf: string;
    addSlide: string;
    duplicateSlide: string;
    deleteSlide: string;
  };
  // Toolbar
  toolbar: {
    file: string;
    insert: string;
    design: string;
    animations: string;
    review: string;
    content: string;
    assessment: string;
    interactive: string;
    advanced: string;
    theme: string;
    fontFamily: string;
    fontSize: string;
    layouts: string;
    importPptx: string;
    contrast: string;
    shortcuts: string;
  };
  // Blocks
  blocks: {
    text: string;
    image: string;
    video: string;
    audio: string;
    shape: string;
    flashcard: string;
    quiz: string;
    truefalse: string;
    matching: string;
    fillblank: string;
    sorting: string;
    hotspot: string;
    accordion: string;
    tabs: string;
    branching: string;
    timeline: string;
    dragdrop: string;
    interactiveVideo: string;
  };
  // Properties
  properties: {
    title: string;
    position: string;
    size: string;
    style: string;
    content: string;
    options: string;
    feedback: string;
    points: string;
    addItem: string;
    removeItem: string;
    correct: string;
    incorrect: string;
    animation: string;
    none: string;
  };
  // AI
  ai: {
    quizGen: string;
    courseGen: string;
    generating: string;
    pasteContent: string;
    numQuestions: string;
    generate: string;
    insertAll: string;
  };
  // Export
  export: {
    scormTitle: string;
    pdfTitle: string;
    downloadStarted: string;
    error: string;
  };
  // Analytics
  analytics: {
    title: string;
    totalCourses: string;
    totalSlides: string;
    totalBlocks: string;
    interactions: string;
    maxPoints: string;
    avgSlidesPerCourse: string;
    avgBlocksPerSlide: string;
    estimatedTime: string;
  };
}

const ptBR: I18nStrings = {
  editor: {
    save: "Salvar",
    saving: "Salvando...",
    export: "Exportar SCORM",
    exporting: "Exportando...",
    preview: "Preview",
    undo: "Desfazer",
    redo: "Refazer",
    share: "Compartilhar",
    linkCopied: "Link copiado!",
    emptySlide: "Slide vazio",
    emptySlideHint: "Use a aba Inserir no ribbon acima para adicionar blocos",
    slideOf: "de",
    addSlide: "Adicionar slide",
    duplicateSlide: "Duplicar slide",
    deleteSlide: "Excluir slide",
  },
  toolbar: {
    file: "Arquivo",
    insert: "Inserir",
    design: "Design",
    animations: "Animações",
    review: "Revisão",
    content: "Conteúdo",
    assessment: "Avaliação",
    interactive: "Interativo",
    advanced: "Avançado",
    theme: "Tema",
    fontFamily: "Fonte",
    fontSize: "Tamanho",
    layouts: "Layouts",
    importPptx: "Importar PPTX",
    contrast: "Contraste",
    shortcuts: "Atalhos",
  },
  blocks: {
    text: "Texto",
    image: "Imagem",
    video: "Vídeo",
    audio: "Áudio",
    shape: "Forma",
    flashcard: "Flashcard",
    quiz: "Quiz",
    truefalse: "V ou F",
    matching: "Associação",
    fillblank: "Lacunas",
    sorting: "Ordenação",
    hotspot: "Hotspot",
    accordion: "Acordeão",
    tabs: "Abas",
    branching: "Cenário",
    timeline: "Linha do Tempo",
    dragdrop: "Arrastar",
    interactiveVideo: "Vídeo Int.",
  },
  properties: {
    title: "Propriedades",
    position: "Posição",
    size: "Tamanho",
    style: "Estilo",
    content: "Conteúdo",
    options: "Opções",
    feedback: "Feedback",
    points: "Pontos",
    addItem: "Adicionar",
    removeItem: "Remover",
    correct: "Correto",
    incorrect: "Incorreto",
    animation: "Animação",
    none: "Nenhum",
  },
  ai: {
    quizGen: "AI Quiz",
    courseGen: "AI Curso",
    generating: "Gerando...",
    pasteContent: "Cole o conteúdo aqui...",
    numQuestions: "Número de perguntas",
    generate: "Gerar",
    insertAll: "Inserir Todos",
  },
  export: {
    scormTitle: "Exportar SCORM",
    pdfTitle: "Exportar PDF",
    downloadStarted: "Download iniciado!",
    error: "Erro ao exportar",
  },
  analytics: {
    title: "Analytics Dashboard",
    totalCourses: "Total de Cursos",
    totalSlides: "Total de Slides",
    totalBlocks: "Total de Blocos",
    interactions: "Interações",
    maxPoints: "Pontos Máximos",
    avgSlidesPerCourse: "Média Slides/Curso",
    avgBlocksPerSlide: "Média Blocos/Slide",
    estimatedTime: "Tempo Estimado",
  },
};

const en: I18nStrings = {
  editor: {
    save: "Save",
    saving: "Saving...",
    export: "Export SCORM",
    exporting: "Exporting...",
    preview: "Preview",
    undo: "Undo",
    redo: "Redo",
    share: "Share",
    linkCopied: "Link copied!",
    emptySlide: "Empty slide",
    emptySlideHint: "Use the Insert tab in the ribbon above to add blocks",
    slideOf: "of",
    addSlide: "Add slide",
    duplicateSlide: "Duplicate slide",
    deleteSlide: "Delete slide",
  },
  toolbar: {
    file: "File",
    insert: "Insert",
    design: "Design",
    animations: "Animations",
    review: "Review",
    content: "Content",
    assessment: "Assessment",
    interactive: "Interactive",
    advanced: "Advanced",
    theme: "Theme",
    fontFamily: "Font",
    fontSize: "Size",
    layouts: "Layouts",
    importPptx: "Import PPTX",
    contrast: "Contrast",
    shortcuts: "Shortcuts",
  },
  blocks: {
    text: "Text",
    image: "Image",
    video: "Video",
    audio: "Audio",
    shape: "Shape",
    flashcard: "Flashcard",
    quiz: "Quiz",
    truefalse: "True/False",
    matching: "Matching",
    fillblank: "Fill Blank",
    sorting: "Sorting",
    hotspot: "Hotspot",
    accordion: "Accordion",
    tabs: "Tabs",
    branching: "Branching",
    timeline: "Timeline",
    dragdrop: "Drag & Drop",
    interactiveVideo: "Interactive Video",
  },
  properties: {
    title: "Properties",
    position: "Position",
    size: "Size",
    style: "Style",
    content: "Content",
    options: "Options",
    feedback: "Feedback",
    points: "Points",
    addItem: "Add",
    removeItem: "Remove",
    correct: "Correct",
    incorrect: "Incorrect",
    animation: "Animation",
    none: "None",
  },
  ai: {
    quizGen: "AI Quiz",
    courseGen: "AI Course",
    generating: "Generating...",
    pasteContent: "Paste content here...",
    numQuestions: "Number of questions",
    generate: "Generate",
    insertAll: "Insert All",
  },
  export: {
    scormTitle: "Export SCORM",
    pdfTitle: "Export PDF",
    downloadStarted: "Download started!",
    error: "Export error",
  },
  analytics: {
    title: "Analytics Dashboard",
    totalCourses: "Total Courses",
    totalSlides: "Total Slides",
    totalBlocks: "Total Blocks",
    interactions: "Interactions",
    maxPoints: "Max Points",
    avgSlidesPerCourse: "Avg Slides/Course",
    avgBlocksPerSlide: "Avg Blocks/Slide",
    estimatedTime: "Estimated Time",
  },
};

const locales: Record<Locale, I18nStrings> = {
  "pt-BR": ptBR,
  en,
};

let currentLocale: Locale = "pt-BR";

export function setLocale(locale: Locale) {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(): I18nStrings {
  return locales[currentLocale];
}

export function getAvailableLocales(): { id: Locale; name: string; flag: string }[] {
  return [
    { id: "pt-BR", name: "Português (BR)", flag: "🇧🇷" },
    { id: "en", name: "English", flag: "🇺🇸" },
  ];
}
