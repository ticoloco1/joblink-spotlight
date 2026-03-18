import React, { createContext, useContext, useState, useCallback } from 'react';
import { Language, translations } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  // Durante SSR/prerender (next build), `window`, `localStorage` e `navigator` não existem.
  // Carregamos o idioma apenas no client.
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('jobinlink-lang');
    if (saved && ['en', 'pt', 'es', 'fr'].includes(saved)) {
      setLanguage(saved as Language);
      return;
    }
    const browserLang = window.navigator.language.slice(0, 2);
    if (browserLang === 'pt') return setLanguage('pt');
    if (browserLang === 'es') return setLanguage('es');
    if (browserLang === 'fr') return setLanguage('fr');
    return setLanguage('en');
  }, []);

  const handleSetLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('jobinlink-lang', lang);
    document.documentElement.lang = lang;
  }, []);

  const t = useCallback((key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
