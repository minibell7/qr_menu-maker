"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/hooks/useLanguage";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function AdminLoginDialog({ children }: { children: React.ReactNode }) {
    const { t } = useLanguage();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            setIsOpen(false);
            router.push("/dashboard");
        } catch (error) {
            console.error("Login error:", error);
            alert(t.admin.alertError); // Using generic error for now, ideally specific auth error
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t.auth.loginTitle}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleLogin} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">{t.auth.email}</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder={t.auth.emailPlaceholder}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">{t.auth.password}</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder={t.auth.passwordPlaceholder}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                            {t.auth.cancel}
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t.auth.login}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
