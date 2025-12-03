"use client";

import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MenuItem } from "@/types";
import { Card } from "@/components/ui/card";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMenuStore } from "@/store/menu-store";
import { MenuItemDialog } from "./MenuItemDialog";

interface Props {
    item: MenuItem;
    categoryId: string;
}

export function SortableItem({ item, categoryId }: Props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: item.id });

    const { updateItem, deleteItem } = useMenuStore();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <Card className="p-3 flex items-center bg-background hover:bg-accent/50 transition-colors group">
                <div {...attributes} {...listeners} className="cursor-grab mr-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.price.toLocaleString()}</div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsDialogOpen(true)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteItem(categoryId, item.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </Card>

            <MenuItemDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                mode="edit"
                initialData={item}
                onSubmit={(updates) => updateItem(categoryId, item.id, updates)}
            />
        </div>
    );
}
