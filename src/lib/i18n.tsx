'use client';

// i18n — Internationalization for AccCourse Editor
// Supports PT-BR, EN, ES, FR with React Context

import React, { ReactNode, createContext, useContext, useState, useEffect } from 'react';

export type Locale = "pt-BR" | "en" | "es" | "fr";

export const AVAILABLE_LOCALES = [
  { code: "pt-BR", label: "Português" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
] as const;

export interface I18nStrings {
  // Dashboard
  dashboard: {
    title: string;
    create: string;
    search: string;
    empty: {
      title: string;
      subtitle: string;
      createFromScratch: string;
      useTemplate: string;
      generateAI: string;
    };
    stats: {
      courses: string;
      slides: string;
      published: string;
    };
  };
  // Sidebar
  sidebar: {
    myCourses: string;
    shared: string;
    templates: string;
    library: string;
    trash: string;
  };
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
    home: string;
    insert: string;
    interactions: string;
    design: string;
    tools: string;
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
  // Common
  common: {
    admin: string;
    delete: string;
    duplicate: string;
    edit: string;
    cancel: string;
    confirm: string;
  };
  // Footer
  footer: {
    copyright: string;
  };
}

const ptBR: I18nStrings = {
  dashboard: {
    title: "Meus Cursos",
    create: "Novo Curso",
    search: "Buscar cursos...",
    empty: {
      title: "Bem-vindo ao AccCourse!",
      subtitle: "Comece a criar seu primeiro curso interativo",
      createFromScratch: "Criar do Zero",
      useTemplate: "Usar Template",
      generateAI: "Gerar com IA",
    },
    stats: {
      courses: "Cursos Criados",
      slides: "Total de Slides",
      published: "Publicados",
    },
  },
  sidebar: {
    myCourses: "Meus Cursos",
    shared: "Compartilhados",
    templates: "Templates",
    library: "Biblioteca",
    trash: "Lixeira",
  },
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
    home: "Início",
    insert: "Inserir",
    interactions: "Interações",
    design: "Design",
    tools: "Ferramentas",
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
  common: {
    admin: "Admin",
    delete: "Excluir",
    duplicate: "Duplicar",
    edit: "Editar",
    cancel: "Cancelar",
    confirm: "Confirmar",
  },
  footer: {
    copyright: "© 2026 Accuracy. Todos os direitos reservados.",
  },
};

const en: I18nStrings = {
  dashboard: {
    title: "My Courses",
    create: "New Course",
    search: "Search courses...",
    empty: {
      title: "Welcome to AccCourse!",
      subtitle: "Start creating your first interactive course",
      createFromScratch: "Create from Scratch",
      useTemplate: "Use Template",
      generateAI: "Generate with AI",
    },
    stats: {
      courses: "Courses Created",
      slides: "Total Slides",
      published: "Published",
    },
  },
  sidebar: {
    myCourses: "My Courses",
    shared: "Shared",
    templates: "Templates",
    library: "Library",
    trash: "Trash",
  },
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
    home: "Home",
    insert: "Insert",
    interactions: "Interactions",
    design: "Design",
    tools: "Tools",
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
  common: {
    admin: "Admin",
    delete: "Delete",
    duplicate: "Duplicate",
    edit: "Edit",
    cancel: "Cancel",
    confirm: "Confirm",
  },
  footer: {
    copyright: "© 2026 Accuracy. All rights reserved.",
  },
};

const es: I18nStrings = {
  dashboard: {
    title: "Mis Cursos",
    create: "Nuevo Curso",
    search: "Buscar cursos...",
    empty: {
      title: "¡Bienvenido a AccCourse!",
      subtitle: "Comienza a crear tu primer curso interactivo",
      createFromScratch: "Crear desde Cero",
      useTemplate: "Usar Plantilla",
      generateAI: "Generar con IA",
    },
    stats: {
      courses: "Cursos Creados",
      slides: "Total de Diapositivas",
      published: "Publicados",
    },
  },
  sidebar: {
    myCourses: "Mis Cursos",
    shared: "Compartido",
    templates: "Plantillas",
    library: "Biblioteca",
    trash: "Papelera",
  },
  editor: {
    save: "Guardar",
    saving: "Guardando...",
    export: "Exportar SCORM",
    exporting: "Exportando...",
    preview: "Vista Previa",
    undo: "Deshacer",
    redo: "Rehacer",
    share: "Compartir",
    linkCopied: "¡Enlace copiado!",
    emptySlide: "Diapositiva vacía",
    emptySlideHint: "Usa la pestaña Insertar en la cinta superior para agregar bloques",
    slideOf: "de",
    addSlide: "Añadir diapositiva",
    duplicateSlide: "Duplicar diapositiva",
    deleteSlide: "Eliminar diapositiva",
    home: "Inicio",
    insert: "Insertar",
    interactions: "Interacciones",
    design: "Diseño",
    tools: "Herramientas",
  },
  toolbar: {
    file: "Archivo",
    insert: "Insertar",
    design: "Diseño",
    animations: "Animaciones",
    review: "Revisión",
    content: "Contenido",
    assessment: "Evaluación",
    interactive: "Interactivo",
    advanced: "Avanzado",
    theme: "Tema",
    fontFamily: "Fuente",
    fontSize: "Tamaño",
    layouts: "Diseños",
    importPptx: "Importar PPTX",
    contrast: "Contraste",
    shortcuts: "Atajos",
  },
  blocks: {
    text: "Texto",
    image: "Imagen",
    video: "Vídeo",
    audio: "Audio",
    shape: "Forma",
    flashcard: "Tarjeta",
    quiz: "Quiz",
    truefalse: "Verdadero/Falso",
    matching: "Emparejamiento",
    fillblank: "Completar",
    sorting: "Ordenamiento",
    hotspot: "Punto Caliente",
    accordion: "Acordeón",
    tabs: "Pestañas",
    branching: "Rama",
    timeline: "Línea de Tiempo",
    dragdrop: "Arrastrar y Soltar",
    interactiveVideo: "Vídeo Interactivo",
  },
  properties: {
    title: "Propiedades",
    position: "Posición",
    size: "Tamaño",
    style: "Estilo",
    content: "Contenido",
    options: "Opciones",
    feedback: "Comentarios",
    points: "Puntos",
    addItem: "Añadir",
    removeItem: "Eliminar",
    correct: "Correcto",
    incorrect: "Incorrecto",
    animation: "Animación",
    none: "Ninguno",
  },
  ai: {
    quizGen: "Quiz IA",
    courseGen: "Curso IA",
    generating: "Generando...",
    pasteContent: "Pega el contenido aquí...",
    numQuestions: "Número de preguntas",
    generate: "Generar",
    insertAll: "Insertar Todo",
  },
  export: {
    scormTitle: "Exportar SCORM",
    pdfTitle: "Exportar PDF",
    downloadStarted: "¡Descarga iniciada!",
    error: "Error al exportar",
  },
  analytics: {
    title: "Panel de Análisis",
    totalCourses: "Cursos Totales",
    totalSlides: "Total de Diapositivas",
    totalBlocks: "Total de Bloques",
    interactions: "Interacciones",
    maxPoints: "Puntos Máximos",
    avgSlidesPerCourse: "Promedio Diapositivas/Curso",
    avgBlocksPerSlide: "Promedio Bloques/Diapositiva",
    estimatedTime: "Tiempo Estimado",
  },
  common: {
    admin: "Admin",
    delete: "Eliminar",
    duplicate: "Duplicar",
    edit: "Editar",
    cancel: "Cancelar",
    confirm: "Confirmar",
  },
  footer: {
    copyright: "© 2026 Accuracy. Todos los derechos reservados.",
  },
};

const fr: I18nStrings = {
  dashboard: {
    title: "Mes Cours",
    create: "Nouveau Cours",
    search: "Rechercher des cours...",
    empty: {
      title: "Bienvenue sur AccCourse!",
      subtitle: "Commencez à créer votre premier cours interactif",
      createFromScratch: "Créer à partir de Zéro",
      useTemplate: "Utiliser un Modèle",
      generateAI: "Générer avec l'IA",
    },
    stats: {
      courses: "Cours Créés",
      slides: "Total des Diapositives",
      published: "Publiés",
    },
  },
  sidebar: {
    myCourses: "Mes Cours",
    shared: "Partagé",
    templates: "Modèles",
    library: "Bibliothèque",
    trash: "Corbeille",
  },
  editor: {
    save: "Enregistrer",
    saving: "Enregistrement...",
    export: "Exporter SCORM",
    exporting: "Exportation...",
    preview: "Aperçu",
    undo: "Annuler",
    redo: "Refaire",
    share: "Partager",
    linkCopied: "Lien copié!",
    emptySlide: "Diapositive vide",
    emptySlideHint: "Utilisez l'onglet Insérer du ruban ci-dessus pour ajouter des blocs",
    slideOf: "de",
    addSlide: "Ajouter une diapositive",
    duplicateSlide: "Dupliquer la diapositive",
    deleteSlide: "Supprimer la diapositive",
    home: "Accueil",
    insert: "Insérer",
    interactions: "Interactions",
    design: "Conception",
    tools: "Outils",
  },
  toolbar: {
    file: "Fichier",
    insert: "Insérer",
    design: "Conception",
    animations: "Animations",
    review: "Révision",
    content: "Contenu",
    assessment: "Évaluation",
    interactive: "Interactif",
    advanced: "Avancé",
    theme: "Thème",
    fontFamily: "Police",
    fontSize: "Taille",
    layouts: "Mises en Page",
    importPptx: "Importer PPTX",
    contrast: "Contraste",
    shortcuts: "Raccourcis",
  },
  blocks: {
    text: "Texte",
    image: "Image",
    video: "Vidéo",
    audio: "Audio",
    shape: "Forme",
    flashcard: "Carte Mémoire",
    quiz: "Quiz",
    truefalse: "Vrai/Faux",
    matching: "Appariement",
    fillblank: "Remplir les Vides",
    sorting: "Tri",
    hotspot: "Zone Cliquable",
    accordion: "Accordéon",
    tabs: "Onglets",
    branching: "Branching",
    timeline: "Chronologie",
    dragdrop: "Glisser-Déposer",
    interactiveVideo: "Vidéo Interactive",
  },
  properties: {
    title: "Propriétés",
    position: "Position",
    size: "Taille",
    style: "Style",
    content: "Contenu",
    options: "Options",
    feedback: "Retour d'Information",
    points: "Points",
    addItem: "Ajouter",
    removeItem: "Supprimer",
    correct: "Correct",
    incorrect: "Incorrect",
    animation: "Animation",
    none: "Aucun",
  },
  ai: {
    quizGen: "Quiz IA",
    courseGen: "Cours IA",
    generating: "Génération en cours...",
    pasteContent: "Collez le contenu ici...",
    numQuestions: "Nombre de questions",
    generate: "Générer",
    insertAll: "Insérer Tout",
  },
  export: {
    scormTitle: "Exporter SCORM",
    pdfTitle: "Exporter PDF",
    downloadStarted: "Téléchargement démarré!",
    error: "Erreur d'exportation",
  },
  analytics: {
    title: "Tableau de Bord",
    totalCourses: "Cours Totaux",
    totalSlides: "Total des Diapositives",
    totalBlocks: "Total des Blocs",
    interactions: "Interactions",
    maxPoints: "Points Maximum",
    avgSlidesPerCourse: "Moy. Diapositives/Cours",
    avgBlocksPerSlide: "Moy. Blocs/Diapositive",
    estimatedTime: "Temps Estimé",
  },
  common: {
    admin: "Admin",
    delete: "Supprimer",
    duplicate: "Dupliquer",
    edit: "Modifier",
    cancel: "Annuler",
    confirm: "Confirmer",
  },
  footer: {
    copyright: "© 2026 Accuracy. Tous droits réservés.",
  },
};

const locales: Record<Locale, I18nStrings> = {
  "pt-BR": ptBR,
  en,
  es,
  fr,
};

// React Context & Hooks
interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  translations: I18nStrings;
  locales: typeof AVAILABLE_LOCALES;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("pt-BR");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Hydrate from localStorage on mount
    const savedLocale = typeof window !== 'undefined' ? localStorage.getItem('i18n-locale') : null;
    if (savedLocale && (locales as Record<string, any>)[savedLocale]) {
      setLocaleState(savedLocale as Locale);
    }
    setIsMounted(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('i18n-locale', newLocale);
    }
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = locales[locale];
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === 'string' ? value : key;
  };

  const value: I18nContextType = {
    locale,
    setLocale,
    t,
    translations: locales[locale],
    locales: AVAILABLE_LOCALES,
  };

  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

// Legacy API compatibility
export function setLocale(locale: Locale) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('i18n-locale', locale);
  }
}

export function getLocale(): Locale {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('i18n-locale');
    if (saved && (locales as Record<string, any>)[saved]) {
      return saved as Locale;
    }
  }
  return "pt-BR";
}

export function t(): I18nStrings {
  const locale = getLocale();
  return locales[locale];
}

export function getAvailableLocales(): { id: Locale; name: string; flag: string }[] {
  return [
    { id: "pt-BR", name: "Português (BR)", flag: "🇧🇷" },
    { id: "en", name: "English", flag: "🇺🇸" },
    { id: "es", name: "Español", flag: "🇪🇸" },
    { id: "fr", name: "Français", flag: "🇫🇷" },
  ];
}
