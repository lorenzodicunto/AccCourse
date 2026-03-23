# Interactivity Patterns — AccCourse

## Table of Contents
- [Padrão de Implementação](#padrão-de-implementação)
- [Blocos Existentes](#blocos-existentes)
- [Novos Blocos Planejados](#novos-blocos-planejados)
- [SCORM Interaction Types](#scorm-interaction-types)
- [Componentes de UI Recomendados](#componentes-de-ui-recomendados)

---

## Padrão de Implementação

Todo bloco interativo no AccCourse segue o mesmo padrão de 6 passos:

```
1. Interface TypeScript → useEditorStore.ts
2. Store actions        → useEditorStore.ts (addBlock defaults)
3. Toolbar button       → TopToolbar.tsx
4. Canvas rendering     → DraggableBlock.tsx
5. Properties panel     → PropertiesPanel.tsx
6. SCORM export         → htmlGenerator.ts
```

### Template de Interface

```typescript
interface NovoBlock extends BaseBlock {
  type: "novo";
  // Dados do conteúdo
  // Configurações visuais
  // Configurações de pontuação (se quiz)
  pointsValue: number;
  feedbackCorrect: string;
  feedbackIncorrect: string;
}
```

### Template de Defaults (TopToolbar)

```typescript
const novoBlock: NovoBlock = {
  id: crypto.randomUUID(),
  type: "novo",
  x: 100,
  y: 100,
  width: 400,
  height: 300,
  zIndex: currentSlide.blocks.length,
  // ... defaults do tipo
  pointsValue: 10,
  feedbackCorrect: "Correto! ✅",
  feedbackIncorrect: "Tente novamente! ❌",
};
addBlock(projectId, slideId, novoBlock);
```

### Template de SCORM Export

```typescript
// Em htmlGenerator.ts
function generateNovoBlockHTML(block: NovoBlock): string {
  return `
    <div class="block block-novo"
         style="left:${block.x}px; top:${block.y}px;
                width:${block.width}px; height:${block.height}px;
                z-index:${block.zIndex};">
      <!-- Conteúdo interativo -->
      <script>
        // Lógica de interação
        // Ao completar:
        // scormApi.setInteraction(index, type, response, correct, result, weight);
      </script>
    </div>
  `;
}
```

---

## Blocos Existentes

### Quiz Block (✅ Implementado)

**Tipo SCORM**: `choice`

```typescript
// Fluxo:
// 1. Renderiza pergunta + opções (radio buttons)
// 2. Usuário seleciona opção
// 3. Valida contra isCorrect
// 4. Mostra feedback (correct/incorrect)
// 5. SCORM: cmi.interactions.n.type = "choice"
//          cmi.interactions.n.student_response = "a"
//          cmi.interactions.n.result = "correct"
//    Score: cmi.score.raw += pointsValue
```

**Pontuação global**:
```typescript
// QuizSettings (nível do projeto):
{
  passingScore: 70,    // % mínima
  showResults: true,   // Overlay de resultados no final
  allowRetry: true,    // Pode refazer
  maxAttempts: 3,      // Tentativas máximas
}
// SCORM: cmi.core.score.raw = totalPoints
//        cmi.core.score.max = maxPossiblePoints
//        cmi.core.lesson_status = score >= passing ? "passed" : "failed"
```

### Flashcard Block (✅ Implementado)

**Tipo**: Conteúdo (não graded)

```typescript
// Fluxo:
// 1. Renderiza frente (frontContent + frontBg)
// 2. Click → CSS 3D flip animation
// 3. Mostra verso (backContent + backBg)
// 4. Não reporta ao SCORM (informativo)
```

### Video Block (✅ Implementado)

**Tipo**: Misto (conteúdo + interação)

```typescript
// Fluxo:
// 1. Renderiza react-player com URL (YouTube/Vimeo)
// 2. Em timestamps definidos, pausa e mostra pergunta
// 3. Usuário responde → marca answered: true
// 4. Pode reportar ao SCORM como interaction
```

---

## Novos Blocos Planejados

### Drag-and-Drop Block

**Tipo SCORM**: `matching`

```
┌────────────────────────────────────────┐
│  Arraste para a zona correta:          │
│                                        │
│  ┌──────┐  ┌──────┐  ┌──────┐        │
│  │Item A│  │Item B│  │Item C│ (drag)  │
│  └──────┘  └──────┘  └──────┘        │
│                                        │
│  ┌──────────┐  ┌──────────┐          │
│  │  Zona 1  │  │  Zona 2  │  (drop)  │
│  │          │  │          │          │
│  └──────────┘  └──────────┘          │
└────────────────────────────────────────┘
```

**Implementação com @dnd-kit**:
```typescript
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";

// Cada Item é um useDraggable
// Cada Zona é um useDroppable
// onDragEnd: verificar se item.correctZoneId === zona.id
```

**SCORM Export (no HTML gerado)**:
```javascript
// Implementar drag nativo no HTML exportado (sem React):
const items = document.querySelectorAll('.drag-item');
const zones = document.querySelectorAll('.drop-zone');
items.forEach(item => {
  item.draggable = true;
  item.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', item.dataset.id);
  });
});
zones.forEach(zone => {
  zone.addEventListener('drop', (e) => {
    const itemId = e.dataTransfer.getData('text/plain');
    const correct = checkAnswer(itemId, zone.dataset.id);
    scormApi.setInteraction(/*...*/);
  });
});
```

---

### Matching Block (Liga Pontos)

**Tipo SCORM**: `matching`

```
┌────────────────────────────────────────┐
│  Conecte os pares:                     │
│                                        │
│  ┌────────┐          ┌────────┐       │
│  │ Item A │──────────│ Def 2  │       │
│  ├────────┤          ├────────┤       │
│  │ Item B │──╲   ╱───│ Def 1  │       │
│  ├────────┤   ╲ ╱    ├────────┤       │
│  │ Item C │    ╳─────│ Def 3  │       │
│  └────────┘   ╱      └────────┘       │
└────────────────────────────────────────┘
```

**UI**: SVG lines (`<line>` ou `<path>`) conectando itens. Mouse events para criar/remover conexões.

---

### Sorting Block (Ordenação)

**Tipo SCORM**: `sequencing`

```
┌────────────────────────────────────────┐
│  Ordene os passos corretamente:        │
│                                        │
│  ┌─ 1 ──────────────────────┐         │
│  │ ≡ Ligar o computador     │  ↕      │
│  ├─ 2 ──────────────────────┤         │
│  │ ≡ Abrir o navegador      │  ↕      │
│  ├─ 3 ──────────────────────┤         │
│  │ ≡ Digitar a URL          │  ↕      │
│  └──────────────────────────┘         │
└────────────────────────────────────────┘
```

**Implementação**: `@dnd-kit/sortable` para reordenação vertical, comparar resultado com `correctOrder[]`.

---

### Fill-in-the-Blank Block

**Tipo SCORM**: `fill-in`

```
┌────────────────────────────────────────┐
│  Complete a frase:                     │
│                                        │
│  O Brasil foi descoberto em            │
│  [________] por [_______________].     │
│                                        │
│  [Verificar]                           │
└────────────────────────────────────────┘
```

**Renderização**: Parse `segments[]`, renderizar `type: "text"` como `<span>` e `type: "blank"` como `<input>`. Validar contra `correctAnswer` e `acceptedVariants[]`.

---

### Hotspot Block

**Tipo SCORM**: `other` ou `performance`

```
┌────────────────────────────────────────┐
│  ┌──────────────────────────────┐     │
│  │         Imagem Base          │     │
│  │     ●                        │     │
│  │          ●        ●          │     │
│  │                     ●        │     │
│  └──────────────────────────────┘     │
│                                        │
│  Clique nos pontos para explorar       │
└────────────────────────────────────────┘
```

**Dois modos**:
1. `explore` — mostrar tooltip/popup ao clicar (informativo)
2. `quiz` — "clique no item correto" (pontuação SCORM)

**UI**: SVG overlay sobre `<img>`, círculos posicionados por %, popup com conteúdo HTML.

---

### Branching Block

**Tipo SCORM**: `cmi.suspend_data` para salvar caminho

```
┌────────────────────────────────────────┐
│  O cliente está insatisfeito com o     │
│  produto. O que você faz?              │
│                                        │
│  ┌─────────────────────┐               │
│  │ A) Oferecer reembolso│──▸ Slide 5   │
│  ├─────────────────────┤               │
│  │ B) Trocar produto   │──▸ Slide 7   │
│  ├─────────────────────┤               │
│  │ C) Pedir desculpas  │──▸ Slide 9   │
│  └─────────────────────┘               │
└────────────────────────────────────────┘
```

**Implementação especial**: Altera a ordem de navegação dos slides. Precisa de:
- `targetSlideId` em cada choice
- Lógica no SCORM player para pular para slide correto
- Salvar caminho em `cmi.suspend_data` para retomada

---

## SCORM Interaction Types

Mapeamento entre blocos AccCourse e tipos SCORM 1.2:

| Bloco AccCourse | `cmi.interactions.n.type` | `student_response` format | `correct_responses` |
|-----------------|---------------------------|---------------------------|---------------------|
| Quiz (choice) | `choice` | `a` (letra da opção) | `b` |
| Drag-and-drop | `matching` | `a[.]1,b[.]2,c[.]3` | `a[.]2,b[.]1,c[.]3` |
| Matching | `matching` | `a[.]x,b[.]y` | `a[.]y,b[.]x` |
| Sorting | `sequencing` | `c,a,b` | `a,b,c` |
| Fill-blank | `fill-in` | `resposta` | `resposta` |
| Hotspot (quiz) | `performance` | `spot_1` | `spot_2` |

### Funções SCORM Helper

```javascript
// Adicionar ao scormApi.ts:
function setInteraction(index, type, studentResponse, correctResponse, result, weight) {
  LMSSetValue(`cmi.interactions.${index}.id`, `interaction_${index}`);
  LMSSetValue(`cmi.interactions.${index}.type`, type);
  LMSSetValue(`cmi.interactions.${index}.student_response`, studentResponse);
  LMSSetValue(`cmi.interactions.${index}.correct_responses.0.pattern`, correctResponse);
  LMSSetValue(`cmi.interactions.${index}.result`, result); // "correct" | "wrong"
  LMSSetValue(`cmi.interactions.${index}.weighting`, weight.toString());
  LMSCommit();
}
```

---

## Componentes de UI Recomendados

| Necessidade | Componente shadcn/ui | Uso |
|-------------|---------------------|-----|
| Opções de quiz | `RadioGroup` | Seleção de resposta |
| Tabs | `Tabs` | TabsBlock |
| Accordion | `Accordion` | AccordionBlock |
| Drag items | `@dnd-kit/core` | DragDrop, Matching |
| Sortable list | `@dnd-kit/sortable` | SortingBlock |
| Input inline | `Input` | FillBlankBlock |
| Slider | `Slider` | Controle de propriedades |
| Tooltip/Pop | `Popover` | HotspotBlock tooltips |
| Dialog | `Dialog` | Feedback modals |
| Badge | `Badge` | Gamificação |
| Progress | `Progress` | Score tracking |
