import { Language } from "@/constants/dictionaries";

export const getLanguageName = (lang: Language) => {
    switch (lang) {
        case 'ko': return '한국어';
        case 'en': return 'English';
        case 'ja': return '日本語';
        case 'es': return 'Español';
        case 'pt': return 'Português';
        case 'hi': return 'हिन्दी';
        default: return 'English';
    }
};
