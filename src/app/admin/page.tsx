"use client";

import { useState, useEffect, Suspense } from "react";
import { Plus, Trash2, Save, Loader2, ArrowLeft, ArrowUp, ArrowDown, Globe } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { getLanguageName } from "@/utils/language";
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
    const [user, setUser] = useState<any>(null);

    const { t, language, toggleLanguage } = useLanguage();

    // Restaurant State
    const [restaurantId, setRestaurantId] = useState<string | null>(null);
    const [restaurantName, setRestaurantName] = useState("");
    const [currency, setCurrency] = useState("KRW");
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

            // Fetch logic:
            // 1. If ID param exists, fetch that specific restaurant.
            // 2. If NO ID param, check if user ALREADY has a restaurant.
            //    If yes, load it (enforce single menu).
            //    If no, stay in create mode.

            let query = supabase
                .from("restaurants")
                .select("*, menus(*)");

            if (idParam) {
                query = query.eq("id", idParam);
            } else {
                // Enforce single menu: check if ANY restaurant exists for this user
                query = query.eq("user_id", user.id);
            }

            const { data: restaurants, error } = await query;

            // If we found a restaurant (either by ID or just by user_id)
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

    const moveItem = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === menuItems.length - 1) return;

        const newItems = [...menuItems];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
        setMenuItems(newItems);
    };

    const saveRestaurant = async () => {
        if (!restaurantName) return alert(t.admin.alertName);
        if (menuItems.length === 0) return alert(t.admin.alertMenu);
        if (!user) return alert(t.admin.alertLogin);

        setLoading(true);
        try {
            let currentRestaurantId = restaurantId;

            // 1. Create or Update Restaurant
            if (currentRestaurantId) {
                const { error } = await supabase
                    .from("restaurants")
                    .update({
                        name: restaurantName,
                        currency: currency
                    })
                    .eq("id", currentRestaurantId);
                if (error) throw error;
            } else {
                const { data: newRestaurant, error } = await supabase
                    .from("restaurants")
                    .insert({
                        name: restaurantName,
                        user_id: user.id,
                        currency: currency
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
                const menusToInsert = menuItems.map((item, index) => ({
                    restaurant_id: currentRestaurantId,
                    name: item.name,
                    price: item.price,
                    description: item.description,
                    order_index: index
                }));

                const { error: mError } = await supabase
                    .from("menus")
                    .insert(menusToInsert);

                if (mError) throw mError;
            }

            alert(t.admin.alertSaved);
            router.push(`/dashboard`);
        } catch (error) {
            console.error("Error saving:", error);
            alert(t.admin.alertError);
        } finally {
            setLoading(false);
        }
    };

    const deleteRestaurant = async () => {
        if (!restaurantId) return;
        if (!confirm(t.admin.confirmDelete)) return;

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

            alert(t.admin.alertDeleted);
            router.push("/dashboard");
        } catch (error) {
            console.error("Error deleting:", error);
            alert(t.admin.alertDeleteError);
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
                            {restaurantId ? t.admin.editTitle : t.admin.createTitle}
                        </h1>
                    </div>
                    <div className="flex gap-2">

                        {restaurantId && (
                            <button
                                onClick={deleteRestaurant}
                                disabled={loading}
                                className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                                {t.admin.deleteMenu}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Restaurant Name Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.admin.restaurantName}
                    </label>
                    <input
                        type="text"
                        value={restaurantName}
                        onChange={(e) => setRestaurantName(e.target.value)}
                        placeholder={t.admin.restaurantNamePlaceholder}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column: Menu Editor */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5" /> {t.admin.addMenu}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t.admin.menuName}
                                </label>
                                <input
                                    type="text"
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    placeholder={t.admin.menuNamePlaceholder}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t.admin.price}
                                </label>
                                <input
                                    type="number"
                                    value={newItemPrice}
                                    onChange={(e) => setNewItemPrice(e.target.value)}
                                    placeholder={t.admin.pricePlaceholder}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t.admin.description}
                                </label>
                                <textarea
                                    value={newItemDesc}
                                    onChange={(e) => setNewItemDesc(e.target.value)}
                                    placeholder={t.admin.descriptionPlaceholder}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none h-20"
                                />
                            </div>

                            <button
                                onClick={addMenuItem}
                                disabled={!newItemName || !newItemPrice}
                                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                {t.admin.addButton}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Preview List */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 min-h-[500px]">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                            {restaurantName || t.admin.preview}
                        </h2>

                        {menuItems.length === 0 ? (
                            <div className="text-center text-gray-400 py-10">
                                {t.admin.noMenu}
                                <br />
                                {t.admin.noMenuSub}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {menuItems.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <div className="font-bold text-gray-900">{item.name}</div>
                                            {item.description && (
                                                <div className="text-sm text-gray-500 mt-1">{item.description}</div>
                                            )}
                                            <div className="text-blue-600 font-semibold mt-1">
                                                {item.price.toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex flex-col gap-1">
                                                <button
                                                    onClick={() => moveItem(index, 'up')}
                                                    disabled={index === 0}
                                                    className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-400"
                                                >
                                                    <ArrowUp className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => moveItem(index, 'down')}
                                                    disabled={index === menuItems.length - 1}
                                                    className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-400"
                                                >
                                                    <ArrowDown className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeMenuItem(item.id)}
                                                className="text-gray-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-all"
                                                aria-label="Delete menu item"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
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
                        {restaurantId ? t.admin.saveUpdate : t.admin.save}
                    </button>
                </div>
            </div>
        </div>

    );
}

export default function AdminPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            </div>
        }>
            <AdminPageContent />
        </Suspense>
    );
}
