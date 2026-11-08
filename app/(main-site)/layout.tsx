import type { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
    title: "GrowUpNow — Apps & Utilities",
    description:
        "Small apps and sharp utilities for everyday work, including StockJump, DoneLog and a collection of image tools.",
};

export default function MainSiteLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Navbar />
            <main className="main-wrapper">{children}</main>
        </>
    );
}
