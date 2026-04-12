# Dependências para Novos Componentes

Os novos componentes criados requerem as seguintes dependências adicionais que precisam ser instaladas:

## Dependências Necessárias

```bash
npm install @radix-ui/react-select @radix-ui/react-checkbox
```

### Versões Recomendadas
- `@radix-ui/react-select`: ^2.0.0
- `@radix-ui/react-checkbox`: ^1.0.0

## Componentes Criados

### Media Components
- **WebcamRecorder.tsx** - Gravador de webcam com seleção de dispositivos
- **ScreenRecorder.tsx** - Gravador de tela com suporte a webcam overlay

### Accessibility Components
- **AccessibilityChecker.tsx** - Verificador de acessibilidade WCAG
- **DualModeToggle.tsx** - Toggle para modo acessível vs padrão

### Collaboration Components
- **ReviewPanel.tsx** - Painel de revisão com comentários e respostas

### UI Components (Criados)
- **select.tsx** - Componente Select baseado em Radix UI
- **checkbox.tsx** - Componente Checkbox baseado em Radix UI

## Alterações no Package.json

Adicione as dependências ao arquivo `package.json`:

```json
{
  "dependencies": {
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-checkbox": "^1.0.0"
  }
}
```

## Instalação

Após adicionar ao `package.json`, execute:

```bash
npm install
```

ou com yarn:

```bash
yarn install
```

## Notas Importantes

1. **MediaRecorder API**: Suportada em navegadores modernos (Chrome 49+, Firefox 25+, Safari 14.1+)
2. **getDisplayMedia**: Requer navegador moderno e contexto seguro (HTTPS ou localhost)
3. **getUserMedia**: Requer permissões do usuário para câmera e microfone
4. **Acessibilidade**: Os componentes foram construídos seguindo padrões WCAG 2.1 AA

## Estrutura de Diretórios Criados

```
src/components/
├── media/
│   ├── WebcamRecorder.tsx
│   ├── ScreenRecorder.tsx
│   └── index.ts
├── accessibility/
│   ├── AccessibilityChecker.tsx
│   ├── DualModeToggle.tsx
│   └── index.ts
├── collaboration/
│   ├── ReviewPanel.tsx
│   └── index.ts
└── ui/
    ├── select.tsx
    └── checkbox.tsx
```

## Uso dos Componentes

### WebcamRecorder
```tsx
import { WebcamRecorder } from "@/components/media";

<WebcamRecorder
  open={open}
  onOpenChange={setOpen}
  onRecordingComplete={(blob, url) => {
    console.log("Gravação completa:", url);
  }}
/>
```

### ScreenRecorder
```tsx
import { ScreenRecorder } from "@/components/media";

<ScreenRecorder
  open={open}
  onOpenChange={setOpen}
  onRecordingComplete={(blob, url) => {
    console.log("Gravação de tela completa:", url);
  }}
/>
```

### AccessibilityChecker
```tsx
import { AccessibilityChecker } from "@/components/accessibility";

<AccessibilityChecker
  courseData={courseData}
  open={open}
  onOpenChange={setOpen}
/>
```

### DualModeToggle
```tsx
import { DualModeToggle } from "@/components/accessibility";

<DualModeToggle
  mode={accessibilityMode}
  onModeChange={setAccessibilityMode}
/>
```

### ReviewPanel
```tsx
import { ReviewPanel } from "@/components/collaboration";

<ReviewPanel
  courseId={courseId}
  slideId={slideId}
  comments={comments}
  onAddComment={handleAddComment}
/>
```

## Compatibilidade

- **React**: 19.2.4+
- **Next.js**: 16.2.0+
- **TypeScript**: 5+
- **Tailwind CSS**: 4+

## Recursos

- API MediaRecorder: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
- getDisplayMedia: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia
- getUserMedia: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
- Radix UI: https://www.radix-ui.com/
