// SCORM Course HTML Generator
// Generates the index.html content from course slides and blocks

import { CourseProject, Block, TextBlock, ImageBlock, FlashcardBlock, QuizBlock, VideoBlock, ShapeBlock, AudioBlock, TrueFalseBlock, MatchingBlock, FillBlankBlock, SortingBlock, HotspotBlock, AccordionBlock, TabsBlock } from "@/store/useEditorStore";
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
      <p style="font-size:16px;color:#1e293b;text-align:center;margin-bottom:16px;">${block.statement}</p>
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
          ${pairs.map((p, i) => `<div style="padding:8px 16px;background:#dbeafe;border-radius:8px;font-size:13px;color:#1e40af;cursor:pointer;" onclick="selectLeft_${uid}(${i})" id="ml-${uid}-${i}">${p.left}</div>`).join('')}
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${pairs.map((p, i) => `<div style="padding:8px 16px;background:#e0e7ff;border-radius:8px;font-size:13px;color:#3730a3;cursor:pointer;" onclick="selectRight_${uid}(${i})" id="mr-${uid}-${i}">${p.right}</div>`).join('')}
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
          if (seg.type === 'text') return seg.content;
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
          <span style="color:#a78bfa;font-family:monospace;">≡</span> ${item.content}
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
          <strong>${spot.label}</strong><br/>${spot.content}
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
            <span style="font-size:13px;font-weight:600;color:#1e293b;">${section.title}</span>
            <span id="acc-icon-${uid}-${i}" style="font-size:10px;color:#94a3b8;transition:transform 0.2s;">${i === 0 ? '▼' : '▶'}</span>
          </div>
          <div id="acc-content-${uid}-${i}" style="padding:0 16px;max-height:${i === 0 ? '200px' : '0'};overflow:hidden;transition:max-height 0.3s ease;${i === 0 ? 'padding-bottom:12px;' : ''}">
            <p style="font-size:13px;color:#64748b;line-height:1.6;padding-top:8px;">${section.content}</p>
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
            ${tab.label}
          </div>
        `).join('')}
      </div>
      <div style="flex:1;padding:16px;overflow-y:auto;">
        ${(block.tabs || []).map((tab, i) => `
          <div id="tab-content-${uid}-${i}" style="display:${i === 0 ? 'block' : 'none'};font-size:14px;color:#475569;line-height:1.6;">
            ${tab.content}
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
