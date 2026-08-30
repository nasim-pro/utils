"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function StockSearch() {
    const router = useRouter();
    const [symbol, setSymbol] = useState("");

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const value = symbol.trim().toLowerCase();

        if (!value) return;

        router.push(`/apps/stockjump/dashboard/${value}`);
    }

    return (
        <div className="rounded-3xl bg-gray-900 p-6 text-white shadow-sm sm:p-8">
            <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-gray-300">
                    Stock Research
                </div>

                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Research a company
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-400 sm:text-base">
                    Search an NSE-listed company to explore its financial
                    data and quarterly results.
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="mt-6 flex flex-col gap-3 sm:flex-row"
                >
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={symbol}
                            onChange={(event) =>
                                setSymbol(event.target.value)
                            }
                            placeholder="Enter stock symbol, e.g. TCS"
                            className="h-12 w-full rounded-xl border border-white/10 bg-white px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-white"
                        />
                    </div>

                    <button
                        type="submit"
                        className="h-12 rounded-xl bg-white px-6 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
                    >
                        Search
                    </button>
                </form>

                <p className="mt-3 text-xs text-gray-500">
                    Try TCS, INFY, RELIANCE, HDFCBANK
                </p>
            </div>
        </div>
    );
}