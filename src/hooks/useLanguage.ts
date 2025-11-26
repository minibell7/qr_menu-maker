"use client";

import { useState, useEffect } from 'react';
import { dictionary, Language } from '@/constants/dictionaries';

import { getLanguageFromCode } from '@/utils/language';

export function useLanguage() {
    const [language, setLanguage] = useState<Language>('ko');

    useEffect(() => {
        // Robust browser language detection
        const detected = getLanguageFromCode(navigator.language);
        setLanguage(detected);
    }, []);

    const toggleLanguage = () => {
        setLanguage(prev => {
            const languages: Language[] = ['ko', 'en', 'ja', 'es', 'pt', 'hi', 'zh-CN', 'zh-TW', 'fr', 'de', 'it', 'ru'];
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
