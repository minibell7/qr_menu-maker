"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const ensureLogin = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                console.log("No session found, signing in anonymously...");
                const { error } = await supabase.auth.signInAnonymously();
                if (error) {
                    console.error("Anonymous sign-in failed:", error);
                } else {
                    console.log("Signed in anonymously");
                    router.refresh();
                }
            }
        };

        ensureLogin();
    }, [supabase, router]);

    return <>{children}</>;
}
