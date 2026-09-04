import React, { useEffect, useState } from 'react';
import { Language } from '../types';

export const GoogleTranslate: React.FC<{ currentLang: Language }> = ({ currentLang }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Prevent loading multiple times
    if (document.getElementById('google-translate-script')) return;

    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,hi,bn',
        autoDisplay: false
      }, 'google_translate_element');
      
      // Delay setting loaded slightly to allow widget to render its select element
      setTimeout(() => setIsLoaded(true), 1500);
    };
  }, []);

  useEffect(() => {
    // When currentLang changes, apply it to the hidden Google Translate widget
    if (isLoaded) {
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (select) {
        // Only trigger if we actually need to change it
        if (select.value !== currentLang && !(select.value === '' && currentLang === 'en')) {
          select.value = currentLang;
          select.dispatchEvent(new Event('change'));
        }
      }
    }
  }, [currentLang, isLoaded]);

  return (
    <div id="google_translate_element" style={{ display: 'none' }} className="notranslate" aria-hidden="true"></div>
  );
};

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}
