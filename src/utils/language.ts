import { Language } from "@/constants/dictionaries";

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
