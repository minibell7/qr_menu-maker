export interface MenuItem {
    id: string;
    restaurant_id: string;
    name: string;
    price: number;
    description?: string;
}

export interface Restaurant {
    id: string;
    user_id: string;
    name: string;
    created_at: string;
    menus?: MenuItem[];
}
