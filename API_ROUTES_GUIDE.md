# Guia dos Novos Endpoints de API - AccCourse

## 1. TTS (Text-to-Speech)
**Rota:** `POST /api/ai/tts`

**Limite de Taxa:** 5 requisições/minuto por IP

**Payload:**
```json
{
  "text": "Bem-vindo ao curso",
  "voice": "nova",
  "speed": 1.0
}
```

**Parâmetros:**
- `text` (string, obrigatório): Texto a converter em áudio (máx 4096 caracteres)
- `voice` (enum): "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" (padrão: "nova")
- `speed` (number): 0.25 a 4.0 (padrão: 1.0)

**Resposta (sucesso):**
```json
{
  "url": "/uploads/tts_1707123456789.mp3",
  "filename": "tts_1707123456789.mp3"
}
```

**Erros Possíveis:**
- `400`: Texto vazio, excede limite, voz inválida, velocidade inválida
- `429`: Muitas requisições
- `500`: Erro ao gerar áudio

---

## 2. Geração de Imagem (DALL-E 3)
**Rota:** `POST /api/ai/image`

**Limite de Taxa:** 3 requisições/minuto por IP

**Payload:**
```json
{
  "prompt": "Uma sala de aula moderna com estudantes",
  "style": "realistic",
  "size": "1024x1024"
}
```

**Parâmetros:**
- `prompt` (string, obrigatório): Descrição da imagem (máx 4000 caracteres)
- `style` (enum): "realistic" | "illustration" | "3d" | "watercolor" | "flat" (padrão: "realistic")
- `size` (enum): "1024x1024" | "1792x1024" | "1024x1792" (padrão: "1024x1024")

**Resposta (sucesso):**
```json
{
  "url": "/uploads/ai_img_1707123456789.png",
  "revisedPrompt": "Uma sala de aula moderna com estudantes. Estilo: fotografia realista, alta qualidade, profissional. Alta qualidade, detalhado."
}
```

**Erros Possíveis:**
- `400`: Prompt vazio, exceede limite, estilo/tamanho inválido
- `429`: Muitas requisições
- `500`: Erro ao gerar imagem

---

## 3. Tradução de Conteúdo
**Rota:** `POST /api/ai/translate`

**Limite de Taxa:** 2 requisições/minuto por IP

**Payload:**
```json
{
  "courseData": {
    "title": "Meu Curso",
    "description": "Descrição do curso",
    "slides": [
      {
        "title": "Slide 1",
        "blocks": [
          {
            "type": "text",
            "content": "<h1>Título</h1><p>Conteúdo aqui</p>"
          }
        ]
      }
    ]
  },
  "targetLanguage": "en",
  "sourceLanguage": "pt-BR"
}
```

**Parâmetros:**
- `courseData` (object, obrigatório): Estrutura JSON do curso
- `targetLanguage` (string, obrigatório): Idioma alvo
- `sourceLanguage` (string): Idioma de origem (padrão: "pt-BR")

**Idiomas Suportados:** pt-BR, en, es, fr, de, it, ja, ko, zh, ar, ru, hi, nl, pl, sv, tr, th, vi, id, cs

**Resposta (sucesso):**
```json
{
  "title": "My Course",
  "description": "Course description",
  "slides": [...]
}
```

**Campos Traduzidos Automaticamente:**
- title, description, content, question, options, feedback, notes, narration (em qualquer nível da estrutura)

**Erros Possíveis:**
- `400`: courseData inválido, idioma não suportado
- `429`: Muitas requisições
- `500`: Erro ao traduzir

---

## 4. Paleta de Cores Inteligente
**Rota:** `POST /api/ai/smart-colors`

**Limite de Taxa:** 10 requisições/minuto por IP

**Payload:**
```json
{
  "description": "Plataforma educacional para crianças",
  "baseColor": "#3b82f6",
  "mood": "playful"
}
```

**Parâmetros:**
- `description` (string): Descrição do projeto (máx 500 caracteres)
- `baseColor` (string): Cor base em hexadecimal
- `mood` (enum): "professional" | "playful" | "elegant" | "energetic" | "calm" (padrão: "professional")

**Resposta (sucesso):**
```json
{
  "primary": "#1e40af",
  "secondary": "#0f766e",
  "accent": "#dc2626",
  "background": "#ffffff",
  "text": "#1f2937",
  "heading": "#111827",
  "success": "#059669",
  "warning": "#f59e0b",
  "error": "#dc2626",
  "gradients": [
    "linear-gradient(135deg, #1e40af 0%, #0f766e 100%)",
    "linear-gradient(135deg, #1e40af 0%, #dc2626 100%)"
  ]
}
```

**Erros Possíveis:**
- `400`: Mood inválido, descrição muito longa
- `429`: Muitas requisições
- `500`: Erro ao gerar paleta

---

## 5. Busca de Imagens Unsplash
**Rota:** `GET /api/assets/unsplash`

**Limite de Taxa:** 20 requisições/minuto por IP

**Query Parameters:**
- `query` (string): Termo de busca (padrão: "nature")
- `page` (number): Número da página (padrão: 1)
- `perPage` (number): Imagens por página, máx 50 (padrão: 12)

**Exemplo de Requisição:**
```
GET /api/assets/unsplash?query=classroom&page=1&perPage=12
```

**Resposta (sucesso):**
```json
{
  "results": [
    {
      "id": "photo-123",
      "url": "https://images.unsplash.com/...",
      "thumbUrl": "https://images.unsplash.com/...",
      "description": "Uma sala de aula",
      "author": "John Doe"
    }
  ],
  "totalPages": 42
}
```

**Erros Possíveis:**
- `400`: Termo de busca muito longo (>100 caracteres)
- `429`: Muitas requisições
- `500`: Erro ao buscar imagens

---

## Características Comuns

### Rate Limiting
Todos os endpoints implementam rate limiting baseado em IP:
- TTS: 5/min
- Image: 3/min
- Translate: 2/min
- Smart Colors: 10/min
- Unsplash: 20/min

Resposta quando limite excedido:
```json
{
  "error": "Muitas requisições. Tente novamente em breve."
}
```

### Mock Fallback
Se as variáveis de ambiente não estiverem configuradas:
- `OPENAI_API_KEY` (para TTS, Image, Translate, Smart Colors)
- `UNSPLASH_API_KEY` (para Unsplash)

Os endpoints retornam dados mock realistas automaticamente.

### Armazenamento de Arquivos
- Desenvolvimento: `/public/uploads/`
- Produção: `/app/data/uploads/` (volume persistente)

URLs são servidas como:
- Desenvolvimento: `/uploads/filename`
- Produção: `/api/uploads/filename`

### Mensagens de Erro
Todas as mensagens de erro estão em **Português do Brasil**.

---

## Exemplos de Uso em TypeScript

### TTS
```typescript
const response = await fetch('/api/ai/tts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Introdução ao curso',
    voice: 'nova',
    speed: 1.0
  })
});
const { url, filename } = await response.json();
```

### Imagem
```typescript
const response = await fetch('/api/ai/image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Sala de aula interativa',
    style: 'illustration',
    size: '1024x1024'
  })
});
const { url, revisedPrompt } = await response.json();
```

### Tradução
```typescript
const response = await fetch('/api/ai/translate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    courseData: courseObject,
    targetLanguage: 'en',
    sourceLanguage: 'pt-BR'
  })
});
const translatedCourse = await response.json();
```

### Smart Colors
```typescript
const response = await fetch('/api/ai/smart-colors', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    description: 'Plataforma para adultos',
    mood: 'professional'
  })
});
const colors = await response.json();
```

### Unsplash
```typescript
const response = await fetch('/api/assets/unsplash?query=technology&page=1&perPage=12');
const { results, totalPages } = await response.json();
```

---

## Notas Importantes

1. **Autenticação**: Nenhum desses endpoints requer autenticação (exceto upload que já existia)
2. **CORS**: Configurar CORS se necessário para chamadas frontend
3. **Timeout**: TTS/Image têm maxDuration estendido (30-120s)
4. **Validação**: Todos os inputs são validados antes de chamar APIs externas
5. **Streaming**: Image usa fetch nativo para download de arquivos
