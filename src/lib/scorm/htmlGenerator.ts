// SCORM Course HTML Generator
// Generates the index.html content from course slides and blocks

import { CourseProject, Block, TextBlock, ImageBlock, FlashcardBlock, QuizBlock, VideoBlock, ShapeBlock, AudioBlock, TrueFalseBlock, MatchingBlock, FillBlankBlock, SortingBlock, HotspotBlock, AccordionBlock, TabsBlock, BranchingBlock, TimelineBlock, DragDropBlock, InteractiveVideoBlock, LabeledGraphicBlock, ProcessBlock, LightboxBlock, QuoteBlock, DownloadBlock, CounterBlock, ButtonBlock, DividerBlock, EmbedBlock, LikertBlock, RankingBlock, EssayBlock, NumericBlock, DropdownBlock, MatrixBlock, ImageChoiceBlock, CharacterBlock, ScenarioBlock } from "@/store/useEditorStore";
import { sanitizeHtml } from "@/lib/sanitize";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "@/lib/constants/canvas";

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
    <section class="slide" id="slide-${index}" data-index="${index}" data-transition="${slide.transition || 'none'}" data-narration="${slide.narration || ''}" role="region" aria-roledescription="slide" aria-label="Slide ${index + 1} de ${totalSlides}" style="background-color: ${slide.background};" tabindex="0">
      <div class="slide-content">
        ${blocksHTML}
      </div>
    </section>`;
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
  <script src="xapi-tracker.js"><\/script>
</head>
<body>
  <!-- Skip Navigation (WCAG) -->
  <a href="#main-content" class="skip-link" style="position:absolute;top:-40px;left:8px;background:#1e293b;color:white;padding:8px 16px;z-index:9999;border-radius:0 0 8px 8px;font-size:14px;transition:top 0.2s;text-decoration:none;" onfocus="this.style.top='0'" onblur="this.style.top='-40px'">Pular para o conteúdo</a>

  <!-- Top Bar -->
  <header class="top-bar" role="banner" aria-label="Barra do curso">
    <div style="display:flex;align-items:center;gap:8px;">
      <button id="menuToggle" onclick="toggleMenu()" style="background:none;border:none;color:white;font-size:18px;cursor:pointer;padding:4px;" aria-label="Menu de navegação">☰</button>
      <div class="course-title">${escapeHtml(project.title)}</div>
    </div>
    <div class="slide-counter" aria-live="polite" aria-atomic="true">
      <span id="currentSlide">1</span> / ${totalSlides}
    </div>
  </header>

  <!-- Sidebar Menu -->
  <aside id="sideMenu" style="position:fixed;top:0;left:-280px;width:280px;height:100vh;background:linear-gradient(180deg,#1e1b4b,#312e81);z-index:1000;transition:left 0.3s ease;box-shadow:4px 0 20px rgba(0,0,0,0.3);display:flex;flex-direction:column;">
    <div style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:space-between;">
      <span style="color:white;font-weight:700;font-size:14px;">📋 Navegação</span>
      <button onclick="toggleMenu()" style="background:none;border:none;color:rgba(255,255,255,0.5);font-size:18px;cursor:pointer;">✕</button>
    </div>
    <div style="flex:1;overflow-y:auto;padding:8px;">
      ${slides.map((slide, i) => {
        const firstText = slide.blocks.find(b => b.type === 'text');
        const slideLabel = firstText ? (firstText as any).content.substring(0, 40).replace(/<[^>]*>/g, '') : `Slide ${i + 1}`;
        return `
        <button onclick="goToSlide(${i})" class="menu-item" id="menuItem${i}" style="display:flex;align-items:center;gap:10px;width:100%;padding:10px 12px;border:none;background:${i === 0 ? 'rgba(255,255,255,0.1)' : 'transparent'};border-radius:8px;cursor:pointer;text-align:left;color:rgba(255,255,255,0.8);font-size:12px;margin-bottom:2px;transition:background 0.2s;">
          <span style="min-width:24px;height:24px;border-radius:50%;background:${i === 0 ? '#7c3aed' : 'rgba(255,255,255,0.1)'};display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;color:white;">${i + 1}</span>
          <span>${slideLabel}</span>
        </button>`;
      }).join('')}
    </div>
    <div style="padding:12px 16px;border-top:1px solid rgba(255,255,255,0.1);">
      <div style="font-size:10px;color:rgba(255,255,255,0.3);">AccCourse • ${totalSlides} slides</div>
    </div>
  </aside>
  <div id="menuOverlay" onclick="toggleMenu()" style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.5);z-index:999;display:none;"></div>

  <!-- Certificate Modal -->
  <div id="certModal" style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.7);z-index:2000;display:none;align-items:center;justify-content:center;">
    <div style="background:white;border-radius:24px;max-width:600px;width:90%;padding:48px 40px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.3);position:relative;">
      <div style="font-size:48px;margin-bottom:16px;">🏆</div>
      <h2 style="font-size:24px;font-weight:800;color:#1e1b4b;margin-bottom:4px;">Certificado de Conclusão</h2>
      <p style="font-size:13px;color:#64748b;margin-bottom:24px;">Parabéns! Você concluiu o curso com sucesso.</p>
      <div style="border:2px solid #e2e8f0;border-radius:16px;padding:24px;margin-bottom:24px;background:linear-gradient(135deg,#faf5ff,#ede9fe);">
        <p style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Certificamos que</p>
        <input id="certName" placeholder="Seu nome completo" style="border:none;background:transparent;font-size:20px;font-weight:700;color:#3b0764;text-align:center;width:100%;outline:none;padding:8px 0;border-bottom:2px dashed #c4b5fd;" />
        <p style="font-size:13px;color:#374151;margin-top:12px;">Concluiu o curso <strong style="color:#7c3aed;">${escapeHtml(project.title)}</strong></p>
        <p style="font-size:11px;color:#94a3b8;margin-top:8px;">em <span id="certDate"></span></p>
        <p id="certScore" style="font-size:12px;color:#7c3aed;font-weight:600;margin-top:8px;"></p>
      </div>
      <div style="display:flex;gap:8px;justify-content:center;">
        <button onclick="printCert()" style="padding:10px 24px;background:#7c3aed;color:white;border:none;border-radius:12px;font-weight:600;cursor:pointer;font-size:13px;">🖨️ Imprimir</button>
        <button onclick="closeCert()" style="padding:10px 24px;background:#f1f5f9;color:#374151;border:none;border-radius:12px;font-weight:600;cursor:pointer;font-size:13px;">Fechar</button>
      </div>
    </div>
  </div>

  <!-- Slides Container -->
  <main class="slides-container" id="main-content" role="main" aria-label="Conteúdo do curso">
    ${slidesHTML}
  </main>

  <!-- Navigation -->
  <nav class="navigation" role="navigation" aria-label="Navegação do curso">
    <button class="nav-btn" id="prevBtn" onclick="prevSlide()" disabled aria-label="Slide anterior">
      &#8592; Anterior
    </button>
    <div class="progress-bar" role="progressbar" aria-valuenow="${totalSlides > 0 ? Math.round((1 / totalSlides) * 100) : 0}" aria-valuemin="0" aria-valuemax="100" aria-label="Progresso do curso">
      <div class="progress-fill" id="progressFill" style="width: ${totalSlides > 0 ? (1 / totalSlides) * 100 : 0}%"></div>
    </div>
    <button class="nav-btn" id="nextBtn" onclick="nextSlide()" aria-label="Próximo slide">
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

  ${project.gamification?.enableXP ? `
  <!-- Gamification XP Bar -->
  <div id="xp-bar" style="position:fixed;top:12px;right:12px;background:rgba(30,41,59,0.95);backdrop-filter:blur(12px);border-radius:16px;padding:8px 16px;display:flex;align-items:center;gap:10px;z-index:900;box-shadow:0 4px 20px rgba(0,0,0,0.3);font-family:inherit;">
    <div style="font-size:20px;">⚡</div>
    <div>
      <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">XP</div>
      <div id="xp-value" style="font-size:18px;font-weight:800;color:#fbbf24;">0</div>
    </div>
    <div style="width:80px;height:6px;background:#334155;border-radius:3px;overflow:hidden;">
      <div id="xp-fill" style="height:100%;background:linear-gradient(90deg,#f59e0b,#fbbf24);border-radius:3px;width:0%;transition:width 0.5s ease;"></div>
    </div>
  </div>
  <!-- Badge Notification -->
  <div id="badge-popup" style="position:fixed;top:60px;right:12px;background:linear-gradient(135deg,#fef3c7,#fffbeb);border:2px solid #f59e0b;border-radius:16px;padding:12px 20px;display:none;align-items:center;gap:10px;z-index:901;box-shadow:0 8px 30px rgba(245,158,11,0.3);animation:badgeSlide 0.5s ease;">
    <div id="badge-icon" style="font-size:28px;"></div>
    <div>
      <div style="font-size:10px;color:#92400e;font-weight:700;text-transform:uppercase;">Badge Conquistado!</div>
      <div id="badge-name" style="font-size:14px;font-weight:700;color:#78350f;"></div>
    </div>
  </div>
  <style>
    @keyframes badgeSlide { from { opacity:0; transform:translateX(50px); } to { opacity:1; transform:translateX(0); } }
  </style>
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
          if (i === index) {
            s.classList.add('active');
            // Apply transition animation
            var transition = s.getAttribute('data-transition') || 'none';
            s.style.animation = 'none';
            s.offsetHeight; // trigger reflow
            if (transition === 'fade') s.style.animation = 'fadeIn 0.5s ease forwards';
            else if (transition === 'slide') s.style.animation = 'slideLeft 0.4s ease forwards';
            else if (transition === 'zoom') s.style.animation = 'zoomIn 0.4s ease forwards';
            else s.style.animation = 'none';
          } else {
            s.classList.remove('active');
          }
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

        // Auto-play narration
        if (window._narrationAudio) { window._narrationAudio.pause(); window._narrationAudio = null; }
        var slideEl = document.getElementById('slide-' + index);
        if (slideEl) {
          var narrationUrl = slideEl.getAttribute('data-narration');
          if (narrationUrl) {
            window._narrationAudio = new Audio(narrationUrl);
            window._narrationAudio.play().catch(function() {});
          }
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
          showCert(score);
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

      // Keyboard Navigation (WCAG)
      document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          window.nextSlide();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          window.prevSlide();
        }
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

      // ─── Side Menu ───
      var menuOpen = false;
      window.toggleMenu = function() {
        menuOpen = !menuOpen;
        var menu = document.getElementById('sideMenu');
        var overlay = document.getElementById('menuOverlay');
        if (menu) menu.style.left = menuOpen ? '0' : '-280px';
        if (overlay) overlay.style.display = menuOpen ? 'block' : 'none';
      };

      window.goToSlide = function(index) {
        currentIndex = index;
        showSlide(currentIndex);
        if (menuOpen) window.toggleMenu();
      };

      // Update menu highlight on slide change
      var origShowSlide = showSlide;
      showSlide = function(index) {
        origShowSlide(index);
        for (var m = 0; m < totalSlides; m++) {
          var item = document.getElementById('menuItem' + m);
          if (item) {
            item.style.background = m === index ? 'rgba(255,255,255,0.1)' : 'transparent';
            var badge = item.querySelector('span');
            if (badge) badge.style.background = m === index ? '#7c3aed' : 'rgba(255,255,255,0.1)';
          }
        }
      };

      // ─── Certificate ───
      window.showCert = function(score) {
        var modal = document.getElementById('certModal');
        var dateEl = document.getElementById('certDate');
        var scoreEl = document.getElementById('certScore');
        if (modal) modal.style.display = 'flex';
        if (dateEl) dateEl.textContent = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
        if (scoreEl && score && score.percentage !== undefined) {
          scoreEl.textContent = 'Nota: ' + score.percentage + '%';
        }
        nextBtn.textContent = '✓ Concluído!';
        nextBtn.disabled = true;
      };

      window.closeCert = function() {
        var modal = document.getElementById('certModal');
        if (modal) modal.style.display = 'none';
      };

      window.printCert = function() {
        window.print();
      };

      // Init
      showSlide(currentIndex);
    })();
  <\/script>
</body>
</html>`;
}

function generateBlockHTML(block: Block, assetMap?: Map<string, string>): string {
  const animStyle = block.animation && block.animation.type !== 'none'
    ? `animation: ${block.animation.type} ${block.animation.duration || 0.5}s ${block.animation.easing || 'ease'} ${block.animation.delay || 0}s both;`
    : '';
  const style = `position: absolute; left: ${(block.x / CANVAS_WIDTH) * 100}%; top: ${(block.y / CANVAS_HEIGHT) * 100}%; width: ${(block.width / CANVAS_WIDTH) * 100}%; height: ${(block.height / CANVAS_HEIGHT) * 100}%; ${animStyle}`;

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
    case "truefalse":
      return generateTrueFalseBlockHTML(block as TrueFalseBlock, style);
    case "matching":
      return generateMatchingBlockHTML(block as MatchingBlock, style);
    case "fillblank":
      return generateFillBlankBlockHTML(block as FillBlankBlock, style);
    case "sorting":
      return generateSortingBlockHTML(block as SortingBlock, style);
    case "hotspot":
      return generateHotspotBlockHTML(block as HotspotBlock, style);
    case "accordion":
      return generateAccordionBlockHTML(block as AccordionBlock, style);
    case "tabs":
      return generateTabsBlockHTML(block as TabsBlock, style);
    case "branching":
      return generateBranchingBlockHTML(block as BranchingBlock, style);
    case "timeline":
      return generateTimelineBlockHTML(block as TimelineBlock, style);
    case "dragdrop":
      return generateDragDropBlockHTML(block as DragDropBlock, style);
    case "interactiveVideo":
      return generateInteractiveVideoBlockHTML(block as InteractiveVideoBlock, style);
    case "labeled-graphic":
      return generateLabeledGraphicBlockHTML(block as LabeledGraphicBlock, style);
    case "process":
      return generateProcessBlockHTML(block as ProcessBlock, style);
    case "lightbox":
      return generateLightboxBlockHTML(block as LightboxBlock, style);
    case "quote":
      return generateQuoteBlockHTML(block as QuoteBlock, style);
    case "download":
      return generateDownloadBlockHTML(block as DownloadBlock, style);
    case "counter":
      return generateCounterBlockHTML(block as CounterBlock, style);
    case "button":
      return generateButtonBlockHTML(block as ButtonBlock, style);
    case "divider":
      return generateDividerBlockHTML(block as DividerBlock, style);
    case "embed":
      return generateEmbedBlockHTML(block as EmbedBlock, style);
    case "likert":
      return generateLikertBlockHTML(block as LikertBlock, style);
    case "ranking":
      return generateRankingBlockHTML(block as RankingBlock, style);
    case "essay":
      return generateEssayBlockHTML(block as EssayBlock, style);
    case "numeric":
      return generateNumericBlockHTML(block as NumericBlock, style);
    case "dropdown":
      return generateDropdownBlockHTML(block as DropdownBlock, style);
    case "matrix":
      return generateMatrixBlockHTML(block as MatrixBlock, style);
    case "image-choice":
      return generateImageChoiceBlockHTML(block as ImageChoiceBlock, style);
    case "character":
      return generateCharacterBlockHTML(block as CharacterBlock, style);
    case "scenario":
      return generateScenarioBlockHTML(block as ScenarioBlock, style);
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

// ─── TRUE/FALSE BLOCK ───
function generateTrueFalseBlockHTML(block: TrueFalseBlock, style: string): string {
  const uid = block.id.slice(0, 8);
  return `<div class="block truefalse-block" style="${style}" id="tf-${uid}">
    <div style="background:linear-gradient(135deg,#ecfdf5,#f0fdfa);border:1px solid #a7f3d0;border-radius:12px;padding:20px;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;">
      <div style="font-size:10px;font-weight:700;color:#047857;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Verdadeiro ou Falso</div>
      <p style="font-size:16px;color:#1e293b;text-align:center;margin-bottom:16px;">${escapeHtml(block.statement)}</p>
      <div style="display:flex;gap:12px;" id="tf-btns-${uid}">
        <button onclick="checkTF_${uid}(true)" style="padding:8px 24px;border-radius:8px;border:2px solid #10b981;background:#ecfdf5;color:#047857;font-weight:600;cursor:pointer;font-size:14px;">✓ Verdadeiro</button>
        <button onclick="checkTF_${uid}(false)" style="padding:8px 24px;border-radius:8px;border:2px solid #ef4444;background:#fef2f2;color:#dc2626;font-weight:600;cursor:pointer;font-size:14px;">✗ Falso</button>
      </div>
      <div id="tf-fb-${uid}" style="margin-top:12px;font-size:14px;display:none;"></div>
    </div>
    <script>
      function checkTF_${uid}(answer) {
        var correct = ${block.isTrue};
        var isCorrect = answer === correct;
        var fb = document.getElementById('tf-fb-${uid}');
        fb.style.display='block';
        fb.textContent = isCorrect ? ${JSON.stringify(block.feedbackCorrect)} : ${JSON.stringify(block.feedbackIncorrect)};
        fb.style.color = isCorrect ? '#047857' : '#dc2626';
        document.getElementById('tf-btns-${uid}').style.pointerEvents='none';
        if(window.SCORM) SCORM.setInteraction('${uid}','choice',answer?'true':'false',correct?'true':'false',isCorrect?'correct':'wrong',${block.pointsValue});
      }
    </script>
  </div>`;
}

// ─── MATCHING BLOCK ───
function generateMatchingBlockHTML(block: MatchingBlock, style: string): string {
  const uid = block.id.slice(0, 8);
  const pairs = block.pairs || [];
  return `<div class="block matching-block" style="${style}" id="match-${uid}">
    <div style="background:linear-gradient(135deg,#eff6ff,#eef2ff);border:1px solid #bfdbfe;border-radius:12px;padding:16px;height:100%;display:flex;flex-direction:column;">
      <div style="font-size:10px;font-weight:700;color:#1d4ed8;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Liga Pontos</div>
      <div style="display:flex;justify-content:space-between;flex:1;gap:20px;">
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${pairs.map((p, i) => `<div style="padding:8px 16px;background:#dbeafe;border-radius:8px;font-size:13px;color:#1e40af;cursor:pointer;" onclick="selectLeft_${uid}(${i})" id="ml-${uid}-${i}">${escapeHtml(p.left)}</div>`).join('')}
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${pairs.map((p, i) => `<div style="padding:8px 16px;background:#e0e7ff;border-radius:8px;font-size:13px;color:#3730a3;cursor:pointer;" onclick="selectRight_${uid}(${i})" id="mr-${uid}-${i}">${escapeHtml(p.right)}</div>`).join('')}
        </div>
      </div>
      <button onclick="checkMatch_${uid}()" style="margin-top:12px;padding:8px 20px;border-radius:8px;background:#4f46e5;color:white;border:none;cursor:pointer;font-weight:600;align-self:center;">Verificar</button>
      <div id="match-fb-${uid}" style="margin-top:8px;font-size:13px;text-align:center;display:none;"></div>
    </div>
    <script>
      var matchSel_${uid}={left:null,connections:{}};
      function selectLeft_${uid}(i){matchSel_${uid}.left=i;document.getElementById('ml-${uid}-'+i).style.outline='3px solid #4f46e5';}
      function selectRight_${uid}(i){if(matchSel_${uid}.left!==null){matchSel_${uid}.connections[matchSel_${uid}.left]=i;document.getElementById('ml-${uid}-'+matchSel_${uid}.left).style.outline='3px solid #10b981';matchSel_${uid}.left=null;}}
      function checkMatch_${uid}(){
        var correct=true;var conns=matchSel_${uid}.connections;
        ${pairs.map((_, i) => `if(conns[${i}]!==${i})correct=false;`).join('')}
        var fb=document.getElementById('match-fb-${uid}');fb.style.display='block';
        fb.textContent=correct?${JSON.stringify(block.feedbackCorrect)}:${JSON.stringify(block.feedbackIncorrect)};
        fb.style.color=correct?'#047857':'#dc2626';
        var resp=Object.keys(conns).map(function(k){return k+'[.]'+conns[k]}).join(',');
        var correctResp=${JSON.stringify(pairs.map((_, i) => `${i}[.]${i}`).join(','))};
        if(window.SCORM)SCORM.setInteraction('${uid}','matching',resp,correctResp,correct?'correct':'wrong',${block.pointsValue});
      }
    </script>
  </div>`;
}

// ─── FILL-IN-THE-BLANK BLOCK ───
function generateFillBlankBlockHTML(block: FillBlankBlock, style: string): string {
  const uid = block.id.slice(0, 8);
  const blanks = block.segments.filter(s => s.type === 'blank') as { id: string; correctAnswer: string; acceptedVariants: string[] }[];
  return `<div class="block fillblank-block" style="${style}" id="fb-${uid}">
    <div style="background:linear-gradient(135deg,#fffbeb,#fff7ed);border:1px solid #fcd34d;border-radius:12px;padding:20px;height:100%;display:flex;flex-direction:column;justify-content:center;">
      <div style="font-size:10px;font-weight:700;color:#b45309;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Preencher Lacunas</div>
      <div style="font-size:15px;line-height:2;color:#1e293b;">
        ${block.segments.map((seg, i) => {
          if (seg.type === 'text') return escapeHtml(seg.content);
          return `<input type="text" id="fbi-${uid}-${i}" style="border:none;border-bottom:2px solid #f59e0b;background:#fef3c7;padding:2px 8px;border-radius:4px;font-size:14px;width:100px;outline:none;" placeholder="..." />`;
        }).join('')}
      </div>
      <button onclick="checkFB_${uid}()" style="margin-top:16px;padding:8px 20px;border-radius:8px;background:#d97706;color:white;border:none;cursor:pointer;font-weight:600;align-self:center;">Verificar</button>
      <div id="fb-fb-${uid}" style="margin-top:8px;font-size:13px;text-align:center;display:none;"></div>
    </div>
    <script>
      function checkFB_${uid}(){
        var correct=true;var resp=[];
        ${block.segments.map((seg, i) => {
          if (seg.type !== 'blank') return '';
          const blank = seg as { correctAnswer: string; acceptedVariants: string[] };
          const variants = [blank.correctAnswer, ...(blank.acceptedVariants || [])].map(v => v.toLowerCase());
          return `var v${i}=(document.getElementById('fbi-${uid}-${i}')||{}).value||'';resp.push(v${i});
          if(${JSON.stringify(variants)}.indexOf(v${i}${block.caseSensitive ? '' : '.toLowerCase()'})<0)correct=false;`;
        }).join('')}
        var fb=document.getElementById('fb-fb-${uid}');fb.style.display='block';
        fb.textContent=correct?${JSON.stringify(block.feedbackCorrect)}:${JSON.stringify(block.feedbackIncorrect)};
        fb.style.color=correct?'#047857':'#dc2626';
        if(window.SCORM)SCORM.setInteraction('${uid}','fill-in',resp.join(','),${JSON.stringify(blanks.map(b => b.correctAnswer).join(','))},correct?'correct':'wrong',${block.pointsValue});
      }
    </script>
  </div>`;
}

// ─── SORTING BLOCK ───
function generateSortingBlockHTML(block: SortingBlock, style: string): string {
  const uid = block.id.slice(0, 8);
  return `<div class="block sorting-block" style="${style}" id="sort-${uid}">
    <div style="background:linear-gradient(135deg,#faf5ff,#fdf4ff);border:1px solid #d8b4fe;border-radius:12px;padding:16px;height:100%;display:flex;flex-direction:column;">
      <div style="font-size:10px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Ordenação</div>
      <div id="sort-list-${uid}" style="display:flex;flex-direction:column;gap:6px;flex:1;">
        ${block.items.map((item, i) => `<div draggable="true" data-id="${item.id}" style="padding:10px 16px;background:#f3e8ff;border:1px solid #d8b4fe;border-radius:8px;cursor:grab;font-size:13px;color:#581c87;display:flex;align-items:center;gap:8px;" ondragstart="event.dataTransfer.setData('text',event.target.dataset.id)" ondragover="event.preventDefault()" ondrop="dropSort_${uid}(event)">
          <span style="color:#a78bfa;font-family:monospace;">≡</span> ${escapeHtml(item.content)}
        </div>`).join('')}
      </div>
      <button onclick="checkSort_${uid}()" style="margin-top:12px;padding:8px 20px;border-radius:8px;background:#7c3aed;color:white;border:none;cursor:pointer;font-weight:600;align-self:center;">Verificar</button>
      <div id="sort-fb-${uid}" style="margin-top:8px;font-size:13px;text-align:center;display:none;"></div>
    </div>
    <script>
      function dropSort_${uid}(e){e.preventDefault();var id=e.dataTransfer.getData('text');var list=document.getElementById('sort-list-${uid}');var items=Array.from(list.children);var dragged=items.find(function(el){return el.dataset.id===id});var target=e.target.closest('[draggable]');if(dragged&&target&&dragged!==target){list.insertBefore(dragged,target)}}
      function checkSort_${uid}(){
        var items=Array.from(document.getElementById('sort-list-${uid}').children).map(function(el){return el.dataset.id});
        var correctOrder=${JSON.stringify(block.correctOrder)};
        var correct=JSON.stringify(items)===JSON.stringify(correctOrder);
        var fb=document.getElementById('sort-fb-${uid}');fb.style.display='block';
        fb.textContent=correct?${JSON.stringify(block.feedbackCorrect)}:${JSON.stringify(block.feedbackIncorrect)};
        fb.style.color=correct?'#047857':'#dc2626';
        if(window.SCORM)SCORM.setInteraction('${uid}','sequencing',items.join(','),correctOrder.join(','),correct?'correct':'wrong',${block.pointsValue});
      }
    </script>
  </div>`;
}

// ─── HOTSPOT BLOCK ───
function generateHotspotBlockHTML(block: HotspotBlock, style: string): string {
  const uid = block.id.slice(0, 8);
  return `<div class="block hotspot-block" style="${style}" id="hs-${uid}">
    <div style="position:relative;width:100%;height:100%;border-radius:12px;overflow:hidden;">
      ${block.imageSrc ? `<img src="${block.imageSrc}" style="width:100%;height:100%;object-fit:cover;" />` : '<div style="width:100%;height:100%;background:linear-gradient(135deg,#f1f5f9,#e2e8f0);display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:12px;">Imagem de fundo</div>'}
      ${(block.spots || []).map((spot, i) => `
        <div onclick="${block.mode === 'quiz' ? `checkHotspot_${uid}('${spot.id}',${!!spot.isCorrect})` : `toggleTooltip_${uid}(${i})`}"
          style="position:absolute;left:${spot.x}%;top:${spot.y}%;transform:translate(-50%,-50%);width:${spot.radius * 2}%;height:${spot.radius * 2}%;border-radius:50%;background:rgba(6,182,212,0.4);border:2px solid white;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px rgba(6,182,212,0.3);">
          <span style="color:white;font-size:10px;font-weight:700;">${i + 1}</span>
        </div>
        <div id="hs-tip-${uid}-${i}" style="display:none;position:absolute;left:${spot.x}%;top:${Math.min(spot.y + spot.radius + 2, 85)}%;transform:translateX(-50%);background:white;padding:8px 12px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);font-size:12px;z-index:10;max-width:200px;">
          <strong>${escapeHtml(spot.label)}</strong><br/>${escapeHtml(spot.content)}
        </div>
      `).join('')}
      <div style="position:absolute;top:8px;left:8px;padding:4px 10px;border-radius:6px;background:rgba(0,0,0,0.6);color:white;font-size:10px;">
        ${block.mode === 'quiz' ? '🎯 Quiz' : '🔍 Explorar'}
      </div>
      <div id="hs-fb-${uid}" style="display:none;position:absolute;bottom:8px;left:50%;transform:translateX(-50%);padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;"></div>
    </div>
    <script>
      function toggleTooltip_${uid}(i){var tip=document.getElementById('hs-tip-${uid}-'+i);tip.style.display=tip.style.display==='none'?'block':'none';}
      function checkHotspot_${uid}(id,isCorrect){
        var fb=document.getElementById('hs-fb-${uid}');fb.style.display='block';
        fb.textContent=isCorrect?'Correto! ✅':'Tente outro ponto! ❌';
        fb.style.background=isCorrect?'#ecfdf5':'#fef2f2';fb.style.color=isCorrect?'#047857':'#dc2626';
        if(window.SCORM)SCORM.setInteraction('${uid}','performance',id,${JSON.stringify((block.spots||[]).filter(s=>s.isCorrect).map(s=>s.id).join(','))},isCorrect?'correct':'wrong',${block.pointsValue});
      }
    </script>
  </div>`;
}

// ─── ACCORDION BLOCK ───
function generateAccordionBlockHTML(block: AccordionBlock, style: string): string {
  const uid = block.id.slice(0, 8);
  return `<div class="block accordion-block" style="${style}" id="acc-${uid}">
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px;height:100%;display:flex;flex-direction:column;gap:6px;overflow-y:auto;">
      ${(block.sections || []).map((section, i) => `
        <div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
          <div onclick="toggleAcc_${uid}(${i})" style="padding:10px 16px;background:${i === 0 ? '#eef2ff' : '#ffffff'};cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:13px;font-weight:600;color:#1e293b;">${escapeHtml(section.title)}</span>
            <span id="acc-icon-${uid}-${i}" style="font-size:10px;color:#94a3b8;transition:transform 0.2s;">${i === 0 ? '▼' : '▶'}</span>
          </div>
          <div id="acc-content-${uid}-${i}" style="padding:0 16px;max-height:${i === 0 ? '200px' : '0'};overflow:hidden;transition:max-height 0.3s ease;${i === 0 ? 'padding-bottom:12px;' : ''}">
            <p style="font-size:13px;color:#64748b;line-height:1.6;padding-top:8px;">${escapeHtml(section.content)}</p>
          </div>
        </div>
      `).join('')}
    </div>
    <script>
      function toggleAcc_${uid}(i){
        var content=document.getElementById('acc-content-${uid}-'+i);
        var icon=document.getElementById('acc-icon-${uid}-'+i);
        var isOpen=content.style.maxHeight!=='0px'&&content.style.maxHeight!=='';
        ${!block.allowMultipleOpen ? `for(var j=0;j<${(block.sections||[]).length};j++){document.getElementById('acc-content-${uid}-'+j).style.maxHeight='0';document.getElementById('acc-content-${uid}-'+j).style.paddingBottom='0';document.getElementById('acc-icon-${uid}-'+j).textContent='▶';}` : ''}
        if(!isOpen){content.style.maxHeight='200px';content.style.paddingBottom='12px';icon.textContent='▼';}
        else{content.style.maxHeight='0';content.style.paddingBottom='0';icon.textContent='▶';}
      }
    </script>
  </div>`;
}

// ─── TABS BLOCK ───
function generateTabsBlockHTML(block: TabsBlock, style: string): string {
  const uid = block.id.slice(0, 8);
  const isVertical = block.orientation === 'vertical';
  return `<div class="block tabs-block" style="${style}" id="tabs-${uid}">
    <div style="display:flex;flex-direction:${isVertical ? 'row' : 'column'};height:100%;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;background:white;">
      <div style="display:flex;flex-direction:${isVertical ? 'column' : 'row'};background:#f8fafc;${isVertical ? 'border-right:1px solid #e2e8f0;min-width:120px;' : 'border-bottom:1px solid #e2e8f0;'}padding:4px;">
        ${(block.tabs || []).map((tab, i) => `
          <div onclick="switchTab_${uid}(${i})" id="tab-btn-${uid}-${i}"
            style="padding:8px 16px;cursor:pointer;font-size:12px;font-weight:${i === 0 ? '600' : '400'};color:${i === 0 ? '#4f46e5' : '#64748b'};${
              block.style === 'underline' ? `border-bottom:${i === 0 ? '2px solid #4f46e5' : '2px solid transparent'};` :
              block.style === 'pills' ? `border-radius:20px;background:${i === 0 ? '#eef2ff' : 'transparent'};` :
              `border-radius:8px;background:${i === 0 ? 'white' : 'transparent'};${i === 0 ? 'box-shadow:0 1px 3px rgba(0,0,0,0.1);' : ''}`
            }transition:all 0.2s;">
            ${escapeHtml(tab.label)}
          </div>
        `).join('')}
      </div>
      <div style="flex:1;padding:16px;overflow-y:auto;">
        ${(block.tabs || []).map((tab, i) => `
          <div id="tab-content-${uid}-${i}" style="display:${i === 0 ? 'block' : 'none'};font-size:14px;color:#475569;line-height:1.6;">
            ${escapeHtml(tab.content)}
          </div>
        `).join('')}
      </div>
    </div>
    <script>
      function switchTab_${uid}(idx){
        ${(block.tabs || []).map((_, i) => `
          document.getElementById('tab-content-${uid}-${i}').style.display=${i}===idx?'block':'none';
          var btn${i}=document.getElementById('tab-btn-${uid}-${i}');
          btn${i}.style.fontWeight=${i}===idx?'600':'400';
          btn${i}.style.color=${i}===idx?'#4f46e5':'#64748b';
          ${block.style === 'underline' ? `btn${i}.style.borderBottom=${i}===idx?"2px solid #4f46e5":"2px solid transparent";` :
            block.style === 'pills' ? `btn${i}.style.background=${i}===idx?"#eef2ff":"transparent";` :
            `btn${i}.style.background=${i}===idx?"white":"transparent";btn${i}.style.boxShadow=${i}===idx?"0 1px 3px rgba(0,0,0,0.1)":"none";`}
        `).join('')}
      }
    </script>
  </div>`;
}

// ─── BRANCHING BLOCK ───
function generateBranchingBlockHTML(block: BranchingBlock, style: string): string {
  const uid = block.id.slice(0, 8);
  return `<div class="block branching-block" style="${style}" id="branch-${uid}">
    <div style="background:linear-gradient(135deg,#fff1f2,#fef2f2);border:1px solid #fecdd3;border-radius:12px;padding:20px;height:100%;display:flex;flex-direction:column;">
      <div style="font-size:10px;font-weight:700;color:#be123c;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">🌿 Cenário de Decisão</div>
      <p style="font-size:15px;color:#1e293b;margin-bottom:16px;font-weight:500;">${escapeHtml(block.scenario)}</p>
      <div style="display:flex;flex-direction:column;gap:8px;flex:1;" id="branch-choices-${uid}">
        ${block.choices.map((c, i) => `
          <button onclick="chooseBranch_${uid}(${i},${!!c.isCorrect},'${c.id}')" id="bc-${uid}-${i}"
            style="padding:10px 16px;border-radius:10px;border:2px solid #e5e7eb;background:white;color:#374151;font-size:14px;cursor:pointer;text-align:left;transition:all 0.2s;font-family:inherit;">
            ${escapeHtml(c.text)}
          </button>
        `).join('')}
      </div>
      <div id="branch-fb-${uid}" style="display:none;margin-top:12px;padding:10px 16px;border-radius:10px;font-size:13px;"></div>
    </div>
    <script>
      function chooseBranch_${uid}(idx,isCorrect,id) {
        var feedbacks=${JSON.stringify(block.choices.map(c => c.feedback))};
        var fb=document.getElementById('branch-fb-${uid}');
        fb.style.display='block';
        fb.textContent=feedbacks[idx];
        fb.style.background=isCorrect?'#ecfdf5':'#fef2f2';
        fb.style.color=isCorrect?'#047857':'#dc2626';
        document.querySelectorAll('#branch-choices-${uid} button').forEach(function(b){b.style.pointerEvents='none';b.style.opacity='0.6';});
        document.getElementById('bc-${uid}-'+idx).style.borderColor=isCorrect?'#10b981':'#ef4444';
        document.getElementById('bc-${uid}-'+idx).style.opacity='1';
        if(window.SCORM)SCORM.setInteraction('${uid}','choice',id,${JSON.stringify(block.choices.filter(c=>c.isCorrect).map(c=>c.id).join(','))},isCorrect?'correct':'wrong',${block.pointsValue});
      }
    </script>
  </div>`;
}

// ─── TIMELINE BLOCK ───
function generateTimelineBlockHTML(block: TimelineBlock, style: string): string {
  const uid = block.id.slice(0, 8);
  const isVert = block.orientation === 'vertical';
  return `<div class="block timeline-block" style="${style}" id="tl-${uid}">
    <div style="background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border:1px solid #bae6fd;border-radius:12px;padding:16px;height:100%;display:flex;flex-direction:column;overflow:auto;">
      <div style="font-size:10px;font-weight:700;color:#0369a1;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">⏱ Linha do Tempo</div>
      <div style="display:flex;flex-direction:${isVert ? 'column' : 'row'};align-items:${isVert ? 'flex-start' : 'center'};gap:${isVert ? '16px' : '8px'};flex:1;${isVert ? '' : 'justify-content:space-around;'}">
        ${block.events.map((ev, i) => `
          <div style="display:flex;${isVert ? 'flex-direction:row;gap:12px;' : 'flex-direction:column;align-items:center;gap:4px;'}">
            <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#0ea5e9,#38bdf8);display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(14,165,233,0.3);flex-shrink:0;">
              ${ev.icon || '📌'}
            </div>
            <div style="${isVert ? '' : 'text-align:center;'}">
              <div style="font-size:11px;font-weight:700;color:#0369a1;">${ev.date}</div>
              <div style="font-size:12px;font-weight:600;color:#1e293b;">${ev.title}</div>
              ${block.style !== 'minimal' ? `<div style="font-size:10px;color:#64748b;margin-top:2px;">${ev.description}</div>` : ''}
            </div>
          </div>
          ${!isVert && i < block.events.length - 1 ? '<div style="flex:1;height:2px;background:linear-gradient(90deg,#38bdf8,#bae6fd);border-radius:1px;min-width:20px;"></div>' : ''}
        `).join('')}
      </div>
    </div>
  </div>`;
}

// ─── DRAG & DROP BLOCK ───
function generateDragDropBlockHTML(block: DragDropBlock, style: string): string {
  const uid = block.id.slice(0, 8);
  return `<div class="block dragdrop-block" style="${style}" id="dd-${uid}">
    <div style="background:linear-gradient(135deg,#f0fdfa,#ccfbf1);border:1px solid #99f6e4;border-radius:12px;padding:16px;height:100%;display:flex;flex-direction:column;">
      <div style="font-size:10px;font-weight:700;color:#0f766e;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">↕ Drag & Drop</div>
      <div style="display:flex;gap:16px;flex:1;">
        <div style="display:flex;flex-direction:column;gap:6px;min-width:120px;" id="dd-items-${uid}">
          ${block.items.map((item) => `
            <div draggable="true" data-id="${item.id}" data-cat="${item.correctCategoryId}"
              style="padding:8px 12px;background:white;border:1px solid #14b8a6;border-radius:8px;cursor:grab;font-size:12px;color:#134e4a;"
              ondragstart="event.dataTransfer.setData('text/plain',this.dataset.id)">
              ≡ ${item.content}
            </div>
          `).join('')}
        </div>
        <div style="display:flex;gap:8px;flex:1;">
          ${block.categories.map((cat) => `
            <div id="dd-cat-${uid}-${cat.id}" data-cat="${cat.id}"
              style="flex:1;border:2px dashed #5eead4;border-radius:12px;padding:8px;display:flex;flex-direction:column;gap:4px;min-height:60px;background:rgba(204,251,241,0.3);transition:all 0.2s;"
              ondragover="event.preventDefault();this.style.borderColor='#14b8a6';this.style.background='rgba(204,251,241,0.6)'"
              ondragleave="this.style.borderColor='#5eead4';this.style.background='rgba(204,251,241,0.3)'"
              ondrop="dropDD_${uid}(event,this)">
              <div style="font-size:10px;font-weight:600;color:#0f766e;text-align:center;margin-bottom:4px;">${cat.label}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <button onclick="checkDD_${uid}()" style="margin-top:12px;padding:8px 20px;border-radius:8px;background:#0d9488;color:white;border:none;cursor:pointer;font-weight:600;align-self:center;font-size:13px;">Verificar</button>
      <div id="dd-fb-${uid}" style="display:none;margin-top:8px;font-size:13px;text-align:center;"></div>
    </div>
    <script>
      function dropDD_${uid}(e,zone){
        e.preventDefault();
        var id=e.dataTransfer.getData('text/plain');
        var item=document.querySelector('[data-id=\"'+id+'\"]');
        if(item)zone.appendChild(item);
        zone.style.borderColor='#5eead4';zone.style.background='rgba(204,251,241,0.3)';
      }
      function checkDD_${uid}(){
        var correct=true;
        var correctMap=${JSON.stringify(Object.fromEntries(block.items.map(i => [i.id, i.correctCategoryId])))};
        ${block.categories.map(cat => `
          var zone_${cat.id.slice(0,6)}=document.getElementById('dd-cat-${uid}-${cat.id}');
          zone_${cat.id.slice(0,6)}.querySelectorAll('[data-id]').forEach(function(el){
            if(correctMap[el.dataset.id]!=='${cat.id}')correct=false;
          });
        `).join('')}
        var fb=document.getElementById('dd-fb-${uid}');fb.style.display='block';
        fb.textContent=correct?${JSON.stringify(block.feedbackCorrect)}:${JSON.stringify(block.feedbackIncorrect)};
        fb.style.color=correct?'#047857':'#dc2626';
        if(window.SCORM)SCORM.setInteraction('${uid}','performance','dragdrop','all_correct',correct?'correct':'wrong',${block.pointsValue});
      }
    </script>
  </div>`;
}

// ─── INTERACTIVE VIDEO BLOCK ───
function generateInteractiveVideoBlockHTML(block: InteractiveVideoBlock, style: string): string {
  const uid = block.id.slice(0, 8);
  const chapters = block.chapters || [];
  const quizPoints = block.quizPoints || [];
  const bookmarks = block.bookmarks || [];

  return `<div class="block interactive-video-block" style="${style}" id="iv-${uid}">
    <div style="background:#0f172a;border-radius:12px;overflow:hidden;height:100%;display:flex;flex-direction:column;">
      <div style="flex:1;position:relative;background:#000;">
        ${block.src
          ? `<video id="iv-video-${uid}" src="${escapeHtml(block.src)}" ${block.poster ? `poster="${escapeHtml(block.poster)}"` : ''} ${block.autoplay ? 'autoplay' : ''} ${block.loop ? 'loop' : ''} style="width:100%;height:100%;object-fit:contain;" onclick="togglePlay_${uid}()"></video>`
          : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#64748b;font-size:14px;">Nenhum v&iacute;deo configurado</div>`
        }
        <div id="iv-overlay-${uid}" style="position:absolute;inset:0;background:rgba(0,0,0,0.8);display:none;flex-direction:column;align-items:center;justify-content:center;z-index:10;padding:20px;"></div>
      </div>
      ${(chapters.length > 0 || bookmarks.length > 0) ? `
      <div style="display:flex;gap:4px;padding:6px 8px;background:#1e293b;overflow-x:auto;">
        ${chapters.map((ch) => `
          <button onclick="seekTo_${uid}(${ch.time})" style="padding:4px 10px;border-radius:6px;background:#334155;color:#e2e8f0;border:none;cursor:pointer;font-size:10px;white-space:nowrap;" title="${escapeHtml(ch.description)}">
            &#x1F4D1; ${escapeHtml(ch.title)}
          </button>
        `).join('')}
        ${bookmarks.map((bm) => `
          <button onclick="seekTo_${uid}(${bm.time})" style="padding:4px 10px;border-radius:6px;background:#312e81;color:#c7d2fe;border:none;cursor:pointer;font-size:10px;white-space:nowrap;">
            &#x1F516; ${escapeHtml(bm.label)}
          </button>
        `).join('')}
      </div>` : ''}
      <div style="padding:6px 12px;background:#1e293b;display:flex;align-items:center;gap:8px;">
        <button onclick="togglePlay_${uid}()" id="iv-playbtn-${uid}" style="background:none;border:none;color:white;cursor:pointer;font-size:16px;">&#x25B6;</button>
        <input type="range" id="iv-progress-${uid}" min="0" max="100" value="0" style="flex:1;accent-color:#7c3aed;cursor:pointer;" oninput="seekPercent_${uid}(this.value)">
        <span id="iv-time-${uid}" style="color:#94a3b8;font-size:10px;font-family:monospace;">0:00</span>
      </div>
    </div>
    <script>
      (function(){
        var video=document.getElementById('iv-video-${uid}');
        if(!video)return;
        var playBtn=document.getElementById('iv-playbtn-${uid}');
        var progress=document.getElementById('iv-progress-${uid}');
        var timeLabel=document.getElementById('iv-time-${uid}');
        var overlay=document.getElementById('iv-overlay-${uid}');
        var quizPts=${JSON.stringify(quizPoints.map(q => ({ time: q.time, question: q.question, options: q.options, correctIndex: q.correctIndex, points: q.pointsValue, id: q.id })))};
        var answered={};

        function fmt(s){var m=Math.floor(s/60);var sec=Math.floor(s%60);return m+':'+(sec<10?'0':'')+sec;}

        window['togglePlay_${uid}']=function(){
          if(video.paused){video.play();playBtn.innerHTML='&#x23F8;';}
          else{video.pause();playBtn.innerHTML='&#x25B6;';}
        };
        window['seekTo_${uid}']=function(t){video.currentTime=t;};
        window['seekPercent_${uid}']=function(val){if(video.duration)video.currentTime=(val/100)*video.duration;};

        video.addEventListener('timeupdate',function(){
          if(video.duration){
            progress.value=Math.round((video.currentTime/video.duration)*100);
            timeLabel.textContent=fmt(video.currentTime)+' / '+fmt(video.duration);
          }
          for(var i=0;i<quizPts.length;i++){
            var qp=quizPts[i];
            if(!answered[qp.id]&&Math.abs(video.currentTime-qp.time)<0.5){
              video.pause();playBtn.innerHTML='&#x25B6;';
              showIVQuiz_${uid}(qp);break;
            }
          }
        });

        window['showIVQuiz_${uid}']=function(qp){
          overlay.style.display='flex';
          var h='<div style="max-width:400px;width:100%;text-align:center;">';
          h+='<div style="font-size:10px;color:#a78bfa;text-transform:uppercase;margin-bottom:8px;">Quiz do V&iacute;deo</div>';
          h+='<p style="color:white;font-size:16px;font-weight:600;margin-bottom:16px;">'+qp.question+'</p>';
          qp.options.forEach(function(opt,idx){
            h+='<button onclick="ansIVQ_${uid}(\\''+qp.id+'\\','+idx+','+qp.correctIndex+','+qp.points+')" style="display:block;width:100%;margin:6px 0;padding:10px 16px;border-radius:10px;border:2px solid #475569;background:#1e293b;color:#e2e8f0;font-size:14px;cursor:pointer;text-align:left;">'+String.fromCharCode(65+idx)+') '+opt+'</button>';
          });
          h+='</div>';
          overlay.innerHTML=h;
        };

        window['ansIVQ_${uid}']=function(qpId,chosen,correct,pts){
          answered[qpId]=true;
          var ok=chosen===correct;
          overlay.innerHTML='<div style="text-align:center;"><div style="font-size:48px;margin-bottom:12px;">'+(ok?'&#x2705;':'&#x274C;')+'</div><p style="color:white;font-size:18px;font-weight:600;">'+(ok?'Correto! +'+pts+' pontos':'Incorreto')+'</p><button onclick="document.getElementById(\\'iv-overlay-${uid}\\').style.display=\\'none\\';document.getElementById(\\'iv-video-${uid}\\').play();document.getElementById(\\'iv-playbtn-${uid}\\').innerHTML=\\'&#x23F8;\\';" style="margin-top:16px;padding:10px 24px;border-radius:10px;background:#7c3aed;color:white;border:none;cursor:pointer;font-weight:600;">Continuar</button></div>';
          if(window.SCORM)SCORM.setInteraction(qpId,'choice',String(chosen),String(correct),ok?'correct':'wrong',pts);
        };

        video.addEventListener('ended',function(){
          playBtn.innerHTML='&#x25B6;';
          if(window.SCORM)SCORM.setStatus('completed');
        });
      })();
    </script>
  </div>`;
}

// ─── Wave 6: New Content Blocks ────────────────────────────────────────────

function generateLabeledGraphicBlockHTML(block: LabeledGraphicBlock, style: string): string {
  const markersHTML = block.markers.map((m, i) => `
    <button class="labeled-marker" onclick="this.nextElementSibling.classList.toggle('hidden')" style="position:absolute;left:${m.x}%;top:${m.y}%;transform:translate(-50%,-50%);width:28px;height:28px;border-radius:50%;background:${block.markerColor};color:#fff;border:2px solid #fff;cursor:pointer;font-size:12px;font-weight:bold;box-shadow:0 2px 8px rgba(0,0,0,0.2);z-index:2;">${block.markerStyle === 'numbered' ? i + 1 : '•'}</button>
    <div class="labeled-popup hidden" style="position:absolute;left:${m.x}%;top:${m.y + 4}%;background:#fff;border-radius:8px;padding:12px;box-shadow:0 4px 16px rgba(0,0,0,0.15);z-index:3;min-width:180px;max-width:260px;">
      <strong style="font-size:13px;">${m.label}</strong>
      <p style="font-size:12px;margin-top:4px;color:#555;">${m.content}</p>
      ${m.image ? `<img src="${m.image}" style="width:100%;border-radius:6px;margin-top:6px;" />` : ''}
    </div>
  `).join('');
  return `<div style="${style}" role="figure" aria-label="Imagem interativa">
    <div style="position:relative;width:100%;height:100%;overflow:hidden;border-radius:8px;">
      ${block.backgroundImage ? `<img src="${block.backgroundImage}" style="width:100%;height:100%;object-fit:cover;" alt="Labeled graphic" />` : '<div style="width:100%;height:100%;background:#e2e8f0;"></div>'}
      ${markersHTML}
    </div>
  </div>`;
}

function generateProcessBlockHTML(block: ProcessBlock, style: string): string {
  const isHoriz = block.layout === 'horizontal';
  const stepsHTML = block.steps.map((s, i) => `
    <div style="display:flex;flex-direction:column;align-items:center;text-align:center;flex:1;${i > 0 && isHoriz ? 'border-left:2px ' + block.connectorStyle + ' ' + block.activeColor + ';padding-left:12px;' : ''}${i > 0 && !isHoriz ? 'border-top:2px ' + block.connectorStyle + ' ' + block.activeColor + ';padding-top:12px;' : ''}">
      <div style="width:32px;height:32px;border-radius:50%;background:${block.activeColor};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:14px;margin-bottom:6px;">${block.style === 'numbered' ? i + 1 : (s.icon || '•')}</div>
      <strong style="font-size:13px;">${s.title}</strong>
      <p style="font-size:11px;color:#666;margin-top:2px;">${s.content}</p>
    </div>
  `).join('');
  return `<div style="${style}" role="list" aria-label="Processo">
    <div style="display:flex;flex-direction:${isHoriz ? 'row' : 'column'};align-items:${isHoriz ? 'flex-start' : 'stretch'};gap:8px;height:100%;padding:12px;">
      ${stepsHTML}
    </div>
  </div>`;
}

function generateLightboxBlockHTML(block: LightboxBlock, style: string): string {
  const modalId = 'modal-' + Math.random().toString(36).slice(2, 9);
  const widthMap = { small: '400px', medium: '600px', large: '800px' };
  return `<div style="${style}">
    <button onclick="document.getElementById('${modalId}').style.display='flex'" style="padding:10px 20px;background:#7c3aed;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:500;">
      ${block.triggerLabel || 'Abrir'}
    </button>
    <div id="${modalId}" style="display:none;position:fixed;inset:0;background:${block.overlayColor || 'rgba(0,0,0,0.5)'};z-index:1000;align-items:center;justify-content:center;" onclick="if(event.target===this)this.style.display='none'">
      <div style="background:#fff;border-radius:12px;padding:24px;max-width:${widthMap[block.modalWidth] || '600px'};width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.2);">
        <h3 style="font-size:18px;font-weight:bold;margin-bottom:12px;">${block.modalTitle}</h3>
        <p style="font-size:14px;color:#444;">${block.modalContent}</p>
        ${block.modalImage ? `<img src="${block.modalImage}" style="width:100%;border-radius:8px;margin-top:12px;" />` : ''}
        ${block.modalVideo ? `<video src="${block.modalVideo}" controls style="width:100%;border-radius:8px;margin-top:12px;"></video>` : ''}
      </div>
    </div>
  </div>`;
}

function generateQuoteBlockHTML(block: QuoteBlock, style: string): string {
  const styleMap: Record<string, string> = {
    classic: `border-left:4px solid ${block.accentColor};padding-left:16px;`,
    modern: `background:linear-gradient(135deg, ${block.accentColor}10, ${block.accentColor}05);border-radius:12px;padding:20px;`,
    callout: `background:${block.accentColor}10;border-left:4px solid ${block.accentColor};border-radius:0 8px 8px 0;padding:16px;`,
    'speech-bubble': `background:#f8fafc;border-radius:12px;padding:16px;position:relative;`,
  };
  return `<div style="${style}" role="blockquote">
    <div style="${styleMap[block.quoteStyle] || styleMap.modern};height:100%;display:flex;flex-direction:column;justify-content:center;text-align:${block.alignment};">
      <p style="font-size:16px;font-style:italic;color:#334155;line-height:1.6;">&ldquo;${block.text}&rdquo;</p>
      <div style="margin-top:12px;display:flex;align-items:center;gap:10px;${block.alignment === 'center' ? 'justify-content:center;' : ''}">
        ${block.authorImage ? `<img src="${block.authorImage}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;" />` : ''}
        <div>
          <strong style="font-size:13px;color:#1e293b;">${block.author}</strong>
          ${block.authorTitle ? `<p style="font-size:11px;color:#94a3b8;">${block.authorTitle}</p>` : ''}
        </div>
      </div>
    </div>
  </div>`;
}

function generateDownloadBlockHTML(block: DownloadBlock, style: string): string {
  const filesHTML = block.files.map(f => `
    <a href="${f.url}" download="${f.name}" style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;text-decoration:none;color:#334155;cursor:pointer;transition:background 0.2s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='#f8fafc'">
      <span style="font-size:20px;">📎</span>
      <div style="flex:1;min-width:0;">
        <strong style="font-size:13px;display:block;">${f.name}</strong>
        ${f.description ? `<span style="font-size:11px;color:#94a3b8;">${f.description}</span>` : ''}
      </div>
      <span style="font-size:11px;color:#94a3b8;">${f.size > 0 ? (f.size / 1024).toFixed(0) + ' KB' : ''}</span>
    </a>
  `).join('');
  return `<div style="${style}" role="list" aria-label="Downloads">
    <div style="display:flex;flex-direction:column;gap:8px;height:100%;padding:8px;overflow-y:auto;">
      ${filesHTML}
    </div>
  </div>`;
}

function generateCounterBlockHTML(block: CounterBlock, style: string): string {
  const itemsHTML = block.items.map(item => `
    <div style="text-align:center;flex:1;padding:12px;">
      <div class="counter-value" data-target="${item.value}" data-prefix="${item.prefix || ''}" data-suffix="${item.suffix || ''}" data-duration="${block.animationDuration || 2}" style="font-size:32px;font-weight:bold;color:${item.color};">${item.prefix || ''}${item.value}${item.suffix || ''}</div>
      <div style="font-size:12px;color:#64748b;margin-top:4px;">${item.label}</div>
    </div>
  `).join('');
  return `<div style="${style}">
    <div style="display:flex;flex-direction:${block.layout === 'grid' ? 'row;flex-wrap:wrap' : 'row'};align-items:center;justify-content:center;height:100%;gap:16px;">
      ${itemsHTML}
    </div>
  </div>`;
}

function generateButtonBlockHTML(block: ButtonBlock, style: string): string {
  const sizeMap = { small: 'padding:6px 14px;font-size:12px;', medium: 'padding:10px 24px;font-size:14px;', large: 'padding:14px 32px;font-size:16px;' };
  const styleMap: Record<string, string> = {
    primary: `background:#7c3aed;color:#fff;border:none;`,
    secondary: `background:#e2e8f0;color:#1e293b;border:none;`,
    outline: `background:transparent;color:#7c3aed;border:2px solid #7c3aed;`,
    ghost: `background:transparent;color:#7c3aed;border:none;`,
  };
  const href = block.action === 'link' ? (block.url || '#') : block.action === 'download' ? (block.downloadUrl || '#') : '#';
  const onclick = block.action === 'slide' ? `onclick="window.goToSlide && window.goToSlide(${block.targetSlideIndex || 0})"` : '';
  return `<div style="${style};display:flex;align-items:center;justify-content:center;">
    <a href="${href}" ${onclick} style="${sizeMap[block.size] || sizeMap.medium}${styleMap[block.buttonStyle] || styleMap.primary}border-radius:8px;text-decoration:none;cursor:pointer;font-weight:500;display:inline-flex;align-items:center;gap:6px;${block.fullWidth ? 'width:100%;justify-content:center;' : ''}" role="button">
      ${block.label}
    </a>
  </div>`;
}

function generateDividerBlockHTML(block: DividerBlock, style: string): string {
  if (block.dividerStyle === 'gradient') {
    return `<div style="${style};display:flex;align-items:center;">
      <div style="width:100%;height:${block.thickness}px;background:linear-gradient(to right, transparent, ${block.color}, transparent);"></div>
    </div>`;
  }
  return `<div style="${style};display:flex;align-items:center;">
    <hr style="width:100%;border:none;border-top:${block.thickness}px ${block.dividerStyle} ${block.color};margin:0;" />
  </div>`;
}

function generateEmbedBlockHTML(block: EmbedBlock, style: string): string {
  return `<div style="${style}" role="region" aria-label="${block.title}">
    <iframe src="${block.url}" title="${block.title}" style="width:100%;height:100%;border:none;border-radius:8px;" ${block.allowFullscreen ? 'allowfullscreen' : ''} loading="lazy"></iframe>
  </div>`;
}

// ─── Wave 7: Advanced Quiz Types ───────────────────────────────────────────

function generateLikertBlockHTML(block: LikertBlock, style: string): string {
  const scaleHTML = block.scale.labels.map((label, i) => `<th style="padding:8px;font-size:11px;text-align:center;border:1px solid #e2e8f0;">${label}</th>`).join('');
  const statementsHTML = (block.statements || []).map(stmt => `
    <tr>
      <td style="padding:8px;border:1px solid #e2e8f0;text-align:left;font-size:12px;font-weight:500;">${stmt.text}</td>
      ${block.scale.labels.map((_, i) => `<td style="padding:8px;text-align:center;border:1px solid #e2e8f0;"><input type="radio" name="likert_${stmt.id}" value="${block.scale.values[i]}" /></td>`).join('')}
    </tr>
  `).join('');
  return `<div style="${style};padding:16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
    <div style="margin-bottom:16px;">
      <h3 style="font-size:14px;font-weight:600;color:#1e293b;margin:0 0 12px 0;">${escapeHtml(block.question)}</h3>
    </div>
    <div style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr><th style="padding:8px;border:1px solid #e2e8f0;"></th>${scaleHTML}</tr>
        </thead>
        <tbody>${statementsHTML}</tbody>
      </table>
    </div>
  </div>`;
}

function generateRankingBlockHTML(block: RankingBlock, style: string): string {
  const itemsHTML = (block.items || []).map((item, i) => `
    <div style="padding:10px;background:white;border:1px solid #e2e8f0;border-radius:6px;margin-bottom:8px;display:flex;align-items:center;gap:12px;">
      <div style="font-weight:600;color:#0891b2;font-size:14px;min-width:24px;">${i + 1}</div>
      <div style="flex:1;font-size:13px;color:#334155;">${escapeHtml(item.text)}</div>
      <svg width="20" height="20" viewBox="0 0 20 20" style="cursor:grab;color:#94a3b8;"><path fill="currentColor" d="M8 5a1 1 0 0 0-2 0v10a1 1 0 1 0 2 0V5zm6 0a1 1 0 1 0-2 0v10a1 1 0 1 0 2 0V5z"/></svg>
    </div>
  `).join('');
  return `<div style="${style};padding:16px;background:#f0f9ff;border-radius:8px;border:1px solid #0891b2;">
    <h3 style="font-size:14px;font-weight:600;color:#1e293b;margin:0 0 12px 0;">${escapeHtml(block.question)}</h3>
    <div>${itemsHTML}</div>
  </div>`;
}

function generateEssayBlockHTML(block: EssayBlock, style: string): string {
  const wordCountHTML = block.showWordCount ? `<div style="font-size:11px;color:#94a3b8;margin-top:8px;">Palavras: <span id="wordCount_${block.id}">0</span> / ${block.maxWords || '∞'}</div>` : '';
  return `<div style="${style};padding:16px;background:#fffbeb;border-radius:8px;border:1px solid #d97706;">
    <h3 style="font-size:14px;font-weight:600;color:#1e293b;margin:0 0 12px 0;">${escapeHtml(block.question)}</h3>
    <textarea style="width:100%;min-height:120px;padding:12px;border:1px solid #d97706;border-radius:6px;font-family:inherit;font-size:13px;resize:vertical;" placeholder="${escapeHtml(block.placeholder || 'Digite aqui...')}" data-min-words="${block.minWords || 0}" data-max-words="${block.maxWords || 999999}"></textarea>
    ${wordCountHTML}
  </div>`;
}

function generateNumericBlockHTML(block: NumericBlock, style: string): string {
  const unitHTML = block.unit ? `<span style="font-size:13px;color:#059669;margin-left:8px;font-weight:500;">${escapeHtml(block.unit)}</span>` : '';
  return `<div style="${style};padding:16px;background:#f0fdf4;border-radius:8px;border:1px solid #059669;">
    <h3 style="font-size:14px;font-weight:600;color:#1e293b;margin:0 0 12px 0;">${escapeHtml(block.question)}</h3>
    <div style="display:flex;align-items:center;gap:12px;">
      <input type="number" style="flex:1;padding:10px;border:1px solid #059669;border-radius:6px;font-size:13px;font-family:monospace;" placeholder="0.00" step="${Math.pow(10, -(block.decimalPlaces || 2))}" />
      ${unitHTML}
    </div>
    <div style="font-size:11px;color:#94a3b8;margin-top:8px;">Tolerância: ±${block.tolerance || 0}</div>
  </div>`;
}

function generateDropdownBlockHTML(block: DropdownBlock, style: string): string {
  const itemsHTML = (block.items || []).map(item => `
    <div style="margin-bottom:12px;padding:12px;background:white;border:1px solid #6366f1;border-radius:6px;">
      <div style="font-size:13px;color:#334155;margin-bottom:8px;">${escapeHtml(item.text)}</div>
      <select style="width:100%;padding:8px;border:1px solid #6366f1;border-radius:4px;font-size:12px;">
        <option value="">Selecione...</option>
        ${(item.options || []).map(opt => `<option value="${escapeHtml(opt)}">${escapeHtml(opt)}</option>`).join('')}
      </select>
    </div>
  `).join('');
  return `<div style="${style};padding:16px;background:#f5f3ff;border-radius:8px;border:1px solid #6366f1;">
    <h3 style="font-size:14px;font-weight:600;color:#1e293b;margin:0 0 12px 0;">${escapeHtml(block.question)}</h3>
    ${itemsHTML}
  </div>`;
}

function generateMatrixBlockHTML(block: MatrixBlock, style: string): string {
  const columns = block.columns || [];
  const rows = block.rows || [];
  const inputType = block.inputType || 'radio';

  const columnHeadersHTML = columns.map(col => `<th style="padding:8px;text-align:center;border:1px solid #dc2626;font-size:12px;font-weight:600;color:#991b1b;">${escapeHtml(col.label)}</th>`).join('');

  const rowsHTML = rows.map((row, rowIdx) => `
    <tr>
      <td style="padding:8px;border:1px solid #dc2626;font-weight:500;font-size:12px;text-align:left;">${escapeHtml(row.label)}</td>
      ${columns.map((col, colIdx) => `
        <td style="padding:8px;border:1px solid #dc2626;text-align:center;">
          <input type="${inputType}" name="matrix_${rowIdx}" value="${col.id}" />
        </td>
      `).join('')}
    </tr>
  `).join('');

  return `<div style="${style};padding:16px;background:#fef2f2;border-radius:8px;border:1px solid #dc2626;">
    <h3 style="font-size:14px;font-weight:600;color:#1e293b;margin:0 0 12px 0;">${escapeHtml(block.question)}</h3>
    <div style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr><th style="padding:8px;border:1px solid #dc2626;"></th>${columnHeadersHTML}</tr>
        </thead>
        <tbody>${rowsHTML}</tbody>
      </table>
    </div>
  </div>`;
}

function generateImageChoiceBlockHTML(block: ImageChoiceBlock, style: string): string {
  const choices = block.choices || [];
  const columns = block.columns || 2;
  const showLabels = block.showLabels !== false;

  const choicesHTML = choices.map(choice => `
    <div style="flex:1;min-width:${100/columns}%;padding:8px;">
      <label style="display:flex;flex-direction:column;cursor:pointer;gap:8px;align-items:center;">
        <input type="${block.multiSelect ? 'checkbox' : 'radio'}" name="image_choice" value="${choice.id}" style="cursor:pointer;" />
        ${choice.image ? `<img src="${escapeHtml(choice.image)}" alt="${choice.label || ''}" style="width:100%;max-height:120px;object-fit:cover;border-radius:6px;border:2px solid #dbeafe;" />` : '<div style="width:100%;height:120px;background:#f1f5f9;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:12px;color:#94a3b8;">Imagem</div>'}
        ${showLabels && choice.label ? `<span style="font-size:12px;text-align:center;font-weight:500;color:#334155;">${escapeHtml(choice.label)}</span>` : ''}
      </label>
    </div>
  `).join('');

  return `<div style="${style};padding:16px;background:#f0f9ff;border-radius:8px;border:1px solid #2563eb;">
    <h3 style="font-size:14px;font-weight:600;color:#1e293b;margin:0 0 12px 0;">${escapeHtml(block.question)}</h3>
    <div style="display:flex;flex-wrap:wrap;gap:12px;">
      ${choicesHTML}
    </div>
  </div>`;
}

function generateCharacterBlockHTML(block: CharacterBlock, style: string): string {
  const { currentPose = "standing", currentExpression = "neutral", speechBubble, scale = 1 } = block;

  let speechBubbleHTML = "";
  if (speechBubble?.text) {
    const bubbleStyle = {
      speech: "border-radius:8px;background:#fff;border:2px solid #ec4899;",
      thought: "border-radius:50%;background:#f5f3ff;border:2px dashed #a855f7;",
      narration: "border-radius:4px;background:#f9f5ff;border:2px solid #d946ef;",
    }[speechBubble.style || "speech"] || "border-radius:8px;background:#fff;border:2px solid #ec4899;";

    speechBubbleHTML = `
      <div style="${bubbleStyle}padding:12px;margin:8px;font-size:13px;color:#1e293b;text-align:center;max-width:90%;">
        ${escapeHtml(speechBubble.text)}
      </div>
    `;
  }

  const scaleStyle = scale !== 1 ? `transform:scale(${scale});` : "";
  const mirrorStyle = (block as any).mirrorHorizontal ? "transform:scaleX(-1);" : "";

  return `
    <div class="block character-block" style="${style}padding:12px;background:#fce7f3;border-radius:12px;border:1px solid #fbcfe8;display:flex;flex-direction:column;align-items:center;justify-content:center;">
      <div style="text-align:center;font-size:11px;font-weight:600;color:#be185d;margin-bottom:8px;">PERSONAGEM: ${escapeHtml(currentPose)} / ${escapeHtml(currentExpression)}</div>
      <div style="font-size:64px;${scaleStyle}${mirrorStyle}">👤</div>
      <div style="margin-top:8px;font-size:10px;color:#9f1239;text-align:center;">
        ${escapeHtml(currentPose)} | ${escapeHtml(currentExpression)}
      </div>
      ${speechBubbleHTML}
    </div>
  `;
}

function generateScenarioBlockHTML(block: ScenarioBlock, style: string): string {
  const { scenes = [], scenarioStyle = "visual-novel" } = block;
  const firstScene = scenes[0];

  const choicesHTML = (firstScene?.choices || []).map((choice: any) => `
    <button style="display:block;width:100%;padding:10px;margin:6px 0;background:#f97316;color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:500;">
      ${escapeHtml(choice.text)}
    </button>
  `).join("");

  const sceneIndicator = scenes.length > 1 ? `<span style="font-size:10px;background:#fed7aa;color:#92400e;padding:2px 6px;border-radius:3px;margin-left:8px;">Cena 1 de ${scenes.length}</span>` : "";

  return `
    <div class="block scenario-block" style="${style}padding:16px;background:#fef3c7;border-radius:12px;border:1px solid #fde68a;display:flex;flex-direction:column;">
      <div style="font-size:11px;font-weight:600;color:#b45309;margin-bottom:8px;">
        CENÁRIO ${sceneIndicator}
        <span style="display:inline-block;margin-left:4px;font-size:9px;background:#fed7aa;padding:2px 4px;border-radius:2px;">${scenarioStyle}</span>
      </div>

      <div style="flex:1;background:white;border-radius:8px;padding:12px;margin-bottom:12px;border:1px solid #fcd34d;font-size:13px;color:#334155;line-height:1.5;max-height:180px;overflow-y:auto;">
        ${firstScene ? escapeHtml(firstScene.narration) : "Adicione cenas ao cenário..."}
      </div>

      <div style="display:flex;flex-direction:column;gap:6px;">
        ${choicesHTML || '<div style="text-align:center;font-size:11px;color:#92400e;">Adicione opções de resposta</div>'}
      </div>
    </div>
  `;
}
