"use client";

import { Search } from "lucide-react";
import Link from "next/link";

export default function DashboardHeader() {
    return (
        <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/95 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6">
                <Link
                    href="/apps/stockjump/dashboard"
                    className="text-lg font-bold tracking-tight text-zinc-950"
                >
                    StockJump
                </Link>

                <button
                    className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-900"
                >
                    <Search className="h-4 w-4" />
                    <span className="hidden sm:inline">
                        Search stocks
                    </span>

                    <kbd className="hidden rounded border bg-zinc-50 px-1.5 py-0.5 text-[10px] text-zinc-400 sm:inline">
                        /
                    </kbd>
                </button>
            </div>
        </header>
    );
}