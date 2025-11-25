"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Save, Loader2, ArrowLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface TempMenuItem {
    id: string;
    name: string;
    price: number;
    description: string;
}

export default function AdminPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);

    // Restaurant State
    const [restaurantId, setRestaurantId] = useState<string | null>(null);
    const [restaurantName, setRestaurantName] = useState("");
    const [menuItems, setMenuItems] = useState<TempMenuItem[]>([]);

    // Form state for new item
    const [newItemName, setNewItemName] = useState("");
    const [newItemPrice, setNewItemPrice] = useState("");
    const [newItemDesc, setNewItemDesc] = useState("");

    useEffect(() => {
        const checkUserAndFetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert("로그인이 필요합니다.");
                router.push("/login");
                return;
            }
            setUser(user);

            // Fetch existing restaurant
            const { data: restaurant } = await supabase
                .from("restaurants")
                .select("*, menus(*)")
                .eq("user_id", user.id)
                .single();

            if (restaurant) {
                setRestaurantId(restaurant.id);
                setRestaurantName(restaurant.name);
                if (restaurant.menus) {
                    setMenuItems(restaurant.menus.map((m: any) => ({
                        id: m.id, // Keep original ID if possible, or we can just treat them as new for simplicity in update
                        name: m.name,
                        price: m.price,
                        description: m.description || ""
                    })));
                }
            }
        };
        checkUserAndFetchData();
    }, [router, supabase]);

    const addMenuItem = () => {
        if (!newItemName || !newItemPrice) return;

        const newItem: TempMenuItem = {
            id: Math.random().toString(36).substr(2, 9),
            name: newItemName,
            price: Number(newItemPrice),
            description: newItemDesc,
        };

        setMenuItems([...menuItems, newItem]);

        // Reset form
        setNewItemName("");
        setNewItemPrice("");
        setNewItemDesc("");
    };

    const removeMenuItem = (id: string) => {
        setMenuItems(menuItems.filter((item) => item.id !== id));
    };

    const saveRestaurant = async () => {
        if (!restaurantName) return alert("식당 이름을 입력해주세요.");
        if (menuItems.length === 0) return alert("최소 1개의 메뉴를 추가해주세요.");
        if (!user) return alert("로그인이 필요합니다.");

        setLoading(true);
        try {
            let currentRestaurantId = restaurantId;

            // 1. Create or Update Restaurant
            if (currentRestaurantId) {
                const { error } = await supabase
                    .from("restaurants")
                    .update({ name: restaurantName })
                    .eq("id", currentRestaurantId);
                if (error) throw error;
            } else {
                const { data: newRestaurant, error } = await supabase
                    .from("restaurants")
                    .insert({
                        name: restaurantName,
                        user_id: user.id,
                    })
                    .select()
                    .single();
                if (error) throw error;
                currentRestaurantId = newRestaurant.id;
            }

            // 2. Update Menus (Strategy: Delete all and re-insert for simplicity)
            // In a production app with large data, we would diff changes.
            if (currentRestaurantId) {
                // Delete existing menus
                await supabase.from("menus").delete().eq("restaurant_id", currentRestaurantId);

                // Insert new menus
                const menusToInsert = menuItems.map(item => ({
                    restaurant_id: currentRestaurantId,
                    name: item.name,
                    price: item.price,
                    description: item.description,
                }));

                const { error: mError } = await supabase
                    .from("menus")
                    .insert(menusToInsert);

                if (mError) throw mError;
            }

            alert("저장되었습니다!");
            router.push(`/dashboard`);
        } catch (error) {
            console.error("Error saving:", error);
            alert("저장 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const deleteRestaurant = async () => {
        if (!restaurantId) return;
        if (!confirm("정말로 메뉴판을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;

        setLoading(true);
        try {
            // Delete menus first (if cascade not set, but usually good practice to be explicit or rely on cascade)
            // Assuming cascade delete is set on DB or we delete manually.
            // Let's try deleting restaurant directly, usually cascade works if configured.
            // If not, we delete menus first.
            await supabase.from("menus").delete().eq("restaurant_id", restaurantId);

            const { error } = await supabase
                .from("restaurants")
                .delete()
                .eq("id", restaurantId);

            if (error) throw error;

            alert("삭제되었습니다.");
            router.push("/dashboard");
        } catch (error) {
            console.error("Error deleting:", error);
            alert("삭제 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {restaurantId ? "메뉴판 수정하기" : "새 메뉴판 만들기"}
                        </h1>
                    </div>
                    {restaurantId && (
                        <button
                            onClick={deleteRestaurant}
                            disabled={loading}
                            className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            <Trash2 className="w-5 h-5" />
                            메뉴판 삭제
                        </button>
                    )}
                </div>

                {/* Restaurant Name Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        식당 이름
                    </label>
                    <input
                        type="text"
                        value={restaurantName}
                        onChange={(e) => setRestaurantName(e.target.value)}
                        placeholder="예: 맛있는 김밥천국"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left Column: Menu Editor */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Plus className="w-5 h-5" /> 메뉴 추가하기
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        메뉴 이름
                                    </label>
                                    <input
                                        type="text"
                                        value={newItemName}
                                        onChange={(e) => setNewItemName(e.target.value)}
                                        placeholder="예: 원조 김밥"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        가격 (원)
                                    </label>
                                    <input
                                        type="number"
                                        value={newItemPrice}
                                        onChange={(e) => setNewItemPrice(e.target.value)}
                                        placeholder="3500"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        설명 (선택사항)
                                    </label>
                                    <textarea
                                        value={newItemDesc}
                                        onChange={(e) => setNewItemDesc(e.target.value)}
                                        placeholder="신선한 야채가 듬뿍 들어간 대표 메뉴"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none h-20"
                                    />
                                </div>

                                <button
                                    onClick={addMenuItem}
                                    disabled={!newItemName || !newItemPrice}
                                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    메뉴 추가
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Preview List */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 min-h-[500px]">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                                {restaurantName || "식당 이름 미리보기"}
                            </h2>

                            {menuItems.length === 0 ? (
                                <div className="text-center text-gray-400 py-10">
                                    등록된 메뉴가 없습니다.
                                    <br />
                                    왼쪽에서 메뉴를 추가해주세요.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {menuItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex justify-between items-start p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors"
                                        >
                                            <div>
                                                <div className="font-bold text-gray-900">{item.name}</div>
                                                {item.description && (
                                                    <div className="text-sm text-gray-500 mt-1">{item.description}</div>
                                                )}
                                                <div className="text-blue-600 font-semibold mt-1">
                                                    {item.price.toLocaleString()}원
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeMenuItem(item.id)}
                                                className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-all"
                                                aria-label="Delete menu item"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={saveRestaurant}
                            disabled={loading}
                            className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 transition-transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <Save className="w-6 h-6" />
                            )}
                            {restaurantId ? "수정사항 저장하기" : "저장하기"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
