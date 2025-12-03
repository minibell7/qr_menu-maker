"use client";

import React, { useEffect } from "react";
import { MenuBuilder } from "./MenuBuilder";
import { LivePreview } from "./LivePreview";
import { useMenuStore, MenuCategory } from "@/store/menu-store";
import { Button } from "@/components/ui/button";
import { Save, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface Props {
    initialData?: any;
    restaurantId?: string;
    initialRestaurantName?: string;
}

export function MenuEditor({ initialData, restaurantId, initialRestaurantName = "" }: Props) {
    const { categories, setCategories, addCategory } = useMenuStore();
    const [newCategoryName, setNewCategoryName] = React.useState("");
    const [restaurantName, setRestaurantName] = React.useState(initialRestaurantName);
    const router = useRouter();
    const supabase = createClient();
    const [isSaving, setIsSaving] = React.useState(false);

    useEffect(() => {
        if (initialData) {
            const grouped: Record<string, any[]> = {};
            initialData.forEach((item: any) => {
                const cat = item.category || "Uncategorized";
                if (!grouped[cat]) grouped[cat] = [];
                grouped[cat].push(item);
            });

            const loadedCategories: MenuCategory[] = Object.entries(grouped).map(([name, items]) => ({
                id: name,
                name,
                items
            }));

            if (loadedCategories.length === 0 && initialData.length > 0) {
                loadedCategories.push({ id: "default", name: "Menu", items: initialData });
            }

            setCategories(loadedCategories);
        }
    }, [initialData, setCategories]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

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
                        name: restaurantName || "My Restaurant",
                        user_id: user.id,
                        currency: "KRW"
                    })
                    .select()
                    .single();
                if (error) throw error;
                currentRestaurantId = newRestaurant.id;
            }

            // 2. Save Menus
            const allItems = categories.flatMap((cat, catIndex) =>
                cat.items.map((item, itemIndex) => ({
                    ...item,
                    category: cat.name,
                    order_index: itemIndex,
                }))
            );

            if (currentRestaurantId) {
                await supabase.from("menus").delete().eq("restaurant_id", currentRestaurantId);

                if (allItems.length > 0) {
                    const { error } = await supabase.from("menus").insert(
                        allItems.map(item => ({
                            restaurant_id: currentRestaurantId,
                            name: item.name,
                            price: item.price,
                            description: item.description,
                            category: item.category,
                            order_index: item.order_index,
                            image_url: item.image_url
                        }))
                    );
                    if (error) throw error;
                }
            }

            alert("Menu saved successfully!");
            if (!restaurantId && currentRestaurantId) {
                router.push(`/admin?id=${currentRestaurantId}`);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to save menu");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Header */}
            <header className="border-b px-6 py-3 flex items-center justify-between bg-card">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Restaurant Name</span>
                        <Input
                            value={restaurantName}
                            onChange={(e) => setRestaurantName(e.target.value)}
                            className="h-8 w-[200px] font-bold border-none shadow-none p-0 focus-visible:ring-0 text-lg"
                            placeholder="Enter Name"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handleSave} disabled={isSaving}>
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Builder */}
                <div className="flex-1 p-6 overflow-y-auto border-r bg-muted/10">
                    <div className="max-w-2xl mx-auto space-y-6">
                        <div className="flex gap-2">
                            <Input
                                placeholder="New Category Name"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                            />
                            <Button onClick={() => {
                                if (newCategoryName) {
                                    addCategory(newCategoryName);
                                    setNewCategoryName("");
                                }
                            }}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Category
                            </Button>
                        </div>

                        <MenuBuilder />
                    </div>
                </div>

                {/* Right: Preview */}
                <div className="w-[450px] bg-muted/30 p-8 flex items-center justify-center border-l">
                    <div className="scale-[0.85] origin-top">
                        <LivePreview />
                    </div>
                </div>
            </div>
        </div>
    );
}
