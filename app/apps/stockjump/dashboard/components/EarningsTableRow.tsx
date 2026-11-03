"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import type { Stock } from "./types";
import {
    formatCrores,
    formatDate,
    formatGrowth,
    formatRupees,
    growthClass,
    periodLabel,
} from "../lib/format";

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

function BasisBadge({
    consolidated,
}: {
    consolidated?: boolean;
}) {
    return (
        <span
            className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                consolidated
                    ? "bg-[#00d084]/10 text-[#00d084]"
                    : "bg-slate-700/40 text-slate-400"
            }`}
        >
            {consolidated ? "Consol." : "Standalone"}
        </span>
    );
}

export default function EarningsTableRow({
    stock,
    isTopStock = false,
    starred = false,
    onToggleStar,
}: EarningsTableRowProps) {
    const detailUrl = getStockDetailUrl(stock.symbol);

    const companyName =
        stock.companyName ||
        stock.stockName ||
        stock.symbol ||
        "-";

    const symbol = stock.symbol || "-";
    const sector = stock.sector || "-";
    const period = periodLabel(stock.year, stock.quarter);

    const eps = formatRupees(stock.eps);

    const starButton = (
        <button
            type="button"
            onClick={() => onToggleStar?.(stock.symbol)}
            className="shrink-0 text-slate-600 transition hover:text-yellow-400"
            aria-label={`Watch ${symbol}`}
        >
            <Star
                className={`h-4 w-4 ${
                    starred
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-slate-600"
                }`}
            />
        </button>
    );

    const actionLink = (
        <Link
            href={detailUrl}
            aria-label={`View ${symbol}`}
            className="inline-flex items-center justify-center rounded-xl bg-[#00d084]/15 px-3 py-2 text-xs font-bold text-[#00d084] transition hover:bg-[#00d084] hover:text-[#06111d]"
        >
            →
        </Link>
    );

    if (isTopStock) {
        const isEps = stock.metricLabel === "EPS";

        return (
            <div className="grid grid-cols-[60px_minmax(180px,2fr)_minmax(100px,1fr)_minmax(100px,1fr)_70px] items-center rounded-2xl border border-white/[0.03] bg-[#08101d] px-5 py-4 transition hover:bg-[#0c1626]">
                <div className="flex items-center">
                    {starButton}
                </div>

                <div className="min-w-0 pr-4">
                    <Link
                        href={detailUrl}
                        className="block truncate"
                    >
                        <p className="truncate text-[13px] font-bold text-white transition hover:text-[#00d084]">
                            {companyName}
                        </p>

                        <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-slate-500">
                            <span>{symbol}</span>
                            <span className="text-slate-600">
                                •
                            </span>
                            <span>{period}</span>
                            <BasisBadge
                                consolidated={
                                    stock.consolidated
                                }
                            />
                        </p>
                    </Link>
                </div>

                <div
                    className="text-right text-[13px] font-bold text-slate-200"
                    title={
                        stock.legacyUnits
                            ? "Units inferred from a legacy API response"
                            : undefined
                    }
                >
                    {isEps
                        ? formatRupees(stock.currentValue)
                        : formatCrores(stock.currentValue)}
                    {stock.legacyUnits && (
                        <span className="ml-1 text-[9px] font-semibold text-amber-400/80">
                            *
                        </span>
                    )}
                </div>

                <div
                    className={`text-right text-[13px] font-bold ${growthClass(
                        stock.growth
                    )}`}
                >
                    {formatGrowth(stock.growth)}
                </div>

                <div className="text-right">
                    {actionLink}
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-[minmax(160px,2fr)_minmax(80px,0.8fr)_minmax(80px,0.9fr)_minmax(80px,0.9fr)_minmax(80px,0.9fr)_minmax(70px,0.8fr)_70px] items-center rounded-2xl border border-white/[0.03] bg-[#08101d] px-5 py-4 transition hover:bg-[#0c1626]">
            <div className="flex min-w-0 items-center gap-3.5 pr-4">
                {starButton}

                <Link href={detailUrl} className="min-w-0">
                    <p className="truncate text-[13px] font-bold text-white transition hover:text-[#00d084]">
                        {companyName}
                    </p>

                    <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500">
                        {symbol}
                        {sector !== "-" ? ` • ${sector}` : ""}
                    </p>
                </Link>
            </div>

            <div className="flex flex-col items-center gap-1">
                <span className="inline-flex items-center rounded-lg border border-slate-700/50 bg-slate-800/60 px-2 py-1 text-[11px] font-bold text-slate-300">
                    {period}
                </span>

                <BasisBadge
                    consolidated={stock.consolidated}
                />
            </div>

            <div className="text-right text-[12px] font-medium text-slate-400">
                {formatDate(stock.broadcastDate)}
            </div>

            <div
                className="text-right text-[13px] font-semibold text-slate-200"
                title={
                    stock.legacyUnits
                        ? "Units inferred from a legacy API response"
                        : undefined
                }
            >
                {formatCrores(stock.revenue)}
                {stock.legacyUnits && (
                    <span className="ml-1 text-[9px] font-semibold text-amber-400/80">
                        *
                    </span>
                )}
            </div>

            <div className="text-right text-[13px] font-semibold text-slate-200">
                {formatCrores(stock.netProfit)}
            </div>

            <div className="text-right text-[13px] font-semibold text-slate-300">
                {eps}
            </div>

            <div className="text-right">{actionLink}</div>
        </div>
    );
}
