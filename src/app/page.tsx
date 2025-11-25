import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex flex-col gap-8">
        <h1 className="text-4xl font-bold text-center text-gray-900">
          QR Menu Maker
        </h1>
        <p className="text-xl text-center text-gray-600">
          나만의 식당 메뉴판을 만들고 QR코드로 공유하세요.
        </p>

        <Link
          href="/admin"
          className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          메뉴판 만들기 시작하기
        </Link>
      </div>
    </main>
  );
}
