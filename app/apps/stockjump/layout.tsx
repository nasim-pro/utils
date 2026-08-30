
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "StockJump — Understand Earnings Before They Move",
    description:
        "Track Indian company earnings, compare financial performance, and understand quarterly results with AI-powered analysis.",
};

export default function StockJumpLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className="min-h-screen bg-[#07111f]">
            {children}
        </main>
    );
}

