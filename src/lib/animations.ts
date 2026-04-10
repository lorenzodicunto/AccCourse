/**
 * Animation definitions and CSS keyframe generator for the editor.
 * Provides animation presets, CSS generation, and preview utilities.
 */

export type AnimationCategory = "entrada" | "saída" | "ênfase";

export interface AnimationPreset {
  id: string;
  label: string;
  category: AnimationCategory;
  keyframes: string;
  defaultDuration: number; // seconds
}

// ─── Animation Presets ─────────────────────────────────────────────────────

const ENTRANCE_ANIMATIONS: AnimationPreset[] = [
  {
    id: "fadeIn",
    label: "Fade In",
    category: "entrada",
    keyframes: `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `,
    defaultDuration: 0.5,
  },
  {
    id: "slideInLeft",
    label: "Slide In (Esquerda)",
    category: "entrada",
    keyframes: `
      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-100px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `,
    defaultDuration: 0.6,
  },
  {
    id: "slideInRight",
    label: "Slide In (Direita)",
    category: "entrada",
    keyframes: `
      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(100px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `,
    defaultDuration: 0.6,
  },
  {
    id: "slideInUp",
    label: "Slide In (Acima)",
    category: "entrada",
    keyframes: `
      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(100px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
    defaultDuration: 0.6,
  },
  {
    id: "slideInDown",
    label: "Slide In (Abaixo)",
    category: "entrada",
    keyframes: `
      @keyframes slideInDown {
        from {
          opacity: 0;
          transform: translateY(-100px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
    defaultDuration: 0.6,
  },
  {
    id: "zoomIn",
    label: "Zoom In",
    category: "entrada",
    keyframes: `
      @keyframes zoomIn {
        from {
          opacity: 0;
          transform: scale(0.8);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
    `,
    defaultDuration: 0.5,
  },
  {
    id: "bounceIn",
    label: "Bounce In",
    category: "entrada",
    keyframes: `
      @keyframes bounceIn {
        0%, 100% {
          opacity: 1;
          transform: scale(1);
        }
        25% {
          opacity: 1;
          transform: scale(0.9);
        }
        50% {
          opacity: 1;
          transform: scale(1.05);
        }
        75% {
          opacity: 1;
          transform: scale(0.95);
        }
      }
    `,
    defaultDuration: 0.7,
  },
  {
    id: "flipIn",
    label: "Flip In",
    category: "entrada",
    keyframes: `
      @keyframes flipIn {
        from {
          opacity: 0;
          transform: perspective(400px) rotateX(90deg);
        }
        to {
          opacity: 1;
          transform: perspective(400px) rotateX(0deg);
        }
      }
    `,
    defaultDuration: 0.6,
  },
];

const EXIT_ANIMATIONS: AnimationPreset[] = [
  {
    id: "fadeOut",
    label: "Fade Out",
    category: "saída",
    keyframes: `
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `,
    defaultDuration: 0.5,
  },
  {
    id: "slideOutLeft",
    label: "Slide Out (Esquerda)",
    category: "saída",
    keyframes: `
      @keyframes slideOutLeft {
        from {
          opacity: 1;
          transform: translateX(0);
        }
        to {
          opacity: 0;
          transform: translateX(-100px);
        }
      }
    `,
    defaultDuration: 0.6,
  },
  {
    id: "slideOutRight",
    label: "Slide Out (Direita)",
    category: "saída",
    keyframes: `
      @keyframes slideOutRight {
        from {
          opacity: 1;
          transform: translateX(0);
        }
        to {
          opacity: 0;
          transform: translateX(100px);
        }
      }
    `,
    defaultDuration: 0.6,
  },
  {
    id: "zoomOut",
    label: "Zoom Out",
    category: "saída",
    keyframes: `
      @keyframes zoomOut {
        from {
          opacity: 1;
          transform: scale(1);
        }
        to {
          opacity: 0;
          transform: scale(0.8);
        }
      }
    `,
    defaultDuration: 0.5,
  },
];

const EMPHASIS_ANIMATIONS: AnimationPreset[] = [
  {
    id: "pulse",
    label: "Pulse",
    category: "ênfase",
    keyframes: `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
    `,
    defaultDuration: 0.6,
  },
  {
    id: "shake",
    label: "Shake",
    category: "ênfase",
    keyframes: `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
      }
    `,
    defaultDuration: 0.5,
  },
  {
    id: "bounce",
    label: "Bounce",
    category: "ênfase",
    keyframes: `
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
    `,
    defaultDuration: 0.6,
  },
  {
    id: "glow",
    label: "Glow",
    category: "ênfase",
    keyframes: `
      @keyframes glow {
        0%, 100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.7); }
        50% { box-shadow: 0 0 0 10px rgba(168, 85, 247, 0); }
      }
    `,
    defaultDuration: 1,
  },
];

// ─── Public API ─────────────────────────────────────────────────────────────

export function getAllAnimations(): AnimationPreset[] {
  return [...ENTRANCE_ANIMATIONS, ...EXIT_ANIMATIONS, ...EMPHASIS_ANIMATIONS];
}

export function getEntranceAnimations(): AnimationPreset[] {
  return ENTRANCE_ANIMATIONS;
}

export function getExitAnimations(): AnimationPreset[] {
  return EXIT_ANIMATIONS;
}

export function getEmphasisAnimations(): AnimationPreset[] {
  return EMPHASIS_ANIMATIONS;
}

export function getAnimationPreset(id: string): AnimationPreset | undefined {
  return getAllAnimations().find((a) => a.id === id);
}

export function getAnimationLabel(id: string): string {
  const preset = getAnimationPreset(id);
  return preset?.label || "Nenhuma";
}

/**
 * Generate inline style for animation preview in the UI.
 * Returns a style object that can be applied directly to a React element.
 */
export function getAnimationPreview(
  animationId: string,
  duration: number = 0.5,
  delay: number = 0
): React.CSSProperties {
  if (!animationId || animationId === "none") {
    return {};
  }

  const preset = getAnimationPreset(animationId);
  if (!preset) return {};

  return {
    animation: `${animationId} ${duration}s ease-in-out ${delay}s forwards`,
  };
}

/**
 * Generate CSS string for all animations on a slide.
 * Used for SCORM export and preview rendering.
 */
export interface BlockAnimationConfig {
  blockId: string;
  enterType: string;
  enterDuration: number;
  enterDelay: number;
  exitType: string;
  exitDuration: number;
  exitDelay: number;
}

export function generateAnimationCSS(
  animations: BlockAnimationConfig[]
): string {
  const keyframesSet = new Set<string>();
  const rules: string[] = [];

  // Collect all keyframes
  animations.forEach(({ enterType, exitType }) => {
    if (enterType && enterType !== "none") {
      const preset = getAnimationPreset(enterType);
      if (preset) keyframesSet.add(preset.keyframes);
    }
    if (exitType && exitType !== "none") {
      const preset = getAnimationPreset(exitType);
      if (preset) keyframesSet.add(preset.keyframes);
    }
  });

  // Generate CSS for each block
  animations.forEach(
    ({
      blockId,
      enterType,
      enterDuration,
      enterDelay,
      exitType,
      exitDuration,
      exitDelay,
    }) => {
      if (enterType && enterType !== "none") {
        const timing = `${enterDuration}s ease-in-out ${enterDelay}s forwards`;
        rules.push(`
#${blockId}.enter-animation {
  animation: ${enterType} ${timing};
}
        `);
      }
      if (exitType && exitType !== "none") {
        const timing = `${exitDuration}s ease-in-out ${exitDelay}s forwards`;
        rules.push(`
#${blockId}.exit-animation {
  animation: ${exitType} ${timing};
}
        `);
      }
    }
  );

  const keyframesCSS = Array.from(keyframesSet).join("\n");
  const rulesCSS = rules.join("\n");

  return `
/* Animation Keyframes */
${keyframesCSS}

/* Animation Rules */
${rulesCSS}
  `.trim();
}

/**
 * Get animation category for a given animation ID.
 */
export function getAnimationCategory(id: string): AnimationCategory | null {
  const preset = getAnimationPreset(id);
  return preset?.category || null;
}

/**
 * Get color accent for animation category in UI.
 */
export function getAnimationCategoryColor(
  category: AnimationCategory
): string {
  switch (category) {
    case "entrada":
      return "bg-emerald-100 text-emerald-700";
    case "saída":
      return "bg-orange-100 text-orange-700";
    case "ênfase":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

/**
 * Get Lucide icon name for animation category.
 */
export function getAnimationCategoryIcon(category: AnimationCategory): string {
  switch (category) {
    case "entrada":
      return "play";
    case "saída":
      return "log-out";
    case "ênfase":
      return "zap";
    default:
      return "animation";
  }
}
