// SCORM Course HTML Generator
// Generates the index.html content from course slides and blocks

import { CourseProject, Block, TextBlock, ImageBlock, FlashcardBlock, QuizBlock, VideoBlock } from "@/store/useEditorStore";
import { sanitizeHtml } from "@/lib/sanitize";

export function generateCourseHTML(project: CourseProject, assetMap?: Map<string, string>): string {
  const slides = [...project.slides].sort((a, b) => a.order - b.order);
  const totalSlides = slides.length;

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

  <script>
    (function() {
      var currentIndex = 0;
      var totalSlides = ${totalSlides};
      var slides = document.querySelectorAll('.slide');
      var prevBtn = document.getElementById('prevBtn');
      var nextBtn = document.getElementById('nextBtn');
      var currentSlideEl = document.getElementById('currentSlide');
      var progressFill = document.getElementById('progressFill');

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

        // Save bookmark + commit immediately to prevent data loss
        if (window.SCORM && window.SCORM.initialized) {
          window.SCORM.setBookmark(index);
          window.SCORM.save();
        }
      }

      window.nextSlide = function() {
        if (currentIndex < totalSlides - 1) {
          currentIndex++;
          showSlide(currentIndex);
        } else {
          // Complete the course
          if (window.SCORM && window.SCORM.initialized) {
            window.SCORM.complete();
          }
          nextBtn.textContent = '✓ Concluído!';
          nextBtn.disabled = true;
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

      // Quiz handlers
      document.querySelectorAll('.quiz-option').forEach(function(opt) {
        opt.addEventListener('click', function() {
          var quizBlock = this.closest('.quiz-block');
          if (quizBlock.classList.contains('answered')) return;

          quizBlock.classList.add('answered');
          var isCorrect = this.dataset.correct === 'true';
          this.classList.add(isCorrect ? 'correct' : 'incorrect');

          // Highlight correct answer
          quizBlock.querySelectorAll('.quiz-option').forEach(function(o) {
            if (o.dataset.correct === 'true') o.classList.add('correct');
            o.style.pointerEvents = 'none';
          });

          // Show feedback
          var feedbackEl = quizBlock.querySelector(isCorrect ? '.feedback-correct' : '.feedback-incorrect');
          if (feedbackEl) feedbackEl.style.display = 'block';

          // Save quiz interaction to LMS immediately
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
    default:
      return "";
  }
}

function generateTextBlockHTML(block: TextBlock, style: string): string {
  return `
        <div class="block text-block" style="${style} font-size: ${block.fontSize}px; font-weight: ${block.fontWeight}; color: ${block.color}; text-align: ${block.textAlign};">
          ${sanitizeHtml(block.content)}
        </div>`;
}

function generateImageBlockHTML(block: ImageBlock, style: string, assetMap?: Map<string, string>): string {
  if (!block.src) return "";
  
  // Resolve image URL: replace /uploads/... with assets/... for SCORM
  let resolvedSrc = block.src;
  if (assetMap && block.src.startsWith('/uploads/')) {
    resolvedSrc = assetMap.get(block.src) || block.src;
  }
  
  return `
        <div class="block image-block" style="${style}">
          <img src="${resolvedSrc}" alt="${escapeHtml(block.alt)}" style="width: 100%; height: 100%; object-fit: ${block.objectFit}; border-radius: 12px;" />
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
  const optionsHTML = block.options
    .map(
      (opt) =>
        `<button class="quiz-option" data-correct="${opt.isCorrect}">${escapeHtml(opt.text)}</button>`
    )
    .join("\n              ");

  return `
        <div class="block quiz-block" style="${style}">
          <div class="quiz-question">${escapeHtml(block.question)}</div>
          <div class="quiz-options">
              ${optionsHTML}
          </div>
          <div class="feedback-correct" style="display:none;">${escapeHtml(block.feedback.correct)}</div>
          <div class="feedback-incorrect" style="display:none;">${escapeHtml(block.feedback.incorrect)}</div>
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

  // Detect YouTube and extract video ID
  const ytMatch = block.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  const vimeoMatch = block.url.match(/vimeo\.com\/(\d+)/);

  let videoHTML: string;
  if (ytMatch) {
    videoHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${ytMatch[1]}?enablejsapi=1" width="100%" height="100%" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius: 12px;"></iframe>`;
  } else if (vimeoMatch) {
    videoHTML = `<iframe src="https://player.vimeo.com/video/${vimeoMatch[1]}" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="border-radius: 12px;"></iframe>`;
  } else {
    // MP4 or direct URL
    videoHTML = `<video src="${escapeHtml(block.url)}" controls width="100%" height="100%" style="border-radius: 12px; object-fit: contain;"></video>`;
  }

  return `
        <div class="block video-block" style="${style} background: #000; border-radius: 12px; overflow: hidden;">
          ${videoHTML}
        </div>`;
}
