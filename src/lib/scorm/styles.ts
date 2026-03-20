// SCORM Course Styles Generator

export function generateStyles(
  primaryColor: string,
  fontFamily: string,
  customFontUrl?: string | null,
  assetMap?: Map<string, string>
): string {
  const fontName = fontFamily.replace(', sans-serif', '').trim();
  
  // Generate font import/declaration
  let fontDeclaration: string;
  if (customFontUrl) {
    // Resolve font URL: check if it's a local upload that needs asset mapping
    let resolvedUrl = customFontUrl;
    if (assetMap && customFontUrl.startsWith('/uploads/')) {
      resolvedUrl = assetMap.get(customFontUrl) || customFontUrl;
    }
    const format = customFontUrl.includes('woff2') ? 'woff2' : 'truetype';
    fontDeclaration = `@font-face {
  font-family: '${fontName}';
  src: url('${resolvedUrl}') format('${format}');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}`;
  } else {
    const googleFontName = fontName.replace(/\s+/g, '+');
    fontDeclaration = `@import url('https://fonts.googleapis.com/css2?family=${googleFontName}:wght@300;400;500;600;700&display=swap');`;
  }

  return `/* AccCourse SCORM Package Styles */
${fontDeclaration}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: ${fontFamily};
  background: linear-gradient(135deg, #f8f9fa 0%, #eef2ff 50%, #f5f3ff 100%);
  color: #1a1a2e;
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
}

/* ─── Top Bar ─── */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  z-index: 100;
}

.course-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
}

.slide-counter {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
  background: #f3f4f6;
  padding: 4px 12px;
  border-radius: 20px;
}

/* ─── Slides Container ─── */
.slides-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
}

.slide {
  display: none;
  position: relative;
  width: 100%;
  max-width: 960px;
  aspect-ratio: 16 / 9;
  border-radius: 20px;
  box-shadow:
    0 4px 6px rgba(0,0,0,0.04),
    0 12px 24px rgba(0,0,0,0.06),
    0 24px 48px rgba(0,0,0,0.04);
  overflow: hidden;
  animation: slideIn 0.4s ease-out;
  border: 1px solid rgba(0,0,0,0.06);
}

.slide.active {
  display: block;
}

.slide-content {
  position: relative;
  width: 100%;
  height: 100%;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

/* ─── Blocks ─── */
.block {
  border-radius: 12px;
  overflow: hidden;
}

.text-block {
  padding: 16px;
  line-height: 1.6;
  word-break: break-word;
}

.text-block p { margin-bottom: 8px; }
.text-block p:last-child { margin-bottom: 0; }

.image-block {
  border-radius: 12px;
  overflow: hidden;
}

/* ─── Flashcard ─── */
.flashcard-block {
  perspective: 600px;
  cursor: pointer;
  border-radius: 12px;
}

.flashcard-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.5s ease;
  transform-style: preserve-3d;
}

.flashcard-block.flipped .flashcard-inner {
  transform: rotateY(180deg);
}

.flashcard-front,
.flashcard-back {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: white;
  font-weight: 600;
  font-size: 16px;
  text-align: center;
}

.flashcard-back {
  transform: rotateY(180deg);
}

.flip-hint {
  font-size: 11px;
  opacity: 0.5;
  margin-top: 12px;
  font-weight: 400;
}

/* ─── Quiz ─── */
.quiz-block {
  background: white;
  border: 1px solid #e5e7eb;
  padding: 20px;
  border-radius: 12px;
}

.quiz-question {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1a1a2e;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quiz-option {
  display: block;
  width: 100%;
  padding: 10px 16px;
  text-align: left;
  font-size: 14px;
  background: #f8f9fa;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  color: #374151;
}

.quiz-option:hover:not(.correct):not(.incorrect) {
  background: #eef2ff;
  border-color: ${primaryColor};
  transform: translateX(4px);
}

.quiz-option.correct {
  background: #ecfdf5;
  border-color: #10b981;
  color: #065f46;
}

.quiz-option.incorrect {
  background: #fef2f2;
  border-color: #ef4444;
  color: #991b1b;
}

.feedback-correct {
  margin-top: 12px;
  padding: 10px 16px;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  border-radius: 10px;
  color: #065f46;
  font-size: 13px;
  font-weight: 500;
  animation: fadeIn 0.3s ease;
}

.feedback-incorrect {
  margin-top: 12px;
  padding: 10px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  color: #991b1b;
  font-size: 13px;
  font-weight: 500;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ─── Navigation ─── */
.navigation {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 24px;
  background: white;
  border-top: 1px solid #e5e7eb;
}

.nav-btn {
  padding: 8px 20px;
  font-size: 13px;
  font-weight: 600;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  white-space: nowrap;
}

.nav-btn:hover:not(:disabled) {
  background: ${primaryColor};
  border-color: ${primaryColor};
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px ${primaryColor}40;
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-btn.complete {
  background: #10b981;
  border-color: #10b981;
  color: white;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 100px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, ${primaryColor}, ${primaryColor}cc);
  border-radius: 100px;
  transition: width 0.4s ease;
}

/* ─── Responsive ─── */
@media (max-width: 768px) {
  .slides-container { padding: 12px; }
  .slide { border-radius: 12px; }
  .navigation { padding: 8px 12px; gap: 8px; }
  .nav-btn { padding: 6px 12px; font-size: 12px; }
  .top-bar { padding: 8px 16px; }
}
`;
}
