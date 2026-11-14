"use client";

import EarningsTableRow from "./EarningsTableRow";
import type { Stock } from "./types";

interface EarningsTableProps {
    stocks: Stock[];
    isTopStocks?: boolean;
    metricLabel?: string;
    starredSymbols?: string[];
    onToggleStar?: (symbol: string) => void;
}

export default function EarningsTable({
    stocks,
    isTopStocks = false,
    metricLabel = "Net profit",
    starredSymbols = [],
    onToggleStar,
}: EarningsTableProps) {
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
                    <div className="hidden grid-cols-[40px_minmax(180px,2fr)_minmax(100px,1fr)_minmax(100px,1fr)_minmax(70px,0.7fr)_56px] items-center px-5 pb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 lg:grid">
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
                        <div className="text-right">OPM</div>
                        <div className="text-right">
                            Action
                        </div>
                    </div>
                ) : (
                    <div className="hidden grid-cols-[minmax(180px,2fr)_minmax(90px,0.9fr)_minmax(100px,0.9fr)_minmax(90px,0.9fr)_minmax(90px,0.9fr)_minmax(70px,0.7fr)_minmax(80px,0.8fr)_56px] items-center px-5 pb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 lg:grid">
                        <div>Company</div>
                        <div className="text-center">Period</div>
                        <div className="text-right">
                            Released
                        </div>
                        <div className="text-right">
                            Revenue
                        </div>
                        <div className="text-right">PAT</div>
                        <div
                            className="text-right"
                            title="Operating profit margin"
                        >
                            OPM
                        </div>
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
                            starred={starredSymbols.includes(
                                stock.symbol.toUpperCase()
                            )}
                            onToggleStar={onToggleStar}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
