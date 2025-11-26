"use client";

import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";
import { Globe } from "lucide-react";
import { getLanguageName } from "@/utils/language";

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
      }
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      alert("로그인 중 오류가 발생했습니다.");
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-gray-50 relative">

      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex flex-col gap-8">
        <h1 className="text-4xl font-bold text-center text-gray-900">
          {t.landing.title}
        </h1>
        <p className="text-xl text-center text-gray-600">
          {t.landing.subtitle}
        </p>

        <button
          onClick={handleStart}
          disabled={isLoading}
          className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center gap-2"
        >
          {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
          {t.landing.cta}
        </button>
      </div>
    </main>
  );
}
