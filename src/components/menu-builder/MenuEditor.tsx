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
    const [activeTab, setActiveTab] = React.useState("editor");

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
            <header className="border-b px-4 md:px-6 py-3 flex items-center justify-between bg-card shrink-0">
                <div className="flex items-center gap-2 md:gap-4 flex-1">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="flex flex-col flex-1 max-w-[200px] md:max-w-none">
                        <span className="text-xs text-muted-foreground">Restaurant Name</span>
                        <Input
                            value={restaurantName}
                            onChange={(e) => setRestaurantName(e.target.value)}
                            className="h-8 font-bold border-none shadow-none p-0 focus-visible:ring-0 text-lg w-full"
                            placeholder="Enter Name"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Mobile Tab Toggle */}
                    <div className="md:hidden flex bg-muted rounded-md p-1">
                        <button
                            onClick={() => setActiveTab("editor")}
                            className={`px-3 py-1 text-xs font-medium rounded-sm transition-all ${activeTab === "editor" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                        >
                            Editor
                        </button>
                        <button
                            onClick={() => setActiveTab("preview")}
                            className={`px-3 py-1 text-xs font-medium rounded-sm transition-all ${activeTab === "preview" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                        >
                            Preview
                        </button>
                    </div>

                    <Button onClick={handleSave} disabled={isSaving} size="sm" className="ml-2">
                        <Save className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">{isSaving ? "Saving..." : "Save Changes"}</span>
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Editor Section */}
                <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 absolute inset-0 md:relative z-10 bg-background ${activeTab === "editor" ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/10">
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="New Category Name"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    className="h-10"
                                />
                                <Button onClick={() => {
                                    if (newCategoryName) {
                                        addCategory(newCategoryName);
                                        setNewCategoryName("");
                                    }
                                }}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add
                                </Button>
                            </div>

                            <MenuBuilder />
                        </div>
                    </div>
                </div>

                {/* Preview Section */}
                <div className={`w-full md:w-[450px] bg-muted/30 flex items-center justify-center border-l absolute inset-0 md:relative z-20 md:z-auto bg-background md:bg-muted/30 transition-all duration-300 ${activeTab === "preview" ? "translate-x-0" : "translate-x-full md:translate-x-0"}`}>
                    <div className="w-full h-full md:h-auto md:w-auto p-4 md:p-8 flex items-center justify-center">
                        <div className="scale-[0.85] origin-top md:origin-center w-full max-w-[375px] md:w-auto h-full md:h-auto overflow-y-auto md:overflow-visible">
                            <LivePreview />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
