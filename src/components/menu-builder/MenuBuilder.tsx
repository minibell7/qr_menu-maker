"use client";

import React, { useState } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useMenuStore, MenuCategory } from "@/store/menu-store";
import { SortableCategory } from "./SortableCategory";
import { SortableItem } from "./SortableItem";
import { MenuItem } from "@/types";
import { createPortal } from "react-dom";

export function MenuBuilder() {
    const {
        categories,
        reorderCategories,
        reorderItems,
        moveItemToCategory,
    } = useMenuStore();

    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeItem, setActiveItem] = useState<MenuItem | MenuCategory | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragStart(event: DragStartEvent) {
        const { active } = event;
        setActiveId(active.id as string);

        // Determine if dragging category or item
        const category = categories.find(c => c.id === active.id);
        if (category) {
            setActiveItem(category);
            return;
        }

        // Find item
        for (const cat of categories) {
            const item = cat.items.find(i => i.id === active.id);
            if (item) {
                setActiveItem(item);
                return;
            }
        }
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveId(null);
        setActiveItem(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Reorder Categories
        if (categories.some(c => c.id === activeId) && categories.some(c => c.id === overId)) {
            if (activeId !== overId) {
                reorderCategories(activeId, overId);
            }
            return;
        }

        // Reorder Items
        // Find which category the active item belongs to
        const activeCategory = categories.find(c => c.items.some(i => i.id === activeId));
        const overCategory = categories.find(c => c.items.some(i => i.id === overId));

        if (activeCategory && overCategory && activeCategory.id === overCategory.id) {
            if (activeId !== overId) {
                reorderItems(activeCategory.id, activeId, overId);
            }
        }
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="space-y-4">
                <SortableContext
                    items={categories.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {categories.map((category) => (
                        <SortableCategory key={category.id} category={category} />
                    ))}
                </SortableContext>
            </div>

            {createPortal(
                <DragOverlay>
                    {activeItem && 'items' in activeItem ? (
                        <div className="p-4 bg-card border rounded-lg shadow-lg opacity-80">
                            {activeItem.name}
                        </div>
                    ) : activeItem ? (
                        <div className="p-4 bg-card border rounded-lg shadow-lg opacity-80">
                            {(activeItem as MenuItem).name}
                        </div>
                    ) : null}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
}
