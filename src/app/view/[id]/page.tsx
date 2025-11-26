import { createClient } from "@/utils/supabase/server";
import { UtensilsCrossed } from "lucide-react";
import { Restaurant, MenuItem } from "@/types";
import { headers } from "next/headers";
import { dictionary } from "@/constants/dictionaries";

interface Props {
    params: Promise<{
        id: string;
    }>;
}

export default async function ViewPage({ params }: Props) {
    const supabase = await createClient();
    const { id } = await params;

    // Simple server-side language detection
    const headersList = await headers();
    const acceptLanguage = headersList.get('accept-language');
    const lang = acceptLanguage?.startsWith('en') ? 'en' : 'ko';
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
        <div className="min-h-screen bg-gray-50 pb-10">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-center">
                    <h1 className="font-bold text-lg text-gray-900 truncate">
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
                                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start gap-4"
                            >
                                <div className="flex-1">
                                    <div className="font-bold text-gray-900 text-lg mb-1">
                                        {item.name}
                                    </div>
                                    {item.description && (
                                        <p className="text-gray-500 text-sm leading-relaxed mb-2">
                                            {item.description}
                                        </p>
                                    )}
                                    <div className="font-semibold text-blue-600">
                                        {item.price.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-10">
                        {t.view.noMenu}
                    </div>
                )}

                <div className="text-center mt-8 pb-8">
                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 border-b border-blue-600 pb-0.5"
                    >
                        {t.view.createOwn}
                    </a>
                </div>
            </main>
        </div>
    );
}
