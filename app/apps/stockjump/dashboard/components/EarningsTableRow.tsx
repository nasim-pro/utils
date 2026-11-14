"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import type { Stock } from "./types";
import {
    formatCrores,
    formatDate,
    formatGrowth,
    formatMargin,
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

function ReleaseBadge({ stock }: { stock: Stock }) {
    if (!stock.releaseSession) {
        return null;
    }

    return (
        <span
            className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold ${
                stock.isAfterHours
                    ? "bg-amber-400/10 text-amber-300"
                    : "bg-slate-700/40 text-slate-400"
            }`}
            title={
                stock.isAfterHours
                    ? "Released outside market hours — the market reacts on the next trading day."
                    : "Released during market hours."
            }
        >
            {stock.releaseSession}
        </span>
    );
}

function Metric({
    label,
    value,
    className = "",
    title,
}: {
    label: string;
    value: string;
    className?: string;
    title?: string;
}) {
    return (
        <div className="text-right">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500 lg:hidden">
                {label}
            </p>
            <p
                className={`text-[12px] font-semibold text-slate-300 ${className}`}
                title={title}
            >
                {value}
            </p>
        </div>
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
            aria-label={`${starred ? "Remove" : "Add"} ${symbol} ${
                starred ? "from" : "to"
            } watchlist`}
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
            <div className="rounded-2xl border border-white/[0.03] bg-[#08101d] px-4 py-4 transition hover:bg-[#0c1626] sm:px-5">
                <div className="hidden items-center gap-3 lg:grid lg:grid-cols-[40px_minmax(180px,2fr)_minmax(100px,1fr)_minmax(100px,1fr)_minmax(70px,0.7fr)_56px]">
                    <div className="flex items-center">
                        {starButton}
                    </div>

                    <Link href={detailUrl} className="min-w-0">
                        <p className="truncate text-[13px] font-bold text-white transition hover:text-[#00d084]">
                            {companyName}
                        </p>

                        <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-slate-500">
                            <span>{symbol}</span>
                            <span className="text-slate-600">•</span>
                            <span>{period}</span>
                            <BasisBadge
                                consolidated={stock.consolidated}
                            />
                        </p>
                    </Link>

                    <div
                        className="text-right text-[13px] font-bold text-slate-200"
                        title={
                            stock.comparisonNote ?? undefined
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

                    <div className="text-right text-[11px] font-semibold text-slate-400">
                        {formatMargin(stock.operatingMargin)}
                    </div>

                    <div className="text-right">{actionLink}</div>
                </div>

                <div className="lg:hidden">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                            {starButton}

                            <Link
                                href={detailUrl}
                                className="min-w-0"
                            >
                                <p className="truncate text-[13px] font-bold text-white">
                                    {companyName}
                                </p>
                                <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] font-medium text-slate-500">
                                    <span>{symbol}</span>
                                    <span>•</span>
                                    <span>{period}</span>
                                    <BasisBadge
                                        consolidated={
                                            stock.consolidated
                                        }
                                    />
                                </p>
                            </Link>
                        </div>

                        {actionLink}
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-3">
                        <Metric
                            label={
                                stock.metricLabel ?? "Metric"
                            }
                            value={
                                isEps
                                    ? formatRupees(
                                          stock.currentValue
                                      )
                                    : formatCrores(
                                          stock.currentValue
                                      )
                            }
                        />
                        <Metric
                            label="Growth"
                            value={formatGrowth(stock.growth)}
                            className={growthClass(
                                stock.growth
                            )}
                        />
                        <Metric
                            label="OPM"
                            value={formatMargin(
                                stock.operatingMargin
                            )}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-white/[0.03] bg-[#08101d] px-4 py-4 transition hover:bg-[#0c1626] sm:px-5">
            <div className="hidden items-center lg:grid lg:grid-cols-[minmax(180px,2fr)_minmax(90px,0.9fr)_minmax(100px,0.9fr)_minmax(90px,0.9fr)_minmax(90px,0.9fr)_minmax(70px,0.7fr)_minmax(80px,0.8fr)_56px]">
                <div className="flex min-w-0 items-center gap-3.5 pr-4">
                    {starButton}

                    <Link href={detailUrl} className="min-w-0">
                        <p className="truncate text-[13px] font-bold text-white transition hover:text-[#00d084]">
                            {companyName}
                        </p>

                        <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500">
                            {symbol}
                            {sector !== "-"
                                ? ` • ${sector}`
                                : ""}
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

                <div className="flex flex-col items-end gap-1">
                    <span className="text-[12px] font-medium text-slate-400">
                        {formatDate(stock.broadcastDate)}
                    </span>

                    <ReleaseBadge stock={stock} />
                </div>

                <Metric
                    label="Revenue"
                    value={formatCrores(stock.revenue)}
                    title={
                        stock.legacyUnits
                            ? "Units inferred from a legacy API response"
                            : undefined
                    }
                />

                <Metric
                    label="PAT"
                    value={formatCrores(stock.netProfit)}
                />

                <Metric
                    label="OPM"
                    value={formatMargin(
                        stock.operatingMargin
                    )}
                    title="Operating profit margin (operating profit ÷ revenue)"
                />

                <Metric label="EPS" value={eps} />

                <div className="text-right">{actionLink}</div>
            </div>

            <div className="lg:hidden">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                        {starButton}

                        <Link
                            href={detailUrl}
                            className="min-w-0"
                        >
                            <p className="truncate text-[13px] font-bold text-white">
                                {companyName}
                            </p>
                            <p className="mt-0.5 truncate text-[10px] font-medium text-slate-500">
                                {symbol}
                                {sector !== "-"
                                    ? ` • ${sector}`
                                    : ""}
                            </p>
                        </Link>
                    </div>

                    {actionLink}
                </div>

                <div className="mt-3 grid grid-cols-4 gap-2">
                    <Metric
                        label="Revenue"
                        value={formatCrores(stock.revenue)}
                    />
                    <Metric
                        label="PAT"
                        value={formatCrores(stock.netProfit)}
                    />
                    <Metric
                        label="OPM"
                        value={formatMargin(
                            stock.operatingMargin
                        )}
                    />
                    <Metric label="EPS" value={eps} />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/[0.04] pt-2.5">
                    <span className="rounded-lg border border-slate-700/50 bg-slate-800/60 px-2 py-1 text-[10px] font-bold text-slate-300">
                        {period}
                    </span>

                    <BasisBadge
                        consolidated={stock.consolidated}
                    />

                    <span className="text-[10px] font-medium text-slate-500">
                        {formatDate(stock.broadcastDate)}
                    </span>

                    <ReleaseBadge stock={stock} />

                    {stock.legacyUnits && (
                        <span className="text-[10px] font-medium text-amber-400/80">
                            * unit metadata missing
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
