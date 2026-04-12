'use client';

/**
 * Example component showing how to use the i18n system
 *
 * This is a reference implementation. You can delete this file
 * once you understand how to use the i18n system.
 */

import { useI18n } from '@/lib/i18n';
import { LanguageSwitcher } from './LanguageSwitcher';

export function I18nExample() {
  const { t, locale, setLocale, translations } = useI18n();

  return (
    <div className="p-8 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
        <LanguageSwitcher />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">{t('dashboard.stats.courses')}</p>
          <p className="text-2xl font-bold text-purple-600">12</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">{t('dashboard.stats.slides')}</p>
          <p className="text-2xl font-bold text-purple-600">248</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">{t('dashboard.stats.published')}</p>
          <p className="text-2xl font-bold text-purple-600">8</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">{t('dashboard.empty.title')}</h2>
        <p className="text-gray-600 mb-6">{t('dashboard.empty.subtitle')}</p>

        <div className="grid grid-cols-3 gap-4">
          <button className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-purple-300 rounded-lg hover:bg-purple-50 transition-colors">
            <span className="text-2xl mb-2">+</span>
            <span className="text-sm font-medium text-gray-700">
              {t('dashboard.empty.createFromScratch')}
            </span>
          </button>

          <button className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-purple-300 rounded-lg hover:bg-purple-50 transition-colors">
            <span className="text-2xl mb-2">📋</span>
            <span className="text-sm font-medium text-gray-700">
              {t('dashboard.empty.useTemplate')}
            </span>
          </button>

          <button className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-purple-300 rounded-lg hover:bg-purple-50 transition-colors">
            <span className="text-2xl mb-2">✨</span>
            <span className="text-sm font-medium text-gray-700">
              {t('dashboard.empty.generateAI')}
            </span>
          </button>
        </div>
      </div>

      {/* Debug Info */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm">
        <p className="font-mono text-xs text-gray-600">
          Current locale: <strong>{locale}</strong>
        </p>
        <p className="font-mono text-xs text-gray-600 mt-2">
          Using translations from: <strong>{locale}</strong>
        </p>
      </div>
    </div>
  );
}

// Example of direct translation access
export function SidebarExample() {
  const { t } = useI18n();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4">
      <nav className="space-y-2">
        <a href="#" className="block px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-700">
          {t('sidebar.myCourses')}
        </a>
        <a href="#" className="block px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-700">
          {t('sidebar.shared')}
        </a>
        <a href="#" className="block px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-700">
          {t('sidebar.templates')}
        </a>
        <a href="#" className="block px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-700">
          {t('sidebar.library')}
        </a>
        <a href="#" className="block px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-700">
          {t('sidebar.trash')}
        </a>
      </nav>
    </aside>
  );
}

// Example of using full translations object
export function EditorToolbarExample() {
  const { t, translations } = useI18n();

  return (
    <div className="flex gap-2 p-4 bg-white border-b border-gray-200">
      <button className="px-4 py-2 rounded-lg hover:bg-gray-100">
        {t('editor.home')}
      </button>
      <button className="px-4 py-2 rounded-lg hover:bg-gray-100">
        {translations.editor.insert}
      </button>
      <button className="px-4 py-2 rounded-lg hover:bg-gray-100">
        {translations.editor.design}
      </button>
      <button className="px-4 py-2 rounded-lg hover:bg-gray-100">
        {t('editor.tools')}
      </button>
    </div>
  );
}
