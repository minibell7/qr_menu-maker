import { create } from 'zustand';
import { MenuItem } from '@/types';
import { arrayMove } from '@dnd-kit/sortable';
import { v4 as uuidv4 } from 'uuid';

export interface MenuCategory {
    id: string;
    name: string;
    items: MenuItem[];
}

interface MenuState {
    categories: MenuCategory[];
    setCategories: (categories: MenuCategory[]) => void;
    addCategory: (name: string) => void;
    updateCategory: (id: string, name: string) => void;
    deleteCategory: (id: string) => void;
    addItem: (categoryId: string, item: Omit<MenuItem, 'id' | 'restaurant_id'>) => void;
    updateItem: (categoryId: string, itemId: string, item: Partial<MenuItem>) => void;
    deleteItem: (categoryId: string, itemId: string) => void;
    reorderCategories: (activeId: string, overId: string) => void;
    reorderItems: (categoryId: string, activeId: string, overId: string) => void;
    moveItemToCategory: (activeId: string, overCategoryId: string) => void;
}

export const useMenuStore = create<MenuState>((set) => ({
    categories: [],
    setCategories: (categories) => set({ categories }),
    addCategory: (name) =>
        set((state) => ({
            categories: [
                ...state.categories,
                { id: uuidv4(), name, items: [] },
            ],
        })),
    updateCategory: (id, name) =>
        set((state) => ({
            categories: state.categories.map((cat) =>
                cat.id === id ? { ...cat, name } : cat
            ),
        })),
    deleteCategory: (id) =>
        set((state) => ({
            categories: state.categories.filter((cat) => cat.id !== id),
        })),
    addItem: (categoryId, item) =>
        set((state) => ({
            categories: state.categories.map((cat) =>
                cat.id === categoryId
                    ? {
                        ...cat,
                        items: [
                            ...cat.items,
                            { ...item, id: uuidv4(), restaurant_id: '', category: cat.name },
                        ],
                    }
                    : cat
            ),
        })),
    updateItem: (categoryId, itemId, updates) =>
        set((state) => ({
            categories: state.categories.map((cat) =>
                cat.id === categoryId
                    ? {
                        ...cat,
                        items: cat.items.map((item) =>
                            item.id === itemId ? { ...item, ...updates } : item
                        ),
                    }
                    : cat
            ),
        })),
    deleteItem: (categoryId, itemId) =>
        set((state) => ({
            categories: state.categories.map((cat) =>
                cat.id === categoryId
                    ? {
                        ...cat,
                        items: cat.items.filter((item) => item.id !== itemId),
                    }
                    : cat
            ),
        })),
    reorderCategories: (activeId, overId) =>
        set((state) => {
            const oldIndex = state.categories.findIndex((cat) => cat.id === activeId);
            const newIndex = state.categories.findIndex((cat) => cat.id === overId);
            return {
                categories: arrayMove(state.categories, oldIndex, newIndex),
            };
        }),
    reorderItems: (categoryId, activeId, overId) =>
        set((state) => {
            const categoryIndex = state.categories.findIndex((cat) => cat.id === categoryId);
            if (categoryIndex === -1) return state;

            const category = state.categories[categoryIndex];
            const oldIndex = category.items.findIndex((item) => item.id === activeId);
            const newIndex = category.items.findIndex((item) => item.id === overId);

            const newCategories = [...state.categories];
            newCategories[categoryIndex] = {
                ...category,
                items: arrayMove(category.items, oldIndex, newIndex),
            };

            return { categories: newCategories };
        }),
    moveItemToCategory: (activeId, overCategoryId) => {
        // Complex logic for moving items between categories can be added here
        // For now, simplified or omitted as reorderItems handles within category
        return {};
    }
}));
