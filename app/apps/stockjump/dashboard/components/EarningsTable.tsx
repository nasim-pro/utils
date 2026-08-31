"use client";

import { useState } from "react";
import EarningsTableRow from "./EarningsTableRow";
import type { Stock } from "./types";

interface EarningsTableProps {
    stocks: Stock[];
    isTopStocks?: boolean;
}

export default function EarningsTable({ stocks, isTopStocks = false }: EarningsTableProps) {
    const [watchlist, setWatchlist] = useState<string[]>(["HDFCBANK"]);

    function toggleWatchlist(symbol: string) {
        setWatchlist((current) =>
            current.includes(symbol)
                ? current.filter((item) => item !== symbol)
                : [...current, symbol]
        );
    }

    return (
        <div className="w-full overflow-hidden">
            <div className="w-full">
                {/* Header Grid */}
                {isTopStocks ? (
                    <div className="grid grid-cols-[70px_minmax(220px,2fr)_minmax(120px,1fr)_minmax(90px,0.8fr)_120px_90px_120px] items-center px-4 pb-3 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                        <div>Rank</div>
                        <div>Company</div>
                        <div className="text-right">PAT (₹ Cr)</div>
                        <div className="text-right">EPS</div>
                        <div className="text-center">Trend</div>
                        <div className="text-center">Score</div>
                        <div className="text-right">Action</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-[1.8fr_1fr_1fr_1fr_0.7fr_0.9fr_0.9fr_50px] items-center px-4 pb-3 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                        <div>Company</div>
                        <div>Sector</div>
                        <div className="text-right">Revenue</div>
                        <div className="text-right">Pat</div>
                        <div className="text-right">Eps</div>
                        <div className="text-right">Pat Growth</div>
                        <div className="text-center">Sentiment</div>
                        <div className="text-right">Details</div>
                    </div>
                )}

                {/* Rows container */}
                <div className="space-y-2.5 mt-1">
                    {stocks.map((stock, index) => (
                        <EarningsTableRow
                            key={stock.symbol}
                            stock={stock}
                            rank={stock.rank || index + 1}
                            isTopStock={isTopStocks}
                            starred={watchlist.includes(stock.symbol)}
                            onToggleStar={toggleWatchlist}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}