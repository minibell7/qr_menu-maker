"use client";

import { useState, useEffect, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { MenuEditor } from "@/components/menu-builder/MenuEditor";

function AdminPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const idParam = searchParams.get("id");
    const supabase = createClient();
    const [loading, setLoading] = useState(true);

    // Data state
    const [restaurantId, setRestaurantId] = useState<string | undefined>(undefined);
    const [restaurantName, setRestaurantName] = useState("");
    const [menuItems, setMenuItems] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }

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
                if (restaurant.menus) {
                    setMenuItems(restaurant.menus.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0)));
                }
            }
            setLoading(false);
        };
        fetchData();
    }, [router, supabase, idParam]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <MenuEditor
            initialData={menuItems}
            restaurantId={restaurantId}
            initialRestaurantName={restaurantName}
        />
    );
}

export default function AdminPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        }>
            <AdminPageContent />
        </Suspense>
    );
}
