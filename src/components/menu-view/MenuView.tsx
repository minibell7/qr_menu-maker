"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Restaurant, MenuItem } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, Search, Menu as MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface MenuCategory {
    id: string;
    name: string;
    items: MenuItem[];
}

interface Props {
    restaurant: Restaurant;
    categories: MenuCategory[];
}

export function MenuView({ restaurant, categories }: Props) {
    const [activeCategory, setActiveCategory] = useState(categories[0]?.id);
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const headerRef = useRef<HTMLDivElement>(null);

    // Scroll to category
    const scrollToCategory = (id: string) => {
        setActiveCategory(id);
        const element = categoryRefs.current[id];
        if (element) {
            const headerOffset = 120; // Approx header height + tabs height
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    // Scroll Spy (Simplified)
    useEffect(() => {
        const handleScroll = () => {
            // Logic to update activeCategory based on scroll position
            // Omitted for brevity/performance in this MVP step, but recommended for full polish
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            {/* Hero / Header */}
            <header className="relative h-48 bg-gradient-to-b from-primary/20 to-background flex items-end p-6">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
                <div className="relative z-10 w-full">
                    <h1 className="text-3xl font-bold tracking-tight mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        {restaurant.name}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Premium Dining Experience
                    </p>
                </div>
            </header>

            {/* Sticky Category Tabs */}
            <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
                <div className="flex overflow-x-auto py-3 px-4 gap-2 no-scrollbar">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => scrollToCategory(category.id)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                                activeCategory === category.id
                                    ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Menu Content */}
            <div className="p-4 space-y-8 max-w-2xl mx-auto">
                {categories.map((category) => (
                    <div
                        key={category.id}
                        ref={(el) => { categoryRefs.current[category.id] = el; }}
                        className="space-y-4 scroll-mt-32"
                    >
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <span className="w-1 h-6 bg-primary rounded-full"></span>
                            {category.name}
                        </h2>

                        <div className="grid gap-4">
                            {category.items.map((item) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.3 }}
                                    onClick={() => setSelectedItem(item)}
                                    className="group relative overflow-hidden rounded-2xl bg-card/50 border border-white/5 p-4 hover:bg-card/80 transition-colors cursor-pointer"
                                >
                                    <div className="flex gap-4">
                                        {item.image_url && (
                                            <div className="w-24 h-24 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                                                <img
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start gap-2">
                                                    <h3 className="font-semibold text-lg leading-tight truncate pr-2">
                                                        {item.name}
                                                    </h3>
                                                    <span className="font-bold text-primary whitespace-nowrap">
                                                        {item.price.toLocaleString()}
                                                    </span>
                                                </div>
                                                {item.description && (
                                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                        {item.description}
                                                    </p>
                                                )}
                                            </div>
                                            {/* Add button placeholder */}
                                            {/* <div className="mt-3 flex justify-end">
                                                <Button size="sm" variant="secondary" className="h-8 rounded-full">
                                                    Add
                                                </Button>
                                            </div> */}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Floating Action Button (Cart placeholder) */}
            <div className="fixed bottom-6 right-6 z-50">
                <Button size="icon" className="h-14 w-14 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] bg-primary hover:bg-primary/90">
                    <ShoppingBag className="h-6 w-6" />
                </Button>
            </div>

            {/* Item Detail Dialog */}
            <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
                <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-card border-white/10">
                    {selectedItem && (
                        <>
                            <div className="relative h-64 w-full bg-muted">
                                {selectedItem.image_url ? (
                                    <img
                                        src={selectedItem.image_url}
                                        alt={selectedItem.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-muted/50">
                                        <span className="text-muted-foreground">No Image</span>
                                    </div>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full"
                                    onClick={() => setSelectedItem(null)}
                                >
                                    <span className="sr-only">Close</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                </Button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <h2 className="text-2xl font-bold">{selectedItem.name}</h2>
                                    <p className="text-xl font-semibold text-primary mt-1">
                                        {selectedItem.price.toLocaleString()}
                                    </p>
                                </div>
                                {selectedItem.description && (
                                    <p className="text-muted-foreground leading-relaxed">
                                        {selectedItem.description}
                                    </p>
                                )}
                                <div className="pt-4">
                                    <Button className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/20">
                                        Add to Order
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
