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
        setLanguage(prev => prev === 'ko' ? 'en' : 'ko');
    };

    return {
        language,
        setLanguage,
        toggleLanguage,
        t: dictionary[language]
    };
}
