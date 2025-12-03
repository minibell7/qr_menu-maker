import { createClient } from "@/utils/supabase/server";
import { UtensilsCrossed } from "lucide-react";
import { Restaurant, MenuItem } from "@/types";
import { headers } from "next/headers";
import { dictionary } from "@/constants/dictionaries";
import { getLanguageFromCode } from "@/utils/language";
import { MenuView } from "@/components/menu-view/MenuView";

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

    // Group menus by category
    const flatMenus = (restaurant.menus as MenuItem[]).sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0));

    const grouped: Record<string, MenuItem[]> = {};
    flatMenus.forEach(item => {
        const cat = item.category || "Uncategorized";
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(item);
    });

    // Convert to array format expected by MenuView
    // We might want to sort categories if we had an order, but for now alphabetical or insertion order
    // If we want to preserve the order from the builder, we need to save category order in DB.
    // For now, let's just use Object.entries which is roughly insertion order for string keys (except numbers).
    const categories = Object.entries(grouped).map(([name, items]) => ({
        id: name,
        name,
        items
    }));

    // If no categories, create a default one
    if (categories.length === 0 && flatMenus.length > 0) {
        categories.push({ id: "default", name: "Menu", items: flatMenus });
    }

    return <MenuView restaurant={restaurant} categories={categories} />;
}

