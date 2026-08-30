"use client";

import { Search } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function StockSearch() {
    const router = useRouter();
    const [symbol, setSymbol] = useState("");

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const value = symbol.trim().toLowerCase();

        if (!value) return;

        router.push(`/apps/stockjump/dashboard/${value}`);
    }

    return (
        <section className="mb-10">
            <form onSubmit={handleSubmit}>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />

                    <input
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                        placeholder="Search company or NSE symbol..."
                        className="h-14 w-full rounded-2xl border border-zinc-200 bg-white pl-12 pr-24 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-100"
                    />

                    <button
                        type="submit"
                        className="absolute right-2 top-2 h-10 rounded-xl bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800"
                    >
                        Search
                    </button>
                </div>
            </form>

            <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500">
                <span>Try:</span>

                {["TCS", "INFY", "RELIANCE", "TICL"].map((symbol) => (
                    <button
                        key={symbol}
                        type="button"
                        onClick={() => {
                            router.push(
                                `/apps/stockjump/dashboard/${symbol.toLowerCase()}`
                            );
                        }}
                        className="rounded-md bg-zinc-100 px-2 py-1 font-medium text-zinc-600 hover:bg-zinc-200"
                    >
                        {symbol}
                    </button>
                ))}
            </div>
        </section>
    );
}