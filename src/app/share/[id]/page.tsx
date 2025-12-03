"use client";

import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { Download, ArrowLeft, ExternalLink, Settings2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SharePage() {
    const params = useParams();
    const id = params?.id as string;
    const qrRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const [fgColor, setFgColor] = useState("#000000");
    const [bgColor, setBgColor] = useState("#ffffff");
    const [includeMargin, setIncludeMargin] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const menuUrl = mounted ? `${window.location.origin}/view/${id}` : '';

    const downloadPNG = () => {
        const canvas = qrRef.current?.querySelector("canvas");
        if (canvas) {
            const url = canvas.toDataURL("image/png");
            const a = document.createElement("a");
            a.href = url;
            a.download = `menu_qr_${id}.png`;
            a.click();
        }
    };

    const downloadSVG = () => {
        if (svgRef.current) {
            const svgData = new XMLSerializer().serializeToString(svgRef.current);
            const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `menu_qr_${id}.svg`;
            a.click();
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8">

                {/* Left: Controls */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-6 h-6" />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">QR Code Settings</h1>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings2 className="w-5 h-5" />
                                Customization
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Foreground Color</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="color"
                                            value={fgColor}
                                            onChange={(e) => setFgColor(e.target.value)}
                                            className="w-12 h-12 p-1 cursor-pointer"
                                        />
                                        <span className="text-sm font-mono text-muted-foreground">{fgColor}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Background Color</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="color"
                                            value={bgColor}
                                            onChange={(e) => setBgColor(e.target.value)}
                                            className="w-12 h-12 p-1 cursor-pointer"
                                        />
                                        <span className="text-sm font-mono text-muted-foreground">{bgColor}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="margin"
                                    checked={includeMargin}
                                    onChange={(e) => setIncludeMargin(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <Label htmlFor="margin" className="cursor-pointer">Include Margin</Label>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-4">
                        <Button onClick={downloadPNG} className="w-full" size="lg">
                            <Download className="w-4 h-4 mr-2" />
                            Download PNG
                        </Button>
                        <Button onClick={downloadSVG} variant="outline" className="w-full" size="lg">
                            <Download className="w-4 h-4 mr-2" />
                            Download SVG
                        </Button>
                    </div>

                    <Link href={`/view/${id}`} target="_blank">
                        <Button variant="secondary" className="w-full mt-4">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Preview Menu
                        </Button>
                    </Link>
                </div>

                {/* Right: Preview */}
                <div className="flex items-center justify-center bg-white p-8 rounded-2xl shadow-sm border">
                    <div className="space-y-6 text-center">
                        <div ref={qrRef} className="bg-white p-4 rounded-xl shadow-sm border inline-block">
                            <QRCodeCanvas
                                value={menuUrl}
                                size={300}
                                level={"H"}
                                includeMargin={includeMargin}
                                fgColor={fgColor}
                                bgColor={bgColor}
                            />
                        </div>

                        {/* Hidden SVG for download */}
                        <div style={{ display: 'none' }}>
                            <QRCodeSVG
                                ref={svgRef}
                                value={menuUrl}
                                size={300}
                                level={"H"}
                                includeMargin={includeMargin}
                                fgColor={fgColor}
                                bgColor={bgColor}
                            />
                        </div>

                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                            Scan this code to view the menu. Changes to the menu update automatically.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

