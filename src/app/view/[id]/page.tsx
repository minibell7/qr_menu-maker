import { createClient } from "@/utils/supabase/server";
import { UtensilsCrossed } from "lucide-react";
import { Restaurant, MenuItem } from "@/types";
import { headers } from "next/headers";
import { dictionary } from "@/constants/dictionaries";
import { getLanguageFromCode } from "@/utils/language";

interface Props {
    params: Promise<{
        id: string;
    }>;
}

export default async function ViewPage({ params }: Props) {
    const supabase = await createClient();
    const { id } = await params;

    // Robust server-side language detection
    const headersList = await headers();
    const acceptLanguage = headersList.get('accept-language') || 'en';
    const lang = getLanguageFromCode(acceptLanguage);
    const t = dictionary[lang];

    // Fetch restaurant and menus
    const { data: restaurant, error } = await supabase
        .from("restaurants")
        .select("*, menus(*)")
        .eq("id", id)
        .single();

    if (error || !restaurant) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-gray-50">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UtensilsCrossed className="w-8 h-8" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">
                        {t.view.errorTitle}
                    </h1>
                    <p className="text-gray-500">
                        {t.view.errorDesc}
                    </p>
                </div>
            </div>
        );
    }

    const menus = (restaurant.menus as MenuItem[]).sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0));

    return (
        <div className="min-h-screen pb-10">
            {/* Header */}
            <header className="bg-white/10 backdrop-blur-md border-b border-white/10 sticky top-0 z-10 shadow-lg">
                <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-center">
                    <h1 className="font-bold text-lg text-white truncate">
                        {restaurant.name}
                    </h1>
                </div>
            </header>

            {/* Menu List */}
            <main className="max-w-md mx-auto px-4 py-6">
                {menus.length > 0 ? (
                    <div className="space-y-4">
                        {menus.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-white/10 flex justify-between items-start gap-4"
                            >
                                <div className="flex-1">
                                    <div className="font-bold text-white text-lg mb-1">
                                        {item.name}
                                    </div>
                                    {item.description && (
                                        <p className="text-gray-300 text-sm leading-relaxed mb-2">
                                            {item.description}
                                        </p>
                                    )}
                                    <div className="font-bold text-blue-300 text-lg">
                                        {item.price.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-400 py-10">
                        {t.view.noMenu}
                    </div>
                )}

                <div className="text-center mt-12 pb-8">
                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-300 hover:text-blue-200 transition-colors border-b border-blue-300/50 hover:border-blue-200 pb-0.5"
                    >
                        {t.view.createOwn}
                    </a>
                </div>
            </main>
        </div>
    );
}
