import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Settings, QrCode, ExternalLink } from "lucide-react";

export default async function DashboardPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    const { data: restaurants } = await supabase
        .from("restaurants")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-900">내 메뉴판 관리</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">{user.email}</span>
                            <form action="/auth/signout" method="post">
                                <button className="text-sm text-gray-500 hover:text-gray-700">
                                    로그아웃
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {restaurants && restaurants.length > 0 ? (
                    <div className="max-w-2xl mx-auto">
                        {restaurants.map((restaurant) => (
                            <div
                                key={restaurant.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                            {restaurant.name}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            생성일: {new Date(restaurant.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <Link
                                        href={`/admin?id=${restaurant.id}`}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
                                    >
                                        <Settings className="w-4 h-4" />
                                        수정하기
                                    </Link>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Link
                                        href={`/view/${restaurant.id}`}
                                        target="_blank"
                                        className="flex items-center justify-center gap-2 px-4 py-4 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 font-semibold transition-colors"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                        메뉴판 보기
                                    </Link>
                                    <Link
                                        href={`/share/${restaurant.id}`}
                                        className="flex items-center justify-center gap-2 px-4 py-4 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 font-semibold transition-colors"
                                    >
                                        <QrCode className="w-5 h-5" />
                                        QR 코드
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center max-w-2xl mx-auto">
                        <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                            <Plus className="w-10 h-10 text-blue-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                            나만의 메뉴판을 만들어보세요
                        </h3>
                        <p className="text-gray-500 mb-8">
                            메뉴를 등록하고 QR코드를 생성하여<br />
                            고객에게 스마트한 메뉴판을 제공할 수 있습니다.
                        </p>
                        <Link
                            href="/admin"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 transition-transform active:scale-[0.98]"
                        >
                            <Plus className="w-6 h-6" />
                            메뉴판 만들기 시작하기
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
