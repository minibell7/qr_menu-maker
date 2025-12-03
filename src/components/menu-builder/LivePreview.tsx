"use client";

import React from "react";
import { useMenuStore } from "@/store/menu-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function LivePreview() {
    const { categories } = useMenuStore();

    return (
        <div className="w-[375px] h-[812px] bg-background border-[14px] border-gray-900 rounded-[3rem] shadow-2xl overflow-hidden relative mx-auto">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-gray-900 rounded-b-3xl z-20"></div>

            {/* Status Bar Mock */}
            <div className="h-12 bg-background w-full flex items-center justify-between px-6 pt-2 text-xs font-medium z-10 relative">
                <span>9:41</span>
                <div className="flex gap-1">
                    <div className="w-4 h-4 bg-current rounded-full opacity-20"></div>
                    <div className="w-4 h-4 bg-current rounded-full opacity-20"></div>
                    <div className="w-4 h-4 bg-current rounded-full opacity-20"></div>
                </div>
            </div>

            <ScrollArea className="h-[calc(100%-3rem)] w-full">
                <div className="p-4 space-y-6 pb-20">
                    {/* Header Mock */}
                    <div className="space-y-2 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full mx-auto animate-pulse" />
                        <h2 className="text-xl font-bold">Restaurant Name</h2>
                        <p className="text-sm text-muted-foreground">Delicious food, delivered.</p>
                    </div>

                    <Separator />

                    {/* Categories & Items */}
                    <div className="space-y-8">
                        {categories.map((category) => (
                            <div key={category.id} className="space-y-4">
                                <h3 className="font-bold text-lg sticky top-0 bg-background/95 backdrop-blur py-2 z-10">
                                    {category.name}
                                </h3>
                                <div className="space-y-4">
                                    {category.items.map((item) => (
                                        <div key={item.id} className="flex gap-4">
                                            <div className="w-20 h-20 bg-muted rounded-lg flex-shrink-0" />
                                            <div className="flex-1 space-y-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-medium line-clamp-2">{item.name}</h4>
                                                    <span className="font-semibold text-sm">
                                                        {item.price.toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-2">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </ScrollArea>

            {/* Bottom Bar Mock */}
            <div className="absolute bottom-0 w-full h-1 bg-gray-900/10 mx-auto left-0 right-0 mb-2 rounded-full w-1/3"></div>
        </div>
    );
}
