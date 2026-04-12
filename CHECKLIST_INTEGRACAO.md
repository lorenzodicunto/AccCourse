# Checklist de Integração - Novos Componentes

Guia passo a passo para integrar os novos componentes no projeto AccCourse.

---

## Fase 1: Preparação

- [ ] **Revisar arquivos criados**
  - [ ] Ler NOVOS_COMPONENTES.md para visão geral
  - [ ] Ler COMPONENTES_DEPENDENCIES.md para dependências
  - [ ] Ler EXEMPLOS_USO.md para casos de uso

- [ ] **Verificar estrutura de diretórios**
  ```bash
  ls -la src/components/media/
  ls -la src/components/accessibility/
  ls -la src/components/collaboration/
  ```

- [ ] **Confirmar que os arquivos estão no local correto**
  ```bash
  find src/components -name "*.tsx" -o -name "*.ts" | wc -l
  # Deve listar 13 arquivos
  ```

---

## Fase 2: Dependências

- [ ] **Adicionar dependências ao package.json**
  ```json
  {
    "dependencies": {
      "@radix-ui/react-select": "^2.0.0",
      "@radix-ui/react-checkbox": "^1.0.0"
    }
  }
  ```

- [ ] **Instalar dependências**
  ```bash
  npm install
  # ou
  yarn install
  ```

- [ ] **Verificar instalação**
  ```bash
  npm ls @radix-ui/react-select @radix-ui/react-checkbox
  ```

---

## Fase 3: Testes Básicos

- [ ] **Verificar TypeScript compilation**
  ```bash
  npm run build
  ```

- [ ] **Verificar lint**
  ```bash
  npm run lint
  ```

- [ ] **Iniciar dev server**
  ```bash
  npm run dev
  ```

- [ ] **Abrir http://localhost:3000 e verificar se não há erros no console**

---

## Fase 4: Integração de Componentes

### WebcamRecorder
- [ ] Criar página de teste para WebcamRecorder
  ```tsx
  // pages/test/webcam.tsx
  import { WebcamRecorder } from "@/components/media";
  // ... seu código aqui
  ```

- [ ] Testar em navegador moderno (Chrome 49+)
  - [ ] Verificar se pede permissão de câmera
  - [ ] Verificar se lista câmeras disponíveis
  - [ ] Testar botão "Iniciar Webcam"
  - [ ] Testar gravação (Record/Pause/Stop)
  - [ ] Verificar timer de duração
  - [ ] Testar preview do vídeo gravado
  - [ ] Testar upload (se `/api/upload` está implementado)

- [ ] Testar tratamento de erros
  - [ ] Negar permissão de câmera
  - [ ] Verificar mensagem de erro

### ScreenRecorder
- [ ] Criar página de teste para ScreenRecorder
  ```tsx
  // pages/test/screen.tsx
  import { ScreenRecorder } from "@/components/media";
  // ... seu código aqui
  ```

- [ ] Testar em navegador moderno (Chrome 72+)
  - [ ] Clicar "Selecionar Tela"
  - [ ] Verificar diálogo de seleção do sistema operacional
  - [ ] Selecionar uma janela ou tela
  - [ ] Testar gravação com áudio (se disponível)
  - [ ] Testar opção de webcam overlay
  - [ ] Verificar composição com Canvas
  - [ ] Testar upload do vídeo

- [ ] Testar em HTTPS (necessário para getDisplayMedia em produção)

### AccessibilityChecker
- [ ] Criar página de teste com elementos de teste
  ```tsx
  // pages/test/accessibility.tsx
  import { AccessibilityChecker } from "@/components/accessibility";
  // ... seu código aqui com imagens sem alt, etc
  ```

- [ ] Testar verificações
  - [ ] Clicar "Iniciar Verificação"
  - [ ] Aguardar análise (deve detectar problemas)
  - [ ] Verificar se mostra:
    - [ ] Problemas críticos em vermelho
    - [ ] Alertas em amarelo
    - [ ] Sugestões em azul
  - [ ] Verificar pontuação geral
  - [ ] Testar botão "Verificar Novamente"

- [ ] Testar auto-fix
  - [ ] Se houver problemas auto-fixáveis
  - [ ] Clicar "Corrigir Automaticamente"
  - [ ] Verificar se corrige

### DualModeToggle
- [ ] Criar layout de teste
  ```tsx
  // layouts/test.tsx
  import { DualModeToggle } from "@/components/accessibility";
  // ... seu código aqui
  ```

- [ ] Testar modo padrão
  - [ ] Clicar "Modo Padrão"
  - [ ] Verificar estilo normal

- [ ] Testar modo acessível
  - [ ] Clicar "Modo Acessível"
  - [ ] Verificar:
    - [ ] Fonts maiores
    - [ ] Maior espaçamento
    - [ ] Cores com maior contraste
    - [ ] Focus rings visíveis
    - [ ] Sem animações suavizadas

- [ ] Testar persistência (opcional)
  - [ ] Guardar preferência em localStorage
  - [ ] Recarregar página
  - [ ] Verificar se mantém modo selecionado

### ReviewPanel
- [ ] Criar página de teste
  ```tsx
  // pages/test/review.tsx
  import { ReviewPanel } from "@/components/collaboration";
  // ... seu código aqui
  ```

- [ ] Testar comentários
  - [ ] Digitar novo comentário
  - [ ] Clicar "Enviar Comentário"
  - [ ] Verificar se aparece na lista
  - [ ] Verificar timestamp em português

- [ ] Testar respostas
  - [ ] Clicar "Responder" em um comentário
  - [ ] Digitar resposta
  - [ ] Enviar
  - [ ] Verificar se mostra aninhada

- [ ] Testar status
  - [ ] Clicar "Resolver" em um comentário
  - [ ] Verificar se move para "Comentários Resolvidos"
  - [ ] Verificar estilo diferente

---

## Fase 5: Implementação de API

- [ ] **Implementar /api/upload**
  ```typescript
  // app/api/upload/route.ts
  export async function POST(request: Request) {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    // Seu código de salvamento aqui
    // Retornar { url: "path/to/file" }
    
    return Response.json({ url: "..." });
  }
  ```

- [ ] **Testar endpoint**
  ```bash
  # Testar upload de arquivo
  curl -X POST -F "file=@video.webm" http://localhost:3000/api/upload
  ```

- [ ] **Verificar se WebcamRecorder consegue fazer upload**

- [ ] **Verificar se ScreenRecorder consegue fazer upload**

---

## Fase 6: Integração com Banco de Dados (Opcional)

- [ ] **Se usar ReviewPanel:**
  - [ ] Criar tabela de comentários
    ```sql
    CREATE TABLE comments (
      id STRING PRIMARY KEY,
      courseId STRING,
      slideId STRING,
      author STRING,
      text TEXT,
      status ENUM('pendente', 'resolvido'),
      parentId STRING NULLABLE,
      createdAt DATETIME,
      updatedAt DATETIME
    );
    ```

  - [ ] Implementar endpoint para listar comentários
    ```
    GET /api/courses/{courseId}/slides/{slideId}/comments
    ```

  - [ ] Implementar endpoint para adicionar comentário
    ```
    POST /api/courses/{courseId}/slides/{slideId}/comments
    ```

  - [ ] Implementar endpoint para resolver comentário
    ```
    PATCH /api/courses/{courseId}/comments/{commentId}/resolve
    ```

---

## Fase 7: Testes Cross-Browser

- [ ] **Chrome (último 2 versões)**
  - [ ] WebcamRecorder ✓
  - [ ] ScreenRecorder ✓
  - [ ] AccessibilityChecker ✓
  - [ ] DualModeToggle ✓
  - [ ] ReviewPanel ✓

- [ ] **Firefox (último 2 versões)**
  - [ ] WebcamRecorder ✓
  - [ ] ScreenRecorder ✓
  - [ ] AccessibilityChecker ✓
  - [ ] DualModeToggle ✓
  - [ ] ReviewPanel ✓

- [ ] **Safari (último 2 versões)**
  - [ ] WebcamRecorder ✓
  - [ ] ScreenRecorder ⚠️ (pode não funcionar)
  - [ ] AccessibilityChecker ✓
  - [ ] DualModeToggle ✓
  - [ ] ReviewPanel ✓

- [ ] **Edge (último versão)**
  - [ ] Todos os componentes ✓

---

## Fase 8: Performance & Otimização

- [ ] **Verificar bundle size**
  ```bash
  npm run build
  # Verificar tamanho em .next/static
  ```

- [ ] **Lazy loading (opcional)**
  - [ ] Importar recorders dinamicamente
    ```tsx
    const WebcamRecorder = dynamic(
      () => import("@/components/media").then(mod => ({ default: mod.WebcamRecorder })),
      { ssr: false }
    );
    ```

- [ ] **Code splitting**
  - [ ] Verificar se componentes estão sendo carregados sob demanda

---

## Fase 9: Documentação

- [ ] **Atualizar README do projeto**
  - [ ] Adicionar seção sobre novos componentes
  - [ ] Adicionar links para NOVOS_COMPONENTES.md
  - [ ] Adicionar links para EXEMPLOS_USO.md

- [ ] **Adicionar exemplos à documentação interna**
  - [ ] Copiar exemplos relevantes para seu docs
  - [ ] Adaptar ao seu projeto específico

- [ ] **Comentar código complexo**
  - [ ] Adicionar comentários em AccessibilityChecker (cálculo de contraste)
  - [ ] Adicionar comentários em ScreenRecorder (Canvas overlay)

---

## Fase 10: QA & Testes

- [ ] **Testes Manuais**
  - [ ] Testar cada componente isoladamente
  - [ ] Testar em diferentes resoluções (mobile, tablet, desktop)
  - [ ] Testar com teclado (navegação por Tab)
  - [ ] Testar com screen reader (se possível)

- [ ] **Testes de Navegador**
  - [ ] Testar em modo privado/incógnito
  - [ ] Testar com cache limpo
  - [ ] Testar com JavaScript desabilitado (para componentes que degradam gracefully)

- [ ] **Testes de Performance**
  - [ ] Registrar tempo de carregamento
  - [ ] Verificar memory leaks em DevTools
  - [ ] Testar com conexão lenta (throttling no DevTools)

---

## Fase 11: Deployment

- [ ] **Build para produção**
  ```bash
  npm run build
  ```

- [ ] **Verificar erros de build**
  - [ ] Sem warnings de TypeScript
  - [ ] Sem warnings de lint

- [ ] **Deploy**
  - [ ] Fazer deploy da aplicação
  - [ ] Testar em produção
  - [ ] Verificar logs

- [ ] **Monitoramento**
  - [ ] Configurar alertas para erros de gravação
  - [ ] Monitorar uso de bandwidth (uploads)

---

## Fase 12: Manutenção

- [ ] **Atualizações de Dependências**
  - [ ] Manter @radix-ui atualizado
  - [ ] Manter React/Next.js atualizado

- [ ] **Feedback do Usuário**
  - [ ] Coletar feedback sobre componentes
  - [ ] Iterar baseado em feedback

- [ ] **Bug Fixes**
  - [ ] Monitorar problemas reportados
  - [ ] Corrigir bugs rapidamente

---

## Notas Importantes

### HTTPS Necessário
- ScreenRecorder com `getDisplayMedia` requer HTTPS em produção
- Testes locais funcionam com `http://localhost`

### Permissões
- Usuários devem permitir acesso a câmera/microfone
- Não há fallback se permissão negada
- Implementar UI informativa sobre isso

### Compatibilidade
- Verificar navegadores suportados antes de cada feature
- Considerar polyfills se necessário

### Upload
- Garantir que `/api/upload` está seguro
- Validar tipos de arquivo no servidor
- Limitar tamanho de arquivo

---

## Suporte & Troubleshooting

### WebcamRecorder não aparece
- Verificar se "use client" está no topo do arquivo
- Verificar se Dialog está importado corretamente
- Ver console para erros de importação

### getDisplayMedia não funciona
- Deve estar em HTTPS (ou localhost)
- Verificar compatibilidade do navegador
- Usuário pode ter cancelado seleção

### AccessibilityChecker não detecta problemas
- Pode ser que página não tenha problemas
- Testar com página que tem problemas deliberados
- Verificar console para erros

### Review comentários não salvam
- Implementar API corretamente
- Verificar se onAddComment é chamado
- Verificar database connectivity

---

## Conclusão Checklist

- [ ] Todos os passos completados
- [ ] Nenhum erro de console
- [ ] Todos os componentes testados
- [ ] Performance aceitável
- [ ] Documentação atualizada
- [ ] Pronto para produção

---

**Status Final:** [ ] COMPLETO

**Data de Conclusão:** _______________

**Desenvolvedor:** _______________

**Notas Finais:**
```
Escreva aqui qualquer nota importante
sobre a integração
```

---

*Última atualização: 10 de Abril de 2026*
