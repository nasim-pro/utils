"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import type { Stock } from "./types";

interface EarningsTableRowProps {
    stock: Stock;
    rank?: number;
    isTopStock?: boolean;
    starred?: boolean;
    onToggleStar?: (symbol: string) => void;
}

function getSentimentPill(sentiment: Stock["sentiment"]) {
    switch (sentiment) {
        case "Beat":
            return "bg-[#00d084]/15 text-[#00d084] border border-[#00d084]/20";
        case "Miss":
            return "bg-red-500/15 text-red-400 border border-red-500/20";
        default:
            return "bg-slate-700/30 text-slate-300 border border-slate-600/30";
    }
}

export default function EarningsTableRow({
    stock,
    rank = 1,
    isTopStock = false,
    starred = false,
    onToggleStar,
}: EarningsTableRowProps) {
    const growthPositive = stock.patGrowth >= 0;

    // Render SVG Sparkline Trend based on trendType
    const renderTrendLine = (type: Stock["trendType"]) => {
        let strokeColor = "#00d084"; // Bullish green
        let points = "0,15 15,12 30,14 45,8 60,10 75,4";
        if (type === "bearish") {
            strokeColor = "#ef4444"; // Red
            points = "0,4 15,8 30,6 45,12 60,10 75,16";
        } else if (type === "neutral") {
            strokeColor = "#eab308"; // Yellow
            points = "0,10 15,10 30,8 45,11 60,9 75,10";
        }

        return (
            <svg className="h-5 w-20 mx-auto" viewBox="0 0 75 20" fill="none">
                <polyline
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                />
            </svg>
        );
    };

    if (isTopStock) {
        return (
            <div className="grid grid-cols-[70px_minmax(220px,2fr)_minmax(120px,1fr)_minmax(90px,0.8fr)_120px_90px_120px] items-center rounded-2xl bg-[#08101d] px-4 py-3.5 transition hover:bg-[#0c1626] border border-white/[0.02]">
                {/* Rank & Star */}
                <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00d084]/10 text-xs font-bold text-[#00d084]">
                        {rank}
                    </span>
                    <button
                        type="button"
                        onClick={() => onToggleStar?.(stock.symbol)}
                        className="text-slate-600 transition hover:text-yellow-400"
                    >
                        <Star
                            className={`h-3.5 w-3.5 ${starred ? "fill-yellow-400 text-yellow-400" : "text-slate-600"
                                }`}
                        />
                    </button>
                </div>

                {/* Company & Details */}
                <div className="min-w-0 pr-4">
                    <Link href={`/apps/stockjump/dashboard/${stock.symbol.toLowerCase()}`} className="block truncate">
                        <p className="truncate text-[13px] font-bold text-white hover:text-[#00d084] transition">
                            {stock.companyName}
                        </p>
                        <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                            {stock.symbol} • NSE <span className="text-slate-600">•</span> {stock.sector}
                        </p>
                    </Link>
                </div>

                {/* PAT */}
                <div className="text-right text-[13px] font-bold text-slate-200">
                    {stock.pat}
                </div>

                {/* EPS */}
                <div className="text-right text-[13px] font-semibold text-slate-300">
                    ₹{stock.eps}
                </div>

                {/* Trend Sparkline */}
                <div className="text-center">
                    {renderTrendLine(stock.trendType || "bullish")}
                </div>

                {/* Score */}
                <div className="text-center">
                    <span className={`text-[14px] font-black ${(stock.score || 70) > 80 ? "text-[#00d084]" : (stock.score || 70) > 60 ? "text-yellow-400" : "text-red-400"
                        }`}>
                        {stock.score || 75}
                    </span>
                </div>

                {/* View Details Button */}
                <div className="text-right">
                    <Link
                        href={`/apps/stockjump/dashboard/${stock.symbol.toLowerCase()}`}
                        className="inline-flex items-center justify-center rounded-xl bg-[#00d084]/15 px-3.5 py-2 text-xs font-bold text-[#00d084] transition hover:bg-[#00d084] hover:text-[#06111d]"
                    >
                        View Details →
                    </Link>
                </div>
            </div>
        );
    }

    // Default Recent / All Stocks Row Layout
    return (
        <div className="grid grid-cols-[1.8fr_1fr_1fr_1fr_0.7fr_0.9fr_0.9fr_50px] items-center rounded-2xl bg-[#08101d] px-4 py-3.5 transition hover:bg-[#0c1626] border border-white/[0.02]">
            <div className="flex min-w-0 items-center gap-3">
                <button
                    type="button"
                    onClick={() => onToggleStar?.(stock.symbol)}
                    className="shrink-0 text-slate-600 transition hover:text-yellow-400"
                >
                    <Star
                        className={`h-4 w-4 ${starred ? "fill-yellow-400 text-yellow-400" : "text-slate-600"
                            }`}
                    />
                </button>
                <Link href={`/apps/stockjump/dashboard/${stock.symbol.toLowerCase()}`} className="min-w-0">
                    <p className="truncate text-[13px] font-bold text-white">{stock.companyName}</p>
                    <p className="mt-0.5 text-[11px] font-medium text-slate-500">{stock.symbol}</p>
                </Link>
            </div>
            <div className="truncate text-[13px] text-slate-400 font-normal">{stock.sector}</div>
            <div className="text-right text-[13px] font-semibold text-slate-200">{stock.revenue}</div>
            <div className="text-right text-[13px] font-semibold text-slate-200">{stock.pat}</div>
            <div className="text-right text-[13px] font-semibold text-slate-200">{stock.eps}</div>
            <div className={`text-right text-[13px] font-bold ${growthPositive ? "text-[#00d084]" : "text-red-400"}`}>
                {growthPositive ? "+" : ""}{stock.patGrowth.toFixed(1)}%
            </div>
            <div className="flex justify-center">
                <span className={`rounded-full px-3 py-0.5 text-[11px] font-semibold tracking-wide ${getSentimentPill(stock.sentiment)}`}>
                    {stock.sentiment}
                </span>
            </div>
            <div className="flex justify-end">
                <Link
                    href={`/apps/stockjump/dashboard/${stock.symbol.toLowerCase()}`}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#121c2d] text-slate-300 transition hover:bg-[#1a273c] hover:text-white"
                >
                    →
                </Link>
            </div>
        </div>
    );
}