"use client";

import { useState, useEffect, Suspense } from "react";
import { Plus, Trash2, Save, Loader2, ArrowLeft, UtensilsCrossed, LogOut } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface TempMenuItem {
    id: string;
    name: string;
    price: number;
    description: string;
    order_index?: number;
}

function AdminPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const idParam = searchParams.get("id");
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [user, setUser] = useState<any>(null);

    const { t } = useLanguage();

    // Restaurant State
    const [restaurantId, setRestaurantId] = useState<string | null>(null);
    const [restaurantName, setRestaurantName] = useState("");
    const [currency, setCurrency] = useState("KRW");
    const [menuItems, setMenuItems] = useState<TempMenuItem[]>([]);

    // Form state for new item
    const [newItemName, setNewItemName] = useState("");
    const [newItemPrice, setNewItemPrice] = useState("");
    const [newItemDescription, setNewItemDescription] = useState("");

    useEffect(() => {
        const checkUserAndFetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert("로그인이 필요합니다.");
                router.push("/login");
                return;
            }
            setUser(user);

            let query = supabase
                .from("restaurants")
                .select("*, menus(*)");

            if (idParam) {
                query = query.eq("id", idParam);
            } else {
                query = query.eq("user_id", user.id);
            }

            const { data: restaurants } = await query;
            const restaurant = restaurants && restaurants[0];

            if (restaurant) {
                setRestaurantId(restaurant.id);
                setRestaurantName(restaurant.name);
                setCurrency(restaurant.currency || "KRW");
                if (restaurant.menus) {
                    setMenuItems(restaurant.menus.map((m: any) => ({
                        id: m.id,
                        name: m.name,
                        price: m.price,
                        description: m.description || "",
                        order_index: m.order_index || 0
                    })).sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0)));
                }
            }
        };
        checkUserAndFetchData();
    }, [router, supabase, idParam]);

    const addMenuItem = () => {
        if (!newItemName || !newItemPrice) return;

        const newItem: TempMenuItem = {
            id: Math.random().toString(36).substr(2, 9),
            name: newItemName,
            price: Number(newItemPrice),
            description: newItemDescription,
        };

        setMenuItems([...menuItems, newItem]);
        setNewItemName("");
        setNewItemPrice("");
        setNewItemDescription("");
    };

    const deleteMenuItem = (id: string) => {
        setMenuItems(menuItems.filter((item) => item.id !== id));
    };

    const handleSave = async () => {
        if (!restaurantName) return alert(t.admin.alertName);
        if (menuItems.length === 0) return alert(t.admin.alertMenu);
        if (!user) return alert(t.admin.alertLogin);

        setIsSaving(true);
        try {
            let currentRestaurantId = restaurantId;

            if (currentRestaurantId) {
                const { error } = await supabase
                    .from("restaurants")
                    .update({ name: restaurantName, currency })
                    .eq("id", currentRestaurantId);
                if (error) throw error;
            } else {
                const { data: newRestaurant, error } = await supabase
                    .from("restaurants")
                    .insert({ name: restaurantName, user_id: user.id, currency })
                    .select()
                    .single();
                if (error) throw error;
                currentRestaurantId = newRestaurant.id;
            }

            if (currentRestaurantId) {
                await supabase.from("menus").delete().eq("restaurant_id", currentRestaurantId);
                const menusToInsert = menuItems.map((item, index) => ({
                    restaurant_id: currentRestaurantId,
                    name: item.name,
                    price: item.price,
                    description: item.description,
                    order_index: index
                }));
                const { error: mError } = await supabase.from("menus").insert(menusToInsert);
                if (mError) throw mError;
            }

            alert(t.admin.alertSaved);
            router.push(`/dashboard`);
        } catch (error) {
            console.error("Error saving:", error);
            alert(t.admin.alertError);
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    if (!user) return null;

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <UtensilsCrossed className="w-8 h-8 text-blue-400" />
                        {t.admin.createTitle}
                    </h1>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleLogout}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <LogOut className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Restaurant Name Section */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            {t.admin.restaurantName}
                        </label>
                        <input
                            type="text"
                            value={restaurantName}
                            onChange={(e) => setRestaurantName(e.target.value)}
                            placeholder={t.admin.restaurantNamePlaceholder}
                            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column: Menu Editor */}
                    <div className="space-y-6">
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl">
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
                                <Plus className="w-5 h-5 text-blue-400" /> {t.admin.addMenu}
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        {t.admin.menuName}
                                    </label>
                                    <input
                                        type="text"
                                        value={newItemName}
                                        onChange={(e) => setNewItemName(e.target.value)}
                                        placeholder={t.admin.menuNamePlaceholder}
                                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        {t.admin.price}
                                    </label>
                                    <input
                                        type="number"
                                        value={newItemPrice}
                                        onChange={(e) => setNewItemPrice(e.target.value)}
                                        placeholder={t.admin.pricePlaceholder}
                                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        {t.admin.description}
                                    </label>
                                    <textarea
                                        value={newItemDescription}
                                        onChange={(e) => setNewItemDescription(e.target.value)}
                                        placeholder={t.admin.descriptionPlaceholder}
                                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                                    />
                                </div>
                                <button
                                    onClick={addMenuItem}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    {t.admin.addButton}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Preview List */}
                    <div className="space-y-6">
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl min-h-[500px] flex flex-col">
                            <h2 className="text-xl font-semibold mb-6 text-white border-b border-white/10 pb-4">
                                {restaurantName || t.admin.preview}
                            </h2>

                            <div className="flex-1 space-y-4 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                                {menuItems.length === 0 ? (
                                    <div className="text-center text-gray-500 py-20 flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                                            <UtensilsCrossed className="w-8 h-8 opacity-50" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-medium text-gray-400">{t.admin.noMenu}</p>
                                            <p className="text-sm">{t.admin.noMenuSub}</p>
                                        </div>
                                    </div>
                                ) : (
                                    menuItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className="bg-black/20 p-4 rounded-xl border border-white/5 flex justify-between items-start gap-4 group hover:bg-black/30 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <div className="font-bold text-white text-lg mb-1">
                                                    {item.name}
                                                </div>
                                                {item.description && (
                                                    <p className="text-gray-400 text-sm leading-relaxed mb-2">
                                                        {item.description}
                                                    </p>
                                                )}
                                                <div className="font-semibold text-blue-400">
                                                    {item.price.toLocaleString()}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => deleteMenuItem(item.id)}
                                                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                title={t.admin.deleteMenu}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl text-lg font-bold shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {t.admin.saving}
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    {restaurantId ? t.admin.saveUpdate : t.admin.save}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            </div>
        }>
            <AdminPageContent />
        </Suspense>
    );
}
