import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Settings, QrCode, ExternalLink, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return redirect("/");

    const { data: restaurants } = await supabase
        .from("restaurants")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground">Manage your menus and restaurants.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                        <form action="/auth/signout" method="post">
                            <Button variant="outline" size="sm">Sign Out</Button>
                        </form>
                    </div>
                </div>

                <Separator />

                {/* Stats Overview (Placeholder) */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Menus</CardTitle>
                            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{restaurants?.length || 0}</div>
                        </CardContent>
                    </Card>
                    {/* Add more stats here */}
                </div>

                {/* Restaurants Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Create New Card */}
                    <Card className="flex flex-col items-center justify-center border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer min-h-[300px] bg-muted/50 hover:bg-muted">
                        <Link href="/admin" className="flex flex-col items-center justify-center w-full h-full p-6">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <Plus className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="font-semibold text-lg">Create New Menu</h3>
                            <p className="text-sm text-muted-foreground text-center mt-2">
                                Start building your digital menu
                            </p>
                        </Link>
                    </Card>

                    {restaurants?.map((restaurant) => (
                        <Card key={restaurant.id} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
                            <CardHeader>
                                <CardTitle>{restaurant.name}</CardTitle>
                                <CardDescription>
                                    Created {new Date(restaurant.created_at).toLocaleDateString()}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="flex gap-2">
                                    <Badge variant="secondary">Active</Badge>
                                    {restaurant.currency && <Badge variant="outline">{restaurant.currency}</Badge>}
                                </div>
                            </CardContent>
                            <CardFooter className="grid grid-cols-3 gap-2">
                                <Button asChild variant="outline" size="sm" className="w-full">
                                    <Link href={`/admin?id=${restaurant.id}`}>
                                        <Settings className="h-4 w-4 mr-2" />
                                        Edit
                                    </Link>
                                </Button>
                                <Button asChild variant="secondary" size="sm" className="w-full">
                                    <Link href={`/view/${restaurant.id}`} target="_blank">
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        View
                                    </Link>
                                </Button>
                                <Button asChild size="sm" className="w-full">
                                    <Link href={`/share/${restaurant.id}`}>
                                        <QrCode className="h-4 w-4 mr-2" />
                                        QR
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
