import { createClient } from "@/utils/supabase/server";
import { UtensilsCrossed } from "lucide-react";
import { Restaurant, MenuItem } from "@/types";

interface Props {
    params: Promise<{
        id: string;
    }>;
}

export default async function ViewPage({ params }: Props) {
    const supabase = await createClient();
    const { id } = await params;

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
                        메뉴를 불러올 수 없습니다
                    </h1>
                    <p className="text-gray-500">
                        존재하지 않는 식당이거나 삭제되었습니다.
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
                <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-center">
                    <h1 className="text-xl font-bold text-gray-900 truncate">
                        {restaurant.name}
                    </h1>
                </div>
            </header>

            {/* Menu List */}
            <main className="max-w-md mx-auto px-4 py-6 space-y-4">
                {menus && menus.length > 0 ? (
                    menus.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start"
                        >
                            <div className="flex-1 pr-4">
                                <h3 className="font-bold text-gray-900 text-lg mb-1">{item.name}</h3>
                                {item.description && (
                                    <p className="text-gray-500 text-sm mb-2 line-clamp-2">
                                        {item.description}
                                    </p>
                                )}
                                <div className="font-semibold text-blue-600">
                                    {item.price.toLocaleString()}원
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-500 py-10">
                        등록된 메뉴가 없습니다.
                    </div>
                )}

                <div className="text-center text-xs text-gray-400 mt-8 pb-4">
                    Powered by QR Menu Maker
                </div>
            </main>
        </div>
    );
}
