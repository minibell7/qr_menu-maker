import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";
import { Globe } from "lucide-react";

export default function Home() {
  const { t, language, toggleLanguage } = useLanguage();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-gray-50 relative">
      <button
        onClick={toggleLanguage}
        className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
      >
        <Globe className="w-4 h-4" />
        {language === 'ko' ? 'English' : '한국어'}
      </button>
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex flex-col gap-8">
        <h1 className="text-4xl font-bold text-center text-gray-900">
          {t.landing.title}
        </h1>
        <p className="text-xl text-center text-gray-600">
          {t.landing.subtitle}
        </p>

        <Link
          href="/dashboard"
          className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          {t.landing.cta}
        </Link>
      </div>
    </main>
  );
}
