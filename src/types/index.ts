export interface MenuItem {
    id: string;
    restaurant_id: string;
    name: string;
    price: number;
    description?: string;
    order_index?: number;
    category?: string;
    image_url?: string;
}

export interface Restaurant {
    id: string;
    user_id: string;
    name: string;
    created_at: string;
    currency?: string;
    menus?: MenuItem[];
}
