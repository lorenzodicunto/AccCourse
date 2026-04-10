'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export function LanguageSwitcher() {
  const { locale, setLocale, locales } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentLanguage = locales.find(l => l.code === locale);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (code: string) => {
    setLocale(code as any);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Language Switcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-purple-200 bg-white hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition-colors"
        aria-label="Change language"
        title={`Current language: ${currentLanguage?.label || locale}`}
      >
        <Globe size={18} className="text-purple-600" />
        <span className="text-sm font-medium">{locale}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-purple-200 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Language
            </div>
            {locales.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  locale === lang.code
                    ? 'bg-purple-100 text-purple-700 border-l-2 border-purple-600'
                    : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                }`}
              >
                <span className="mr-2">
                  {lang.code === 'pt-BR' && '🇧🇷'}
                  {lang.code === 'en' && '🇺🇸'}
                  {lang.code === 'es' && '🇪🇸'}
                  {lang.code === 'fr' && '🇫🇷'}
                </span>
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
