"use client";

import { QRCodeCanvas } from "qrcode.react";
import { Download, ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRef, useEffect, useState } from "react";

export default function SharePage() {
    const params = useParams();
    const id = params?.id as string;
    const qrRef = useRef<HTMLDivElement>(null);
    // We need the full URL for the QR code. 
    // In a client component, we can use window.location.origin, but we need to wait for mount.
    // Or we can just use a relative path if the scanner supports it (usually not).
    // Better to construct it.

    const menuUrl = typeof window !== 'undefined' ? `${window.location.origin}/view/${id}` : '';

    const downloadQR = () => {
        const canvas = qrRef.current?.querySelector("canvas");
        if (canvas) {
            const url = canvas.toDataURL("image/png");
            const a = document.createElement("a");
            a.href = url;
            a.download = `menu_qr_${id}.png`;
            a.click();
        }
    };

    if (!menuUrl) return null; // Wait for client-side hydration

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full space-y-8">
                <div className="flex items-center justify-between">
                    <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900">QR 코드 공유</h1>
                    <div className="w-6" /> {/* Spacer */}
                </div>

                <div className="flex justify-center" ref={qrRef}>
                    <div className="p-4 bg-white border-2 border-gray-100 rounded-xl shadow-sm">
                        <QRCodeCanvas
                            value={menuUrl}
                            size={200}
                            level={"H"}
                            includeMargin={true}
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={downloadQR}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
                    >
                        <Download className="w-5 h-5" />
                        이미지로 저장
                    </button>

                    <Link
                        href={`/view/${id}`}
                        target="_blank"
                        className="block w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 text-center flex items-center justify-center gap-2 transition-colors"
                    >
                        <ExternalLink className="w-5 h-5" />
                        메뉴판 미리보기
                    </Link>
                </div>

                <p className="text-center text-sm text-gray-500">
                    이 QR 코드는 영구적으로 사용할 수 있습니다.<br />
                    메뉴 내용을 수정해도 QR 코드는 변하지 않습니다.
                </p>
            </div>
        </div>
    );
}
