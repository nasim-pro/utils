import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "GrowUpNow — Apps & Utilities",
    description:
        "Small apps and sharp utilities for everyday work, including StockJump, DoneLog and browser-based image tools.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
