"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const signInAnonymously = async () => {
            const { error } = await supabase.auth.signInAnonymously();

            if (error) {
                console.error("Error signing in anonymously:", error);
                setError("게스트 로그인 중 오류가 발생했습니다. 관리자에게 문의하세요.");
            } else {
                router.refresh();
                router.push("/dashboard");
            }
        };

        signInAnonymously();
    }, [router, supabase]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                {error ? (
                    <div className="text-red-600 mb-4">{error}</div>
                ) : (
                    <>
                        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900">
                            게스트 모드로 입장 중입니다...
                        </h2>
                        <p className="text-gray-500 mt-2">잠시만 기다려주세요.</p>
                    </>
                )}
            </div>
        </div>
    );
}
