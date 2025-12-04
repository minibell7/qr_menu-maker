"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MenuItem } from "@/types";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (item: Omit<MenuItem, "id" | "restaurant_id">) => void;
    initialData?: MenuItem;
    mode: "add" | "edit";
}

export function MenuItemDialog({ open, onOpenChange, onSubmit, initialData, mode }: Props) {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    useEffect(() => {
        if (open && initialData) {
            setName(initialData.name);
            setPrice(initialData.price.toString());
            setDescription(initialData.description || "");
            setImageUrl(initialData.image_url || "");
        } else if (open && mode === "add") {
            setName("");
            setPrice("");
            setDescription("");
            setImageUrl("");
        }
    }, [open, initialData, mode]);

    const handleSubmit = () => {
        if (!name || !price) return;
        onSubmit({
            name,
            price: Number(price),
            description,
            image_url: imageUrl,
            category: initialData?.category // Preserve category if editing
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] w-[95vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{mode === "add" ? "Add New Item" : "Edit Item"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Burger"
                            className="h-10 text-base"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="price">Price</Label>
                        <Input
                            id="price"
                            type="number"
                            inputMode="decimal"
                            pattern="[0-9]*"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="10000"
                            className="h-10 text-base"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Delicious beef burger..."
                            className="min-h-[100px] text-base"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="image">Image URL</Label>
                        <Input
                            id="image"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://..."
                            className="h-10 text-base"
                        />
                    </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="h-10">Cancel</Button>
                    <Button onClick={handleSubmit} className="h-10">Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
