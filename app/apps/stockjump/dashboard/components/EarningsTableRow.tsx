"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import type { Stock } from "./types";

interface EarningsTableRowProps {
    stock: Stock;
    isTopStock?: boolean;
    starred?: boolean;
    onToggleStar?: (symbol: string) => void;
}

function getStockDetailUrl(symbol: string) {
    return `/apps/stockjump/dashboard/stock?symbol=${encodeURIComponent(
        symbol.toUpperCase()
    )}`;
}

export default function EarningsTableRow({
    stock,
    isTopStock = false,
    starred = false,
    onToggleStar,
}: EarningsTableRowProps) {
    const detailUrl = getStockDetailUrl(stock.symbol);

    const formatDate = (dateString?: string) => {
        if (!dateString) {
            return "-";
        }

        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return "-";
        }

        return new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).format(date);
    };

    const companyName =
        stock.companyName ||
        stock.stockName ||
        stock.symbol ||
        "-";

    const symbol = stock.symbol || "-";

    const sector = stock.sector || "-";

    const pat =
        stock.pat === undefined ||
            stock.pat === null ||
            stock.pat === ""
            ? "-"
            : stock.pat;

    const revenue =
        stock.revenue === undefined ||
            stock.revenue === null 
            ? "-"
            : stock.revenue;

    const eps =
        stock.eps === undefined ||
            stock.eps === null ||
            stock.eps === ""
            ? "-"
            : stock.eps;

    if (isTopStock) {
        return (
            <div className="grid grid-cols-[60px_minmax(180px,2fr)_minmax(100px,1fr)_minmax(80px,0.8fr)_70px] items-center rounded-2xl border border-white/[0.03] bg-[#08101d] px-5 py-4 transition hover:bg-[#0c1626]">
                {/* Star */}
                <div className="flex items-center">
                    <button
                        type="button"
                        onClick={() =>
                            onToggleStar?.(stock.symbol)
                        }
                        className="text-slate-600 transition hover:text-yellow-400"
                        aria-label={`Watch ${symbol}`}
                    >
                        <Star
                            className={`h-4 w-4 ${starred
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-slate-600"
                                }`}
                        />
                    </button>
                </div>

                {/* Company */}
                <div className="min-w-0 pr-4">
                    <Link
                        href={detailUrl}
                        className="block truncate"
                    >
                        <p className="truncate text-[13px] font-bold text-white transition hover:text-[#00d084]">
                            {companyName}
                        </p>

                        <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                            {symbol} • NSE{" "}
                            <span className="text-slate-600">
                                •
                            </span>{" "}
                            {sector}
                        </p>
                    </Link>
                </div>

                {/* PAT */}
                <div className="text-right text-[13px] font-bold text-slate-200">
                    {pat}
                </div>

                {/* EPS */}
                <div className="text-right text-[13px] font-semibold text-slate-300">
                    {eps === "-" ? "-" : `₹${eps}`}
                </div>

                {/* Action */}
                <div className="text-right">
                    <Link
                        href={detailUrl}
                        aria-label={`View ${symbol}`}
                        className="inline-flex items-center justify-center rounded-xl bg-[#00d084]/15 px-3 py-2 text-xs font-bold text-[#00d084] transition hover:bg-[#00d084] hover:text-[#06111d]"
                    >
                        →
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-[minmax(160px,2fr)_minmax(70px,0.8fr)_minmax(80px,0.9fr)_minmax(80px,0.9fr)_minmax(70px,0.8fr)_minmax(80px,0.9fr)_70px] items-center rounded-2xl border border-white/[0.03] bg-[#08101d] px-5 py-4 transition hover:bg-[#0c1626]">
            {/* Company */}
            <div className="flex min-w-0 items-center gap-3.5 pr-4">
                <button
                    type="button"
                    onClick={() =>
                        onToggleStar?.(stock.symbol)
                    }
                    className="shrink-0 text-slate-600 transition hover:text-yellow-400"
                    aria-label={`Watch ${symbol}`}
                >
                    <Star
                        className={`h-4 w-4 ${starred
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-slate-600"
                            }`}
                    />
                </button>

                <Link
                    href={detailUrl}
                    className="min-w-0"
                >
                    <p className="truncate text-[13px] font-bold text-white transition hover:text-[#00d084]">
                        {companyName}
                    </p>

                    <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                        {symbol}
                    </p>
                </Link>
            </div>

            {/* Quarter / Year */}
            <div className="text-center">
                <span className="inline-flex items-center rounded-lg border border-slate-700/50 bg-slate-800/60 px-2 py-1 text-[11px] font-bold text-slate-300">
                    {stock.quarter || "-"}{" "}
                    {stock.year || "-"}
                </span>
            </div>

            {/* Release Date */}
            <div className="text-right text-[12px] font-medium text-slate-400">
                {formatDate(stock.broadcastDate)}
            </div>

            {/* Revenue */}
            <div className="text-right text-[13px] font-semibold text-slate-200">
                {revenue}
            </div>

            {/* PAT */}
            <div className="text-right text-[13px] font-semibold text-slate-200">
                {pat}
            </div>

            {/* EPS */}
            <div className="text-right text-[13px] font-semibold text-slate-300">
                {eps === "-" ? "-" : `₹${eps}`}
            </div>

            {/* Action */}
            <div className="text-right">
                <Link
                    href={detailUrl}
                    aria-label={`View ${symbol}`}
                    className="inline-flex items-center justify-center rounded-xl bg-[#00d084]/15 px-3 py-2 text-xs font-bold text-[#00d084] transition hover:bg-[#00d084] hover:text-[#06111d]"
                >
                    →
                </Link>
            </div>
        </div>
    );
}