"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import StockDetailClient from "./StockDetailClient";

function StockPageContent() {
    const searchParams = useSearchParams();

    const symbol = searchParams.get("symbol");

    if (!symbol) {
        return (
            <div className="min-h-screen bg-[#070d18] px-6 py-20 text-center text-sm text-slate-400">
                Stock symbol is missing.
            </div>
        );
    }

    return <StockDetailClient symbol={symbol} />;
}

export default function StockPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#070d18] px-6 py-20 text-center text-sm text-slate-400">
                    Loading stock...
                </div>
            }
        >
            <StockPageContent />
        </Suspense>
    );
}