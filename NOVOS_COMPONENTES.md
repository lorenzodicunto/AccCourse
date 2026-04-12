# Novos Componentes - AccCourse

## Resumo Executivo

Foram criados 7 componentes React novos para a plataforma AccCourse, incluindo gravadores de mídia, verificadores de acessibilidade e painel de revisão colaborativa. Todos os componentes seguem as melhores práticas com React 19, Next.js 16.2, Tailwind CSS e shadcn/ui.

---

## Componentes Criados

### 1. Media Recorders

#### WebcamRecorder.tsx
**Localização:** `/src/components/media/WebcamRecorder.tsx`

Componente modal para gravação de vídeo via webcam.

**Funcionalidades:**
- Listagem dinâmica de câmeras e microfones disponíveis
- Preview ao vivo da webcam
- Gravação com controles Record/Pause/Stop
- Timer mostrando duração da gravação
- Preview do vídeo gravado antes de confirmar
- Upload automático para `/api/upload`
- Tratamento de erros de permissão
- Interface totalmente em português (PT-BR)

**Props:**
```typescript
interface WebcamRecorderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecordingComplete: (blob: Blob, url: string) => void;
}
```

**Tecnologias Utilizadas:**
- `navigator.mediaDevices.getUserMedia()` - Acesso à câmera
- `MediaRecorder API` - Gravação de mídia
- Radix UI Dialog - Modal
- Tailwind CSS com cores purple

---

#### ScreenRecorder.tsx
**Localização:** `/src/components/media/ScreenRecorder.tsx`

Componente modal para gravação de tela (screencasting).

**Funcionalidades:**
- Seleção de tela/janela via `getDisplayMedia`
- Opção para incluir/excluir áudio do sistema
- Overlay picture-in-picture com webcam
- Controles Record/Pause/Stop
- Timer e preview
- Upload para `/api/upload`
- Avisos quando captura é cancelada
- Interface intuitiva em PT-BR

**Props:**
```typescript
interface ScreenRecorderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecordingComplete: (blob: Blob, url: string) => void;
}
```

**Tecnologias Utilizadas:**
- `navigator.mediaDevices.getDisplayMedia()` - Captura de tela
- Canvas API - Composição de vídeo com overlay
- MediaRecorder API - Gravação
- Radix UI Dialog

---

### 2. Accessibility Components

#### AccessibilityChecker.tsx
**Localização:** `/src/components/accessibility/AccessibilityChecker.tsx`

Painel completo de auditoria de acessibilidade WCAG 2.1.

**Verificações Implementadas:**
1. **Imagens sem alt text** - Alerta
2. **Contraste insuficiente** - Crítico
   - Calcula ratio WCAG entre cores
   - Recomenda mínimo 4.5:1
3. **Texto muito pequeno** - Alerta (< 14px)
4. **Vídeos sem legendas** - Crítico
5. **Elementos interativos não acessíveis** - Alerta
6. **Hierarquia de headings incorreta** - Sugestão
7. **Slides sem narração** - Alerta
8. **Ausência de declaração de idioma** - Sugestão

**Severidade dos Problemas:**
- **Crítico** (Vermelho): 10 pontos perdidos cada
- **Alerta** (Amarelo): 5 pontos perdidos cada
- **Sugestão** (Azul): 1 ponto perdido cada

**Funcionalidades:**
- Pontuação geral (0-100%)
- Contadores por severidade
- Barra de progresso visual
- Descrição detalhada de cada problema
- Instruções de correção
- Botão "Corrigir Automaticamente" para problemas auto-fixáveis
- Scroll interno para muitos problemas

**Props:**
```typescript
interface AccessibilityCheckerProps {
  courseData: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

---

#### DualModeToggle.tsx
**Localização:** `/src/components/accessibility/DualModeToggle.tsx`

Toggle para alternar entre modo padrão e modo acessível.

**Modo Acessível Inclui:**
- Fontes aumentadas (18px base)
- Line-height aumentado (1.8)
- Letter-spacing aumentado (0.5px)
- Animações desabilitadas
- Contraste aumentado (fundo branco, texto preto)
- Outline de foco de 3px em purple
- Botões e inputs aumentados (mínimo 44px altura)
- Bordas mais visíveis

**Props:**
```typescript
interface DualModeToggleProps {
  mode: "standard" | "accessible";
  onModeChange: (mode: "standard" | "accessible") => void;
}
```

**Tecnologias Utilizadas:**
- CSS-in-JS dinâmico
- Radix UI Button
- Ícones Lucide React

---

### 3. Collaboration Component

#### ReviewPanel.tsx
**Localização:** `/src/components/collaboration/ReviewPanel.tsx`

Painel para revisão de cursos com sistema de comentários completo.

**Funcionalidades:**
- Adicionar novos comentários
- Responder a comentários
- Mostrar/ocultar respostas expandidas
- Status de resolução (Pendente/Resolvido)
- Comentários resolvidos aparecem mais opacos
- Timestamps formatados em tempo relativo (PT-BR)
- Avatares de usuários
- Organização automática por status
- Separação visual clara entre pendentes e resolvidos

**Props:**
```typescript
interface ReviewPanelProps {
  courseId: string;
  slideId: string;
  comments?: Comment[];
  onAddComment: (comment: Omit<Comment, "id" | "timestamp">) => void;
}

interface Comment {
  id: string;
  author: string;
  avatarUrl?: string;
  text: string;
  timestamp: Date;
  status: "pendente" | "resolvido";
  replies?: Comment[];
}
```

**Textos em PT-BR:**
- "Painel de Revisão"
- "Adicionar Comentário"
- "Comentários Pendentes"
- "Comentários Resolvidos"
- "Resolver", "Responder", "Enviar"
- Timestamps em formato brasileiro ("2 horas atrás", "3 dias atrás", etc)

---

### 4. UI Components (Support)

#### select.tsx
**Localização:** `/src/components/ui/select.tsx`

Componente Select baseado em Radix UI.

**Exports:**
- `Select` - Raiz
- `SelectGroup` - Grupo de opções
- `SelectValue` - Valor selecionado
- `SelectTrigger` - Botão disparador
- `SelectContent` - Container de conteúdo
- `SelectItem` - Item individual
- `SelectSeparator` - Separador visual
- `SelectScrollUpButton` - Scroll para cima
- `SelectScrollDownButton` - Scroll para baixo

---

#### checkbox.tsx
**Localização:** `/src/components/ui/checkbox.tsx`

Componente Checkbox baseado em Radix UI.

**Exports:**
- `Checkbox` - Componente checkbox com styling Tailwind

---

## Index Files Criados

```typescript
// /src/components/media/index.ts
export { WebcamRecorder } from "./WebcamRecorder";
export { ScreenRecorder } from "./ScreenRecorder";

// /src/components/accessibility/index.ts
export { AccessibilityChecker } from "./AccessibilityChecker";
export { DualModeToggle } from "./DualModeToggle";

// /src/components/collaboration/index.ts
export { ReviewPanel } from "./ReviewPanel";
```

---

## Dependências Necessárias

Adicione ao `package.json`:

```json
{
  "dependencies": {
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-checkbox": "^1.0.0"
  }
}
```

Instale com:
```bash
npm install @radix-ui/react-select @radix-ui/react-checkbox
```

---

## Recursos & APIs Utilizadas

### Browser APIs
- **MediaRecorder API** - Gravação de áudio/vídeo
- **getUserMedia** - Acesso a câmera e microfone
- **getDisplayMedia** - Captura de tela
- **Canvas API** - Composição de vídeos com overlay
- **Fetch API** - Upload de arquivos
- **Radix UI** - Componentes primitivos acessíveis

### Componentes Externos
- **Tailwind CSS** - Styling com cores purple
- **shadcn/ui** - Componentes UI
- **Lucide React** - Ícones
- **Next.js 16.2** - Framework React
- **React 19.2** - biblioteca UI

---

## Compatibilidade

| Recurso | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| MediaRecorder | 49+ | 25+ | 14.1+ | 15+ |
| getUserMedia | 53+ | 36+ | 11+ | 12+ |
| getDisplayMedia | 72+ | 66+ | 13+ | 79+ |
| Canvas | Todos | Todos | Todos | Todos |

---

## Design & Acessibilidade

### Cores Utilizadas
- **Primary Purple**: `#7c3aed` (Tailwind: `purple-600`)
- **Hover Purple**: `#6d28d9` (Tailwind: `purple-700`)
- **Background**: `#ffffff` ou `#f9fafb`
- **Text**: `#111827` (preto escuro)

### Padrões de Acessibilidade
- Focus outlines visíveis (3px em purple)
- Contraste mínimo 4.5:1 (WCAG AA)
- Labels associadas a inputs
- ARIA attributes onde necessário
- Teclado navegável
- Screen reader friendly

### Responsividade
Todos os componentes são responsivos e funcionam em:
- Desktop (1920px+)
- Tablet (768px+)
- Mobile (320px+)

---

## Notas de Implementação

1. **Modo "use client"**: Todos os componentes usam diretiva "use client" para React 19
2. **TypeScript**: Tipagem completa em todas as props e estados
3. **Portuguese (Brazil)**: Todos os textos em português do Brasil
4. **Error Handling**: Tratamento robusto de erros em APIs de mídia
5. **Loading States**: Estados visuais durante operações assíncronas
6. **Validação**: Validação de entrada do usuário antes de operações

---

## Próximos Passos Sugeridos

1. Instalar dependências do Radix UI
2. Testar em navegadores modernos
3. Integrar endpoint `/api/upload` para media
4. Conectar ReviewPanel a banco de dados de comentários
5. Implementar sistema de permissões para comentários
6. Adicionar analytics para AccessibilityChecker
7. Testes E2E para fluxos de gravação

---

## Estrutura Final de Diretórios

```
src/components/
├── media/
│   ├── WebcamRecorder.tsx (546 linhas)
│   ├── ScreenRecorder.tsx (523 linhas)
│   └── index.ts
├── accessibility/
│   ├── AccessibilityChecker.tsx (445 linhas)
│   ├── DualModeToggle.tsx (165 linhas)
│   └── index.ts
├── collaboration/
│   ├── ReviewPanel.tsx (407 linhas)
│   └── index.ts
└── ui/
    ├── select.tsx (novos - componente Radix)
    └── checkbox.tsx (novos - componente Radix)
```

---

**Data de Criação:** 10 de Abril de 2026
**Versão:** 1.0.0
**Framework:** React 19.2.4 + Next.js 16.2.0
**Linguagem:** TypeScript + JavaScript (ES2024)
