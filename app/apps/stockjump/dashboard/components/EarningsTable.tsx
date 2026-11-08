"use client";

import { useState } from "react";
import EarningsTableRow from "./EarningsTableRow";
import type { Stock } from "./types";

interface EarningsTableProps {
    stocks: Stock[];
    isTopStocks?: boolean;
    metricLabel?: string;
}

export default function EarningsTable({
    stocks,
    isTopStocks = false,
    metricLabel = "Net profit",
}: EarningsTableProps) {
    const [watchlist, setWatchlist] = useState<string[]>([
        "HDFCBANK",
    ]);

    function toggleWatchlist(symbol: string) {
        setWatchlist((current) =>
            current.includes(symbol)
                ? current.filter((item) => item !== symbol)
                : [...current, symbol]
        );
    }

    if (stocks.length === 0) {
        return (
            <div className="py-12 text-center text-sm font-medium text-slate-500">
                No data available for this filter.
            </div>
        );
    }

    return (
        <div className="w-full overflow-hidden">
            <div className="w-full">
                {isTopStocks ? (
                    <div className="grid grid-cols-[60px_minmax(180px,2fr)_minmax(100px,1fr)_minmax(100px,1fr)_70px] items-center px-5 pb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        <div>Star</div>
                        <div>Company</div>
                        <div className="text-right">
                            {metricLabel}{" "}
                            {metricLabel === "EPS"
                                ? "(₹)"
                                : "(₹ Cr)"}
                        </div>
                        <div className="text-right">
                            Growth
                        </div>
                        <div className="text-right">
                            Action
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-[minmax(160px,2fr)_minmax(80px,0.8fr)_minmax(80px,0.9fr)_minmax(80px,0.9fr)_minmax(80px,0.9fr)_minmax(70px,0.8fr)_70px] items-center px-5 pb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        <div>Company</div>
                        <div className="text-center">Period</div>
                        <div className="text-right">
                            Released
                        </div>
                        <div className="text-right">
                            Revenue
                        </div>
                        <div className="text-right">PAT</div>
                        <div className="text-right">EPS</div>
                        <div className="text-right">
                            Action
                        </div>
                    </div>
                )}

                <div className="mt-1 space-y-3">
                    {stocks.map((stock) => (
                        <EarningsTableRow
                            key={
                                stock.id ||
                                `${stock.symbol}-${stock.year}-${stock.quarter}`
                            }
                            stock={stock}
                            isTopStock={isTopStocks}
                            starred={watchlist.includes(
                                stock.symbol
                            )}
                            onToggleStar={toggleWatchlist}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
