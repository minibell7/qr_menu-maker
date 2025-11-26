import { Language } from "@/constants/dictionaries";

export const SUPPORTED_LANGUAGES: Language[] = ['ko', 'en', 'ja', 'es', 'pt', 'hi', 'zh-CN', 'zh-TW', 'fr', 'de', 'it', 'ru'];

export const getLanguageFromCode = (code: string): Language => {
    const lang = code.split('-')[0];

    // Handle specific cases
    if (code.toLowerCase().includes('zh-tw') || code.toLowerCase().includes('zh-hk')) return 'zh-TW';
    if (code.toLowerCase().includes('zh')) return 'zh-CN';

    // Check for exact match or prefix match
    const found = SUPPORTED_LANGUAGES.find(l => l === lang || l === code);
    if (found) return found;

    return 'en'; // Default fallback
};

export const getLanguageName = (lang: Language) => {
    switch (lang) {
        case 'ko': return '한국어';
        case 'en': return 'English';
        case 'ja': return '日本語';
        case 'es': return 'Español';
        case 'pt': return 'Português';
        case 'hi': return 'हिन्दी';
        case 'zh-CN': return '简体中文';
        case 'zh-TW': return '繁體中文';
        case 'fr': return 'Français';
        case 'de': return 'Deutsch';
        case 'it': return 'Italiano';
        case 'ru': return 'Русский';
        default: return 'English';
    }
};
