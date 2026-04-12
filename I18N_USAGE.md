# AccCourse i18n System

A lightweight, client-side internationalization system for AccCourse supporting Portuguese (PT-BR), English, Spanish, and French.

## Files Created/Modified

### 1. `/src/lib/i18n.ts` - Enhanced with React Context
- **Exports:**
  - `I18nProvider` - React context provider for wrapping the app
  - `useI18n()` - Hook returning `{ locale, setLocale, t, translations, locales }`
  - `AVAILABLE_LOCALES` - Array of locale objects with code and label
  - Translation objects for all 4 languages
  - Legacy API functions for backward compatibility

- **Features:**
  - Supports 4 languages: PT-BR (default), EN, ES, FR
  - Persists locale choice to localStorage
  - Nested translation key lookup (e.g., `t('dashboard.title')`)
  - Type-safe with TypeScript interface `I18nStrings`
  - Hydration-safe SSR support

### 2. `/src/components/LanguageSwitcher.tsx` - New
- Compact dropdown button with Globe icon
- Shows current language code (e.g., "pt-BR")
- Light mode styling with purple accent
- Automatically closes when clicking outside
- Displays flag emoji for each language

### 3. `/src/app/layout.tsx` - Updated
- Wrapped app with `I18nProvider` to enable i18n context globally
- Placed before `AuthProvider` to ensure context is available

## Usage Examples

### Basic Usage with Hook

```tsx
'use client';

import { useI18n } from '@/lib/i18n';

export function MyComponent() {
  const { t, locale, setLocale } = useI18n();

  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>Current language: {locale}</p>
      <button onClick={() => setLocale('en')}>Switch to English</button>
    </div>
  );
}
```

### Adding Language Switcher

```tsx
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function Header() {
  return (
    <header>
      <h1>AccCourse</h1>
      <LanguageSwitcher />
    </header>
  );
}
```

### Direct Translation Lookups

```tsx
const { t } = useI18n();

// Nested access works with dot notation
const courseTitle = t('dashboard.title');
const deleteButtonText = t('common.delete');
const emptyMessage = t('dashboard.empty.title');
```

## Translation Keys Structure

The system organizes translations into logical sections:

- `dashboard.*` - Dashboard UI strings
- `sidebar.*` - Sidebar navigation
- `editor.*` - Editor-specific strings
- `toolbar.*` - Toolbar menu items
- `blocks.*` - Content block types
- `properties.*` - Property panel strings
- `ai.*` - AI generation features
- `export.*` - Export functionality
- `analytics.*` - Analytics dashboard
- `common.*` - Common UI actions
- `footer.*` - Footer content

## Adding New Translations

1. Update the `I18nStrings` interface in `/src/lib/i18n.ts`
2. Add translations to all 4 language objects (ptBR, en, es, fr)
3. Access via `t('section.key')`

Example:

```typescript
// In I18nStrings interface
notifications: {
  saved: string;
  deleted: string;
};

// In each language object
notifications: {
  saved: "Salvo com sucesso!",
  deleted: "Item excluído.",
},
```

## Supported Languages

| Code | Language | Flag |
|------|----------|------|
| pt-BR | Português (Brasil) | 🇧🇷 |
| en | English | 🇺🇸 |
| es | Español | 🇪🇸 |
| fr | Français | 🇫🇷 |

## LocalStorage Persistence

The selected language is automatically saved to `localStorage` with key `'i18n-locale'`. When the user returns to the app, their language preference is restored.

## SSR & Hydration Safety

The `I18nProvider` has built-in hydration guards:
- Uses `useEffect` to sync with localStorage only on client
- Returns `<>{children}</>` until mounted to prevent hydration mismatch
- Safe for use with Next.js 16 App Router

## Backward Compatibility

Legacy functions are still available for non-context code:

```typescript
import { getLocale, setLocale, t, getAvailableLocales } from '@/lib/i18n';

setLocale('en');
const locale = getLocale();
const strings = t();
const available = getAvailableLocales();
```

## Performance Notes

- All translations are bundled at build time (no dynamic loading)
- Zero network requests for language switching
- Context updates trigger minimal re-renders
- ~45 translation keys per language (about 40-50 total UI strings covered)
