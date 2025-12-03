"use client";

import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMenuStore, MenuCategory } from "@/store/menu-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";
import { MenuItemDialog } from "./MenuItemDialog";

interface Props {
    category: MenuCategory;
}

export function SortableCategory({ category }: Props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: category.id });

    const { addItem, deleteCategory } = useMenuStore();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="mb-4">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader className="flex flex-row items-center space-y-0 p-4">
                    <div {...attributes} {...listeners} className="cursor-grab mr-2">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-lg font-semibold flex-1">
                        {category.name}
                    </CardTitle>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setIsDialogOpen(true)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteCategory(category.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <SortableContext
                        items={category.items.map((item) => item.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-2">
                            {category.items.map((item) => (
                                <SortableItem key={item.id} item={item} categoryId={category.id} />
                            ))}
                        </div>
                    </SortableContext>
                    {category.items.length === 0 && (
                        <div className="text-center py-4 text-sm text-muted-foreground border-dashed border rounded-md mt-2">
                            Drop items here
                        </div>
                    )}
                </CardContent>
            </Card>

            <MenuItemDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                mode="add"
                onSubmit={(item) => addItem(category.id, item)}
            />
        </div>
    );
}
