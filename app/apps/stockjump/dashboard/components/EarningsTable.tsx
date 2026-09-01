"use client";

import { useState, useEffect } from "react";
import EarningsTableRow from "./EarningsTableRow";
import type { Stock } from "./types";
import { appConfig } from "../../config";

interface EarningsTableProps {
    stocks?: Stock[];
    isTopStocks?: boolean;
}

export default function EarningsTable({ stocks: initialStocks, isTopStocks = false }: EarningsTableProps) {
    const [watchlist, setWatchlist] = useState<string[]>(["HDFCBANK"]);
    const [stocks, setStocks] = useState<Stock[]>(initialStocks || []);
    const [loading, setLoading] = useState<boolean>(!initialStocks);

    // useEffect(() => {
    //     if (!initialStocks) {
    //         async function fetchRecentEarnings() {
    //             try {
    //                 const response = await fetch(`${appConfig.api.baseUrl}/api/recent/quarterly`);
    //                 const result = await response.json();

    //                 const items = Array.isArray(result) ? result : (result.data || result.stocks || []);

    //                 if (items.length > 0) {
    //                     const formattedStocks: Stock[] = items.map((item: any) => ({
    //                         symbol: item.symbol || "",
    //                         companyName: item.stockName || item.companyName || "",
    //                         sector: item.sector || "General",
    //                         revenue: item.revenue ? `₹${(item.revenue / 100).toFixed(1)} Cr` : "N/A",
    //                         pat: item.netProfit ? `₹${(item.netProfit / 100).toFixed(1)} Cr` : "N/A",
    //                         eps: item.eps !== undefined && item.eps !== null ? item.eps.toFixed(2) : "0.00",
    //                         patGrowth: item.patGrowth || 0.0,
    //                         sentiment: item.sentiment || "In-Line",
    //                         quarter: item.quarter,
    //                         year: item.year,
    //                         broadcastDate: item.broadcastDate,
    //                         trendType: "bullish",
    //                     }));
    //                     setStocks(formattedStocks);
    //                 }
    //             } catch (error) {
    //                 console.error("Failed to fetch recent quarterly earnings:", error);
    //             } finally {
    //                 setLoading(false);
    //             }
    //         }

    //         fetchRecentEarnings();
    //     }
    // }, [initialStocks]);

    function toggleWatchlist(symbol: string) {
        setWatchlist((current) =>
            current.includes(symbol)
                ? current.filter((item) => item !== symbol)
                : [...current, symbol]
        );
    }

    if (loading) {
        return (
            <div className="w-full py-12 text-center text-sm font-medium text-slate-500">
                Loading recent earnings...
            </div>
        );
    }

    return (
        <div className="w-full overflow-hidden">
            <div className="w-full">
                {/* Header Grid */}
                {isTopStocks ? (
                    <div className="grid grid-cols-[60px_minmax(180px,2fr)_minmax(100px,1fr)_minmax(80px,0.8fr)_100px_70px] items-center px-5 pb-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                        <div>Star</div>
                        <div>Company</div>
                        <div className="text-right">PAT (₹ Cr)</div>
                        <div className="text-right">EPS</div>
                        <div className="text-right">Action</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-[minmax(160px,2fr)_minmax(70px,0.8fr)_minmax(80px,0.9fr)_minmax(80px,0.9fr)_minmax(70px,0.8fr)_minmax(80px,0.9fr)_70px] items-center px-5 pb-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                        <div>Company</div>
                        <div className="text-center">Period</div>
                        <div className="text-right">Release Date</div>
                        <div className="text-right">Revenue</div>
                        <div className="text-right">PAT</div>
                        <div className="text-right">EPS</div>
                        <div className="text-right">Action</div>
                    </div>
                )}

                {/* Rows container */}
                <div className="space-y-3 mt-1">
                    {stocks.map((stock) => (
                        <EarningsTableRow
                            key={stock.symbol}
                            stock={stock}
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