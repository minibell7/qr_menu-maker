"use client";

import { useState, useEffect } from 'react';
import { dictionary, Language } from '@/constants/dictionaries';

export function useLanguage() {
    const [language, setLanguage] = useState<Language>('ko');

    useEffect(() => {
        // Simple browser language detection
        const browserLang = navigator.language.split('-')[0];
        if (browserLang === 'en') {
            setLanguage('en');
        }
    }, []);

    const toggleLanguage = () => {
        setLanguage(prev => {
            const languages: Language[] = ['ko', 'en', 'ja', 'es', 'pt', 'hi', 'zh-CN', 'zh-TW', 'fr'];
            const currentIndex = languages.indexOf(prev);
            const nextIndex = (currentIndex + 1) % languages.length;
            return languages[nextIndex];
        });
    };

    return {
        language,
        setLanguage,
        toggleLanguage,
        t: dictionary[language]
    };
}
