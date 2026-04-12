# AccCourse i18n Integration Checklist

## Setup Status: COMPLETE

All infrastructure is in place and ready to use. Follow this checklist to integrate i18n throughout your application.

---

## Phase 1: Core Integration (Already Done)

- [x] Created `/src/lib/i18n.ts` with React Context
- [x] Created `/src/components/LanguageSwitcher.tsx`
- [x] Updated `/src/app/layout.tsx` with I18nProvider
- [x] Added 4 language support (PT-BR, EN, ES, FR)
- [x] Implemented localStorage persistence
- [x] Included ~45 translation keys

---

## Phase 2: Component Integration (To Do)

### Dashboard Components
- [ ] `/src/components/dashboard/DashboardHeader.tsx`
  - Import and use `<LanguageSwitcher />`
  - Replace `"Meus Cursos"` with `t('dashboard.title')`
  - Replace `"Novo Curso"` with `t('dashboard.create')`
  - Replace `"Buscar cursos..."` with `t('dashboard.search')`

- [ ] `/src/components/dashboard/EmptyState.tsx`
  - Use `t('dashboard.empty.title')`
  - Use `t('dashboard.empty.subtitle')`
  - Use `t('dashboard.empty.createFromScratch')`
  - Use `t('dashboard.empty.useTemplate')`
  - Use `t('dashboard.empty.generateAI')`

- [ ] `/src/components/dashboard/StatsCard.tsx`
  - Use `t('dashboard.stats.courses')`
  - Use `t('dashboard.stats.slides')`
  - Use `t('dashboard.stats.published')`

### Editor Components
- [ ] `/src/components/editor/EditorToolbar.tsx`
  - Use `t('editor.save')`
  - Use `t('editor.export')`
  - Use `t('editor.undo')` / `t('editor.redo')`
  - Use toolbar strings from `translations.toolbar`

- [ ] `/src/components/editor/BlockPalette.tsx`
  - Use block names from `translations.blocks`
  - Iterate over blocks with i18n

- [ ] `/src/components/editor/PropertiesPanel.tsx`
  - Use property names from `translations.properties`

### Sidebar Components
- [ ] `/src/components/dashboard/Sidebar.tsx`
  - Use `t('sidebar.myCourses')`
  - Use `t('sidebar.shared')`
  - Use `t('sidebar.templates')`
  - Use `t('sidebar.library')`
  - Use `t('sidebar.trash')`

### Common Components
- [ ] Modal/Dialog confirmation buttons
  - Use `t('common.confirm')`
  - Use `t('common.cancel')`
  - Use `t('common.delete')`

- [ ] Footer
  - Use `t('footer.copyright')`

---

## Phase 3: Editor-Specific Integration (To Do)

### Save & Export
- [ ] Save button
  - Normal state: `t('editor.save')`
  - Loading state: `t('editor.saving')`

- [ ] Export dialog
  - Title: `t('export.scormTitle')` / `t('export.pdfTitle')`
  - Success: `t('export.downloadStarted')`
  - Error: `t('export.error')`

### Slide Operations
- [ ] Empty slide message
  - Title: `t('editor.emptySlide')`
  - Hint: `t('editor.emptySlideHint')`

- [ ] Add/Duplicate/Delete slide buttons
  - Use `t('editor.addSlide')`
  - Use `t('editor.duplicateSlide')`
  - Use `t('editor.deleteSlide')`

### Sharing
- [ ] Share button
  - Button text: `t('editor.share')`
  - Copy confirmation: `t('editor.linkCopied')`

---

## Phase 4: AI Features Integration (To Do)

- [ ] AI Quiz Generator
  - Button label: `t('ai.quizGen')`
  - Placeholder: `t('ai.pasteContent')`
  - Label: `t('ai.numQuestions')`
  - Button: `t('ai.generate')`

- [ ] AI Course Generator
  - Button label: `t('ai.courseGen')`
  - During generation: `t('ai.generating')`

- [ ] Insert all button
  - Use `t('ai.insertAll')`

---

## Phase 5: Analytics Integration (To Do)

- [ ] Analytics Dashboard
  - Title: `t('analytics.title')`
  - Use all analytics stat keys from `translations.analytics`

---

## Implementation Template

Use this template for each component:

```tsx
'use client';

import { useI18n } from '@/lib/i18n';

export function MyComponent() {
  const { t } = useI18n();
  
  return (
    <div>
      <h1>{t('section.key')}</h1>
      <button>{t('common.confirm')}</button>
    </div>
  );
}
```

---

## Testing Checklist

For each feature you integrate:

- [ ] Component renders without errors
- [ ] All hardcoded strings are replaced with `t()` calls
- [ ] Language switcher changes text immediately
- [ ] localStorage saves language preference
- [ ] Page refresh preserves language selection
- [ ] No console errors or warnings
- [ ] Test in all 4 languages (PT-BR, EN, ES, FR)

---

## Quick Reference: Translation Key Categories

| Category | Prefix | Usage |
|----------|--------|-------|
| Dashboard | `dashboard.*` | Header, empty states, stats |
| Sidebar | `sidebar.*` | Navigation menu |
| Editor | `editor.*` | Editor-specific actions |
| Toolbar | `toolbar.*` | Ribbon/menu items |
| Blocks | `blocks.*` | Content block type names |
| Properties | `properties.*` | Property panel labels |
| AI | `ai.*` | AI generation features |
| Export | `export.*` | Export dialogs |
| Analytics | `analytics.*` | Analytics dashboard |
| Common | `common.*` | Universal buttons (Delete, Edit, etc.) |
| Footer | `footer.*` | Footer content |

---

## Adding New Keys During Development

As you integrate, you may need new translation keys. Follow this process:

1. Add the key to `I18nStrings` interface in `/src/lib/i18n.ts`
2. Add translations to all 4 language objects (ptBR, en, es, fr)
3. Use `t('section.key')` in your component
4. Test in all languages

Example:
```typescript
// In interface
pagination: {
  previous: string;
  next: string;
};

// In ptBR
pagination: {
  previous: "Anterior",
  next: "Próximo",
},

// In en
pagination: {
  previous: "Previous",
  next: "Next",
},

// ... and so on for es and fr
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `useI18n is not defined` | Ensure component has `'use client'` at top |
| `useI18n must be used within I18nProvider` | Check that app is wrapped with I18nProvider in layout.tsx |
| Language doesn't persist | Check localStorage is enabled in browser |
| `t('key')` returns the key itself | Check the translation key path is correct |
| Type errors | Ensure TypeScript recognizes I18nStrings interface |

---

## Performance Notes

- Translations are bundled at build time (zero runtime loading)
- Changing language is instant (no API calls)
- Context updates are optimized (only affected components re-render)
- localStorage reads happen once on mount
- No external i18n libraries required

---

## Next: Reference Implementation

Check `/src/components/i18n-example.tsx` for complete working examples of:
- Dashboard with language switcher
- Sidebar navigation
- Editor toolbar
- Usage patterns

You can delete this file once you understand the patterns.

---

## Completion

Once all checkboxes are marked:
1. AccCourse will be fully internationalized
2. All UI strings will be translatable
3. Users can switch languages in real-time
4. Language preferences are persisted across sessions
5. New translations can be added easily

---

**Last Updated:** 2026-04-10
**Status:** All infrastructure ready - Implementation in progress
