"use client";

import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { getLanguageName } from "@/utils/language";
import { Language } from "@/constants/dictionaries";

export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    const languages: Language[] = [
        'en', 'ko', 'ja', 'es', 'pt', 'hi', 'zh-CN', 'zh-TW', 'fr', 'de', 'it', 'ru'
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 bg-white/10 hover:bg-white/20 text-gray-700">
                    <Globe className="h-5 w-5" />
                    <span className="sr-only">Change Language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={language === lang ? "bg-accent" : ""}
                    >
                        {getLanguageName(lang)}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
