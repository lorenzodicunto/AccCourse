// SCORM Course HTML Generator
// Generates the index.html content from course slides and blocks

import { CourseProject, Block, TextBlock, ImageBlock, FlashcardBlock, QuizBlock, VideoBlock, ShapeBlock, AudioBlock } from "@/store/useEditorStore";
import { sanitizeHtml } from "@/lib/sanitize";

export function generateCourseHTML(project: CourseProject, assetMap?: Map<string, string>): string {
  const slides = [...project.slides].sort((a, b) => a.order - b.order);
  const totalSlides = slides.length;

  // Count total quiz blocks and max points
  let totalQuizBlocks = 0;
  let totalMaxPoints = 0;
  slides.forEach((slide) => {
    slide.blocks.forEach((block) => {
      if (block.type === "quiz") {
        totalQuizBlocks++;
        totalMaxPoints += (block as QuizBlock).pointsValue || 10;
      }
    });
  });

  const passingScore = project.quizSettings?.passingScore ?? 70;
  const maxAttempts = project.quizSettings?.maxAttempts ?? 3;
  const showResults = project.quizSettings?.showResults !== false;

  const slidesHTML = slides
    .map((slide, index) => {
      const blocksHTML = slide.blocks
        .map((block) => generateBlockHTML(block, assetMap))
        .join("\n");

      return `
    <div class="slide" id="slide-${index}" data-index="${index}" style="background-color: ${slide.background};">
      <div class="slide-content">
        ${blocksHTML}
      </div>
    </div>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(project.title)}</title>
  <link rel="stylesheet" href="styles.css">
  <script src="scorm-api.js"><\/script>
</head>
<body>
  <!-- Top Bar -->
  <header class="top-bar">
    <div class="course-title">${escapeHtml(project.title)}</div>
    <div class="slide-counter">
      <span id="currentSlide">1</span> / ${totalSlides}
    </div>
  </header>

  <!-- Slides Container -->
  <main class="slides-container">
    ${slidesHTML}
  </main>

  <!-- Navigation -->
  <nav class="navigation">
    <button class="nav-btn" id="prevBtn" onclick="prevSlide()" disabled>
      &#8592; Anterior
    </button>
    <div class="progress-bar">
      <div class="progress-fill" id="progressFill" style="width: ${totalSlides > 0 ? (1 / totalSlides) * 100 : 0}%"></div>
    </div>
    <button class="nav-btn" id="nextBtn" onclick="nextSlide()">
      Próximo &#8594;
    </button>
  </nav>

  ${showResults && totalQuizBlocks > 0 ? `
  <!-- Results overlay -->
  <div id="resultsOverlay" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:1000; display:none; align-items:center; justify-content:center;">
    <div style="background:#fff; border-radius:20px; padding:40px 48px; max-width:480px; text-align:center; box-shadow:0 25px 50px rgba(0,0,0,0.25);">
      <div id="resultIcon" style="font-size:64px; margin-bottom:16px;"></div>
      <h2 id="resultTitle" style="font-size:24px; font-weight:700; margin:0 0 8px;"></h2>
      <p id="resultMessage" style="font-size:16px; color:#64748b; margin:0 0 24px;"></p>
      <div id="resultScore" style="font-size:48px; font-weight:800; margin:16px 0;"></div>
      <p id="resultDetails" style="font-size:14px; color:#94a3b8;"></p>
    </div>
  </div>
  ` : ""}

  <script>
    (function() {
      var currentIndex = 0;
      var totalSlides = ${totalSlides};
      var slides = document.querySelectorAll('.slide');
      var prevBtn = document.getElementById('prevBtn');
      var nextBtn = document.getElementById('nextBtn');
      var currentSlideEl = document.getElementById('currentSlide');
      var progressFill = document.getElementById('progressFill');

      // Quiz tracking
      var quizResults = {};
      var totalQuizBlocks = ${totalQuizBlocks};
      var totalMaxPoints = ${totalMaxPoints};
      var passingScore = ${passingScore};

      // Resume from bookmark
      if (window.SCORM && window.SCORM.initialized) {
        var bookmark = window.SCORM.getBookmark();
        if (bookmark > 0 && bookmark < totalSlides) {
          currentIndex = bookmark;
        }
      }

      function showSlide(index) {
        slides.forEach(function(s, i) {
          s.classList.toggle('active', i === index);
        });
        currentSlideEl.textContent = index + 1;
        prevBtn.disabled = index === 0;
        progressFill.style.width = ((index + 1) / totalSlides * 100) + '%';

        if (index === totalSlides - 1) {
          nextBtn.textContent = 'Concluir ✓';
          nextBtn.classList.add('complete');
        } else {
          nextBtn.textContent = 'Próximo →';
          nextBtn.classList.remove('complete');
        }

        // Save bookmark
        if (window.SCORM && window.SCORM.initialized) {
          window.SCORM.setBookmark(index);
          window.SCORM.save();
        }
      }

      function calculateScore() {
        var earnedPoints = 0;
        for (var key in quizResults) {
          if (quizResults[key].correct) {
            earnedPoints += quizResults[key].points;
          }
        }
        return {
          earned: earnedPoints,
          total: totalMaxPoints,
          percentage: totalMaxPoints > 0 ? Math.round((earnedPoints / totalMaxPoints) * 100) : 100,
          passed: totalMaxPoints > 0 ? Math.round((earnedPoints / totalMaxPoints) * 100) >= passingScore : true
        };
      }

      function showResults() {
        var score = calculateScore();
        var overlay = document.getElementById('resultsOverlay');
        if (!overlay) return;

        document.getElementById('resultIcon').textContent = score.passed ? '🎉' : '📚';
        document.getElementById('resultTitle').textContent = score.passed ? 'Parabéns!' : 'Continue estudando';
        document.getElementById('resultMessage').textContent = score.passed
          ? 'Você foi aprovado neste curso!'
          : 'Você não atingiu a nota mínima de ' + passingScore + '%.';
        document.getElementById('resultScore').textContent = score.percentage + '%';
        document.getElementById('resultScore').style.color = score.passed ? '#10b981' : '#ef4444';
        document.getElementById('resultDetails').textContent =
          score.earned + ' de ' + score.total + ' pontos';

        overlay.style.display = 'flex';
      }

      window.nextSlide = function() {
        if (currentIndex < totalSlides - 1) {
          currentIndex++;
          showSlide(currentIndex);
        } else {
          // Complete the course
          var score = calculateScore();

          if (window.SCORM && window.SCORM.initialized) {
            if (totalQuizBlocks > 0) {
              window.SCORM.setScore(score.percentage);
            } else {
              window.SCORM.complete();
            }
          }

          ${showResults && totalQuizBlocks > 0 ? "showResults();" : `
          nextBtn.textContent = '✓ Concluído!';
          nextBtn.disabled = true;
          `}
        }
      };

      window.prevSlide = function() {
        if (currentIndex > 0) {
          currentIndex--;
          showSlide(currentIndex);
        }
      };

      // Flashcard flip handlers
      document.querySelectorAll('.flashcard-block').forEach(function(card) {
        card.addEventListener('click', function() {
          this.classList.toggle('flipped');
        });
      });

      // Quiz handlers with scoring
      document.querySelectorAll('.quiz-option').forEach(function(opt) {
        opt.addEventListener('click', function() {
          var quizBlock = this.closest('.quiz-block');
          if (quizBlock.classList.contains('answered')) return;

          quizBlock.classList.add('answered');
          var isCorrect = this.dataset.correct === 'true';
          var quizId = quizBlock.dataset.quizId;
          var points = parseInt(quizBlock.dataset.points || '10', 10);

          this.classList.add(isCorrect ? 'correct' : 'incorrect');

          // Highlight correct answer
          quizBlock.querySelectorAll('.quiz-option').forEach(function(o) {
            if (o.dataset.correct === 'true') o.classList.add('correct');
            o.style.pointerEvents = 'none';
          });

          // Show feedback
          var feedbackEl = quizBlock.querySelector(isCorrect ? '.feedback-correct' : '.feedback-incorrect');
          if (feedbackEl) feedbackEl.style.display = 'block';

          // Show points earned
          var pointsEl = quizBlock.querySelector('.quiz-points-result');
          if (pointsEl) {
            pointsEl.textContent = isCorrect
              ? '+' + points + ' pontos ✓'
              : '0 pontos ✗';
            pointsEl.style.color = isCorrect ? '#10b981' : '#ef4444';
            pointsEl.style.display = 'block';
          }

          // Track quiz result
          quizResults[quizId] = { correct: isCorrect, points: points };

          // Save to LMS
          if (window.SCORM && window.SCORM.initialized) {
            window.SCORM.save();
          }
        });
      });

      // Keyboard navigation
      document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); window.nextSlide(); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); window.prevSlide(); }
      });

      // Init
      showSlide(currentIndex);
    })();
  <\/script>
</body>
</html>`;
}

function generateBlockHTML(block: Block, assetMap?: Map<string, string>): string {
  const style = `position: absolute; left: ${(block.x / 960) * 100}%; top: ${(block.y / 540) * 100}%; width: ${(block.width / 960) * 100}%; height: ${(block.height / 540) * 100}%;`;

  switch (block.type) {
    case "text":
      return generateTextBlockHTML(block as TextBlock, style);
    case "image":
      return generateImageBlockHTML(block as ImageBlock, style, assetMap);
    case "flashcard":
      return generateFlashcardBlockHTML(block as FlashcardBlock, style);
    case "quiz":
      return generateQuizBlockHTML(block as QuizBlock, style);
    case "video":
      return generateVideoBlockHTML(block as VideoBlock, style);
    case "shape":
      return generateShapeBlockHTML(block as ShapeBlock, style);
    case "audio":
      return generateAudioBlockHTML(block as AudioBlock, style);
    default:
      return "";
  }
}

function generateTextBlockHTML(block: TextBlock, style: string): string {
  const extraStyles = [
    block.fontStyle && block.fontStyle !== "normal" ? `font-style: ${block.fontStyle};` : "",
    block.textDecorationLine && block.textDecorationLine !== "none" ? `text-decoration: ${block.textDecorationLine};` : "",
    block.lineHeight ? `line-height: ${block.lineHeight};` : "",
    block.letterSpacing ? `letter-spacing: ${block.letterSpacing}px;` : "",
    block.textShadow && block.textShadow !== "none" ? `text-shadow: ${block.textShadow};` : "",
    block.backgroundColor && block.backgroundColor !== "transparent" ? `background-color: ${block.backgroundColor};` : "",
    block.borderRadius ? `border-radius: ${block.borderRadius}px;` : "",
    block.opacity !== undefined && block.opacity < 1 ? `opacity: ${block.opacity};` : "",
  ].filter(Boolean).join(" ");

  return `
        <div class="block text-block" style="${style} font-size: ${block.fontSize}px; font-weight: ${block.fontWeight}; color: ${block.color}; text-align: ${block.textAlign}; ${extraStyles} padding: 12px;">
          ${sanitizeHtml(block.content)}
        </div>`;
}

function generateImageBlockHTML(block: ImageBlock, style: string, assetMap?: Map<string, string>): string {
  if (!block.src) return "";

  let resolvedSrc = block.src;
  if (assetMap && block.src.startsWith('/uploads/')) {
    resolvedSrc = assetMap.get(block.src) || block.src;
  }

  const imgStyles = [
    `object-fit: ${block.objectFit}`,
    block.borderRadius !== undefined ? `border-radius: ${block.borderRadius}px` : "border-radius: 12px",
  ].join("; ");

  const containerStyles = [
    block.opacity !== undefined && block.opacity < 1 ? `opacity: ${block.opacity};` : "",
    block.borderWidth ? `border: ${block.borderWidth}px solid ${block.borderColor || "#e2e8f0"};` : "",
    block.borderRadius !== undefined ? `border-radius: ${block.borderRadius}px;` : "border-radius: 12px;",
    block.boxShadow && block.boxShadow !== "none" ? `box-shadow: ${block.boxShadow};` : "",
    "overflow: hidden;",
  ].filter(Boolean).join(" ");

  return `
        <div class="block image-block" style="${style} ${containerStyles}">
          <img src="${resolvedSrc}" alt="${escapeHtml(block.alt)}" style="width: 100%; height: 100%; ${imgStyles};" />
        </div>`;
}

function generateFlashcardBlockHTML(block: FlashcardBlock, style: string): string {
  return `
        <div class="block flashcard-block" style="${style}">
          <div class="flashcard-inner">
            <div class="flashcard-front" style="background-color: ${block.frontBg};">
              <p>${escapeHtml(block.frontContent)}</p>
              <span class="flip-hint">Clique para virar →</span>
            </div>
            <div class="flashcard-back" style="background-color: ${block.backBg};">
              <p>${escapeHtml(block.backContent)}</p>
              <span class="flip-hint">← Clique para voltar</span>
            </div>
          </div>
        </div>`;
}

function generateQuizBlockHTML(block: QuizBlock, style: string): string {
  const quizId = `quiz-${block.id}`;
  const points = block.pointsValue || 10;

  const optionsHTML = block.options
    .map(
      (opt) =>
        `<button class="quiz-option" data-correct="${opt.isCorrect}">${escapeHtml(opt.text)}</button>`
    )
    .join("\n              ");

  return `
        <div class="block quiz-block" style="${style}" data-quiz-id="${quizId}" data-points="${points}">
          <div class="quiz-question">${escapeHtml(block.question)}</div>
          <div class="quiz-points-label" style="font-size: 11px; color: #94a3b8; margin-bottom: 8px;">Vale ${points} pontos</div>
          <div class="quiz-options">
              ${optionsHTML}
          </div>
          <div class="feedback-correct" style="display:none;">${escapeHtml(block.feedback.correct)}</div>
          <div class="feedback-incorrect" style="display:none;">${escapeHtml(block.feedback.incorrect)}</div>
          <div class="quiz-points-result" style="display:none; font-weight:700; font-size:14px; margin-top:8px;"></div>
        </div>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function generateVideoBlockHTML(block: VideoBlock, style: string): string {
  if (!block.url) return "";

  const ytMatch = block.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  const vimeoMatch = block.url.match(/vimeo\.com\/(\d+)/);

  let videoHTML: string;
  if (ytMatch) {
    videoHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${ytMatch[1]}?enablejsapi=1" width="100%" height="100%" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius: 12px;"></iframe>`;
  } else if (vimeoMatch) {
    videoHTML = `<iframe src="https://player.vimeo.com/video/${vimeoMatch[1]}" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="border-radius: 12px;"></iframe>`;
  } else {
    videoHTML = `<video src="${escapeHtml(block.url)}" controls width="100%" height="100%" style="border-radius: 12px; object-fit: contain;"></video>`;
  }

  return `
        <div class="block video-block" style="${style} background: #000; border-radius: 12px; overflow: hidden;">
          ${videoHTML}
        </div>`;
}

function generateShapeBlockHTML(block: ShapeBlock, style: string): string {
  const opacity = block.opacity !== undefined && block.opacity < 1 ? `opacity: ${block.opacity};` : "";
  const rotation = block.rotation ? `transform: rotate(${block.rotation}deg);` : "";
  const fill = block.fillColor || "#7c3aed";
  const stroke = block.strokeColor || "#4f46e5";
  const sw = block.strokeWidth ?? 2;

  let shapeSVG: string;
  switch (block.shapeType) {
    case "circle":
      shapeSVG = `<ellipse cx="100" cy="100" rx="95" ry="95" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" />`;
      break;
    case "rounded-rect":
      shapeSVG = `<rect x="5" y="5" width="190" height="190" rx="30" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" />`;
      break;
    case "triangle":
      shapeSVG = `<polygon points="100,10 190,190 10,190" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" />`;
      break;
    case "arrow":
      shapeSVG = `<polygon points="100,10 190,100 140,100 140,190 60,190 60,100 10,100" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" />`;
      break;
    case "line":
      shapeSVG = `<line x1="10" y1="100" x2="190" y2="100" stroke="${stroke}" stroke-width="${Math.max(sw, 4)}" stroke-linecap="round" />`;
      break;
    case "star":
      shapeSVG = `<polygon points="100,10 125,75 195,80 140,130 155,195 100,160 45,195 60,130 5,80 75,75" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" />`;
      break;
    case "rectangle":
    default:
      shapeSVG = `<rect x="5" y="5" width="190" height="190" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" />`;
      break;
  }

  return `
        <div class="block shape-block" style="${style} ${opacity} ${rotation}">
          <svg viewBox="0 0 200 200" width="100%" height="100%" preserveAspectRatio="none">
            ${shapeSVG}
          </svg>
        </div>`;
}

function generateAudioBlockHTML(block: AudioBlock, style: string): string {
  const attrs = [];
  if (block.showControls !== false) attrs.push('controls');
  if (block.autoplay) attrs.push('autoplay');
  if (block.loop) attrs.push('loop');
  
  if (!block.src) {
    return `<div class="block audio-block" style="${style};display:flex;align-items:center;justify-content:center;background:rgba(139,92,246,0.1);border-radius:8px;color:#8b5cf6;font-size:12px;">🎵 Áudio</div>`;
  }
  
  return `<div class="block audio-block" style="${style};display:flex;align-items:center;justify-content:center;"><audio src="${block.src}" ${attrs.join(' ')} style="width:90%;max-height:40px;">Seu navegador não suporta áudio.</audio></div>`;
}
