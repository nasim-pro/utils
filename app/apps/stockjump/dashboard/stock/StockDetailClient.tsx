"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Send, Star, ArrowLeft } from "lucide-react";
import DashboardHeader from "../components/DashboardHeader";
import { appConfig } from "../../config";

interface StockDetailClientProps {
    symbol: string;
}

interface QuarterlyStock {
    _id?: string;
    quarter?: string;
    year?: number;
    symbol?: string;
    ISIN?: string | null;
    bookValue?: number | null;
    broadcastDate?: string | null;
    currentPrice?: number | null;
    debt?: number | null;
    marketCap?: number | null;
    netProfit?: number | null;
    nseFilingId?: string | null;
    operatingProfit?: number | null;
    profitBeforeTax?: number | null;
    promoterHolding?: number | null;
    revenue?: number | null;
    stockName?: string | null;
}

interface YearlyStock {
    year?: number;
    symbol?: string;
    ISIN?: string | null;
    bookValue?: number | null;
    broadcastDate?: string | null;
    currentPrice?: number | null;
    debt?: number | null;
    marketCap?: number | null;
    netProfit?: number | null;
    nseFilingId?: string | null;
    operatingProfit?: number | null;
    pb?: number | null;
    pe?: number | null;
    profitBeforeTax?: number | null;
    promoterHolding?: number | null;
    revenue?: number | null;
    stockName?: string | null;
}

interface ApiResponse<T> {
    success?: boolean;
    symbol?: string;
    count?: number;
    data?: T[];
}

/**
 * The existing API contains financial values from different data sources
 * with inconsistent scales.
 *
 * Values >= 1,000,000 are treated as lakh values and converted to ₹ Cr.
 * Smaller values are already treated as ₹ Cr.
 *
 * This is only a frontend compatibility layer. Ideally the backend should
 * eventually normalize all financial values to one unit.
 */
function toCrores(value?: number | null): number | null {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return null;
    }

    return Math.abs(value) >= 1_000_000 ? value / 100 : value;
}

function formatCr(value?: number | null): string {
    const crores = toCrores(value);

    if (crores === null) {
        return "-";
    }

    return `₹${crores.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })} Cr`;
}

function formatNumber(
    value?: number | null,
    suffix = ""
): string {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return "-";
    }

    return `${value.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}${suffix}`;
}

function formatPrice(value?: number | null): string {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return "-";
    }

    return `₹${value.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}`;
}

function formatMarketCap(value?: number | null): string {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return "-";
    }

    return `₹${value.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })} Cr`;
}

function formatDate(dateString?: string | null): string {
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
}

function calculateGrowth(
    current?: number | null,
    previous?: number | null
): number | null {
    if (
        current === null ||
        current === undefined ||
        previous === null ||
        previous === undefined ||
        previous === 0
    ) {
        return null;
    }

    return ((current - previous) / Math.abs(previous)) * 100;
}

function formatGrowth(value: number | null): string {
    if (value === null || !Number.isFinite(value)) {
        return "-";
    }

    const rounded = Math.abs(value).toFixed(1);

    if (value > 0) {
        return `↑ +${rounded}%`;
    }

    if (value < 0) {
        return `↓ -${rounded}%`;
    }

    return "→ 0.0%";
}

function growthClass(value: number | null): string {
    if (value === null) {
        return "text-slate-500";
    }

    if (value > 0) {
        return "text-[#00d084]";
    }

    if (value < 0) {
        return "text-red-400";
    }

    return "text-slate-400";
}

const quarterOrder: Record<string, number> = {
    Q1: 1,
    Q2: 2,
    Q3: 3,
    Q4: 4,
};

function sortQuarterlyData(
    data: QuarterlyStock[]
): QuarterlyStock[] {
    return [...data].sort((a, b) => {
        const yearA = a.year ?? 0;
        const yearB = b.year ?? 0;

        if (yearA !== yearB) {
            return yearB - yearA;
        }

        return (
            (quarterOrder[b.quarter ?? ""] ?? 0) -
            (quarterOrder[a.quarter ?? ""] ?? 0)
        );
    });
}

export default function StockDetailClient({
    symbol,
}: StockDetailClientProps) {
    const ticker = symbol.toUpperCase();

    const [activeTab, setActiveTab] = useState<
        "Financials" | "Growth" | "Fundamentals" | "AI Insights"
    >("Financials");

    const [starred, setStarred] = useState(false);

    const [quarterlyData, setQuarterlyData] = useState<
        QuarterlyStock[]
    >([]);

    const [yearlyData, setYearlyData] = useState<
        YearlyStock[]
    >([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchStockData() {
            try {
                setLoading(true);
                setError("");

                const token = localStorage.getItem("stockjump_token");

                const headers: HeadersInit = {
                    ...(token
                        ? {
                            Authorization: `Bearer ${token}`,
                        }
                        : {}),
                };

                const encodedSymbol = encodeURIComponent(symbol);

                const [
                    quarterlyResponse,
                    yearlyResponse,
                ] = await Promise.all([
                    fetch(
                        `${appConfig.api.baseUrl}/api/stocks/${encodedSymbol}/quarterly`,
                        {
                            headers,
                        }
                    ),
                    fetch(
                        `${appConfig.api.baseUrl}/api/stocks/${encodedSymbol}/yearly`,
                        {
                            headers,
                        }
                    ),
                ]);

                if (!quarterlyResponse.ok) {
                    throw new Error(
                        "Failed to load quarterly data"
                    );
                }

                if (!yearlyResponse.ok) {
                    throw new Error(
                        "Failed to load yearly data"
                    );
                }

                const [quarterly, yearly] =
                    await Promise.all([
                        quarterlyResponse.json() as Promise<
                            ApiResponse<QuarterlyStock>
                        >,
                        yearlyResponse.json() as Promise<
                            ApiResponse<YearlyStock>
                        >,
                    ]);

                setQuarterlyData(
                    sortQuarterlyData(quarterly.data ?? [])
                );

                setYearlyData(
                    [...(yearly.data ?? [])].sort(
                        (a, b) =>
                            (b.year ?? 0) - (a.year ?? 0)
                    )
                );
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load stock data"
                );
            } finally {
                setLoading(false);
            }
        }

        fetchStockData();
    }, [symbol]);

    const latestQuarter = quarterlyData[0];
    const previousQuarter = quarterlyData[1];

    const latestYear = yearlyData[0];
    const previousYear = yearlyData[1];

    const companyName =
        latestQuarter?.stockName ||
        latestYear?.stockName ||
        ticker;

    const latestPeriod =
        latestQuarter?.quarter && latestQuarter?.year
            ? `${latestQuarter.quarter} FY${latestQuarter.year}`
            : "-";

    const revenueGrowth = calculateGrowth(
        latestQuarter?.revenue,
        previousQuarter?.revenue
    );

    const patGrowth = calculateGrowth(
        latestQuarter?.netProfit,
        previousQuarter?.netProfit
    );

    const operatingProfitGrowth = calculateGrowth(
        latestQuarter?.operatingProfit,
        previousQuarter?.operatingProfit
    );

    const priceGrowth = calculateGrowth(
        latestQuarter?.currentPrice,
        previousQuarter?.currentPrice
    );

    const quarterlyChartData = useMemo(() => {
        return [...quarterlyData]
            .reverse()
            .slice(-6);
    }, [quarterlyData]);

    const maxRevenue = Math.max(
        ...quarterlyChartData.map(
            (item) => toCrores(item.revenue) ?? 0
        ),
        1
    );

    const maxPat = Math.max(
        ...quarterlyChartData.map(
            (item) => toCrores(item.netProfit) ?? 0
        ),
        1
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-[#070d18] text-white">
                <DashboardHeader />

                <main className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    <div className="rounded-2xl border border-white/[0.06] bg-[#0b1422] p-10 text-center">
                        <p className="text-sm font-medium text-slate-400">
                            Loading {ticker} data...
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#070d18] text-white">
                <DashboardHeader />

                <main className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    <div className="rounded-2xl border border-red-500/20 bg-[#0b1422] p-10 text-center">
                        <p className="text-sm font-semibold text-red-400">
                            {error}
                        </p>

                        <Link
                            href="/apps/stockjump/dashboard"
                            className="mt-5 inline-flex rounded-xl bg-[#00d084]/15 px-4 py-2 text-xs font-bold text-[#00d084]"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    if (!latestQuarter && !latestYear) {
        return (
            <div className="min-h-screen bg-[#070d18] text-white">
                <DashboardHeader />

                <main className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    <div className="rounded-2xl border border-white/[0.06] bg-[#0b1422] p-10 text-center">
                        <p className="text-sm font-semibold text-slate-300">
                            No financial data available for{" "}
                            {ticker}.
                        </p>

                        <Link
                            href="/apps/stockjump/dashboard"
                            className="mt-5 inline-flex rounded-xl bg-[#00d084]/15 px-4 py-2 text-xs font-bold text-[#00d084]"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#070d18] text-white">
            <DashboardHeader />

            <main className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
                {/* Back / Breadcrumb */}
                <div className="mb-6 flex items-center justify-between">
                    <Link
                        href="/apps/stockjump/dashboard"
                        className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0b1422] px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Dashboard
                    </Link>

                    <div className="hidden items-center gap-2 text-xs font-medium text-slate-400 sm:flex">
                        <Link
                            href="/apps/stockjump/dashboard"
                            className="transition hover:text-white"
                        >
                            Dashboard
                        </Link>

                        <span>›</span>

                        <span className="font-semibold text-slate-200">
                            {companyName}
                        </span>
                    </div>
                </div>

                {/* Stock Header */}
                <div className="relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#0b1422] p-6 shadow-md sm:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                                    {companyName}
                                </h1>

                                <span className="rounded-lg border border-[#00d084]/20 bg-[#12221b] px-2.5 py-1 text-xs font-bold tracking-wide text-[#00d084]">
                                    {ticker}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5 pt-1">
                                <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/5 bg-[#131d2e] px-3 py-1.5 text-xs font-medium text-slate-300">
                                    📅 {latestPeriod}
                                </span>

                                <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/5 bg-[#131d2e] px-3 py-1.5 text-xs font-medium text-slate-300">
                                    Released{" "}
                                    {formatDate(
                                        latestQuarter?.broadcastDate ??
                                        latestYear?.broadcastDate
                                    )}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setStarred(!starred)}
                            className={`flex h-11 w-11 shrink-0 items-center justify-center self-start rounded-2xl border transition lg:self-center ${starred
                                    ? "border-yellow-400/40 bg-yellow-400/10 text-yellow-400"
                                    : "border-white/10 bg-[#121c2e] text-slate-400 hover:text-white"
                                }`}
                            aria-label="Bookmark stock"
                        >
                            <Star
                                className={`h-5 w-5 ${starred
                                        ? "fill-yellow-400 text-yellow-400"
                                        : ""
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mt-8 flex gap-8 overflow-x-auto border-b border-white/[0.06]">
                    {(
                        [
                            "Financials",
                            "Growth",
                            "Fundamentals",
                            "AI Insights",
                        ] as const
                    ).map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`relative whitespace-nowrap pb-3 text-xs font-bold transition sm:text-sm ${activeTab === tab
                                    ? "text-[#00d084]"
                                    : "text-slate-400 hover:text-slate-200"
                                }`}
                        >
                            {tab}

                            {activeTab === tab && (
                                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00d084]" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Financials */}
                {activeTab === "Financials" && (
                    <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
                        <div className="space-y-8 lg:col-span-2">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                {[
                                    {
                                        label: "REVENUE",
                                        value: formatCr(
                                            latestQuarter?.revenue
                                        ),
                                        change: formatGrowth(
                                            revenueGrowth
                                        ),
                                        changeValue: revenueGrowth,
                                    },
                                    {
                                        label: "NET PROFIT",
                                        value: formatCr(
                                            latestQuarter?.netProfit
                                        ),
                                        change: formatGrowth(
                                            patGrowth
                                        ),
                                        changeValue: patGrowth,
                                    },
                                    {
                                        label: "OPERATING PROFIT",
                                        value: formatCr(
                                            latestQuarter?.operatingProfit
                                        ),
                                        change: formatGrowth(
                                            operatingProfitGrowth
                                        ),
                                        changeValue:
                                            operatingProfitGrowth,
                                    },
                                    {
                                        label: "CURRENT PRICE",
                                        value: formatPrice(
                                            latestQuarter?.currentPrice
                                        ),
                                        change: formatGrowth(
                                            priceGrowth
                                        ),
                                        changeValue: priceGrowth,
                                    },
                                    {
                                        label: "MARKET CAP",
                                        value: formatMarketCap(
                                            latestQuarter?.marketCap
                                        ),
                                        change: "-",
                                        changeValue: null,
                                    },
                                    {
                                        label: "PROMOTER HOLDING",
                                        value: formatNumber(
                                            latestQuarter?.promoterHolding,
                                            "%"
                                        ),
                                        change: "-",
                                        changeValue: null,
                                    },
                                ].map((metric) => (
                                    <div
                                        key={metric.label}
                                        className="rounded-2xl border border-white/[0.06] bg-[#0b1422] p-5 shadow-sm"
                                    >
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            {metric.label}
                                        </p>

                                        <p className="mt-2 text-xl font-extrabold tracking-tight text-white">
                                            {metric.value}
                                        </p>

                                        <p
                                            className={`mt-1 text-xs font-bold ${growthClass(
                                                metric.changeValue
                                            )}`}
                                        >
                                            {metric.change}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Quarterly Chart */}
                            <div className="rounded-2xl border border-white/[0.06] bg-[#0b1422] p-6 shadow-md">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-200">
                                            📊 Revenue vs PAT
                                        </h3>

                                        <p className="mt-1 text-[11px] text-slate-500">
                                            Last {quarterlyChartData.length} reported quarters
                                        </p>
                                    </div>

                                    <div className="flex gap-4 text-[10px] font-semibold text-slate-400">
                                        <span className="flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-full bg-[#00d084]" />
                                            Revenue
                                        </span>

                                        <span className="flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                                            PAT
                                        </span>
                                    </div>
                                </div>

                                {quarterlyChartData.length === 0 ? (
                                    <div className="py-16 text-center text-xs text-slate-500">
                                        -
                                    </div>
                                ) : (
                                    <div className="mt-8 flex h-56 items-end justify-between gap-2 px-2 sm:gap-5">
                                        {quarterlyChartData.map(
                                            (item, index) => {
                                                const revenue =
                                                    toCrores(
                                                        item.revenue
                                                    ) ?? 0;

                                                const pat =
                                                    toCrores(
                                                        item.netProfit
                                                    ) ?? 0;

                                                const revenueHeight =
                                                    Math.max(
                                                        4,
                                                        (revenue /
                                                            maxRevenue) *
                                                        100
                                                    );

                                                const patHeight =
                                                    Math.max(
                                                        4,
                                                        (pat /
                                                            maxRevenue) *
                                                        100
                                                    );

                                                return (
                                                    <div
                                                        key={`${item.year}-${item.quarter}-${index}`}
                                                        className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                                                    >
                                                        <div className="flex h-40 w-full items-end justify-center gap-1">
                                                            <div
                                                                title={`Revenue: ${formatCr(
                                                                    item.revenue
                                                                )}`}
                                                                className="w-4 rounded-t bg-[#00d084] transition-all hover:opacity-80 sm:w-6"
                                                                style={{
                                                                    height: `${revenueHeight}%`,
                                                                }}
                                                            />

                                                            <div
                                                                title={`PAT: ${formatCr(
                                                                    item.netProfit
                                                                )}`}
                                                                className="w-2 rounded-t bg-amber-500 transition-all hover:opacity-80 sm:w-3"
                                                                style={{
                                                                    height: `${patHeight}%`,
                                                                }}
                                                            />
                                                        </div>

                                                        <span className="whitespace-nowrap text-[9px] font-medium text-slate-500">
                                                            {item.quarter}{" "}
                                                            {item.year}
                                                        </span>
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Data summary */}
                            <div className="rounded-2xl border border-white/[0.06] bg-[#0b1422] p-6 shadow-md">
                                <h3 className="text-sm font-bold tracking-wide text-white">
                                    Latest Result
                                </h3>

                                <div className="mt-5 space-y-4 text-xs">
                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-500">
                                            Period
                                        </span>

                                        <span className="font-semibold text-slate-200">
                                            {latestPeriod}
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-500">
                                            Revenue
                                        </span>

                                        <span className="font-semibold text-slate-200">
                                            {formatCr(
                                                latestQuarter?.revenue
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-500">
                                            Net Profit
                                        </span>

                                        <span className="font-semibold text-slate-200">
                                            {formatCr(
                                                latestQuarter?.netProfit
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-500">
                                            Release
                                        </span>

                                        <span className="font-semibold text-slate-200">
                                            {formatDate(
                                                latestQuarter?.broadcastDate
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Telegram */}
                            <div className="rounded-2xl border border-[#0d4d6b] bg-[#072d42] p-6 text-center shadow-md">
                                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#168dcc] text-white shadow">
                                    <Send
                                        className="h-4 w-4"
                                        fill="currentColor"
                                    />
                                </div>

                                <h4 className="text-sm font-bold text-white">
                                    Track {ticker} on Telegram
                                </h4>

                                <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                                    Get notified instantly when new earnings drop for this stock.
                                </p>

                                <a
                                    href="#"
                                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#168dcc] py-3 text-xs font-bold text-white shadow transition hover:bg-[#1b9de0]"
                                >
                                    <Send
                                        className="h-3.5 w-3.5"
                                        fill="currentColor"
                                    />
                                    Join Channel
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* Growth */}
                {activeTab === "Growth" && (
                    <div className="mt-8 space-y-6">
                        <div className="rounded-2xl border border-white/[0.06] bg-[#0b1422] p-6">
                            <h3 className="text-sm font-bold text-white">
                                Quarterly Growth
                            </h3>

                            <div className="mt-6 overflow-x-auto">
                                <table className="w-full min-w-[650px] text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-white/[0.06] text-[10px] uppercase tracking-wider text-slate-500">
                                            <th className="pb-3">
                                                Period
                                            </th>
                                            <th className="pb-3 text-right">
                                                Revenue
                                            </th>
                                            <th className="pb-3 text-right">
                                                Revenue Growth
                                            </th>
                                            <th className="pb-3 text-right">
                                                PAT
                                            </th>
                                            <th className="pb-3 text-right">
                                                PAT Growth
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {quarterlyData.map(
                                            (item, index) => {
                                                const previous =
                                                    quarterlyData[
                                                    index + 1
                                                    ];

                                                const revenueGrowthValue =
                                                    calculateGrowth(
                                                        item.revenue,
                                                        previous?.revenue
                                                    );

                                                const patGrowthValue =
                                                    calculateGrowth(
                                                        item.netProfit,
                                                        previous?.netProfit
                                                    );

                                                return (
                                                    <tr
                                                        key={`${item.year}-${item.quarter}`}
                                                        className="border-b border-white/[0.04] last:border-0"
                                                    >
                                                        <td className="py-4 font-semibold text-slate-200">
                                                            {item.quarter ??
                                                                "-"}{" "}
                                                            {item.year ??
                                                                "-"}
                                                        </td>

                                                        <td className="py-4 text-right font-semibold text-slate-300">
                                                            {formatCr(
                                                                item.revenue
                                                            )}
                                                        </td>

                                                        <td
                                                            className={`py-4 text-right font-bold ${growthClass(
                                                                revenueGrowthValue
                                                            )}`}
                                                        >
                                                            {formatGrowth(
                                                                revenueGrowthValue
                                                            )}
                                                        </td>

                                                        <td className="py-4 text-right font-semibold text-slate-300">
                                                            {formatCr(
                                                                item.netProfit
                                                            )}
                                                        </td>

                                                        <td
                                                            className={`py-4 text-right font-bold ${growthClass(
                                                                patGrowthValue
                                                            )}`}
                                                        >
                                                            {formatGrowth(
                                                                patGrowthValue
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Fundamentals */}
                {activeTab === "Fundamentals" && (
                    <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                label: "P/E",
                                value:
                                    latestYear?.pe !== null &&
                                        latestYear?.pe !== undefined
                                        ? latestYear.pe.toFixed(2)
                                        : "-",
                            },
                            {
                                label: "P/B",
                                value:
                                    latestYear?.pb !== null &&
                                        latestYear?.pb !== undefined
                                        ? latestYear.pb.toFixed(2)
                                        : "-",
                            },
                            {
                                label: "BOOK VALUE",
                                value:
                                    latestYear?.bookValue !== null &&
                                        latestYear?.bookValue !== undefined
                                        ? formatPrice(
                                            latestYear.bookValue
                                        )
                                        : "-",
                            },
                            {
                                label: "DEBT",
                                value: formatCr(
                                    latestYear?.debt
                                ),
                            },
                            {
                                label: "MARKET CAP",
                                value: formatMarketCap(
                                    latestYear?.marketCap
                                ),
                            },
                            {
                                label: "PROMOTER HOLDING",
                                value: formatNumber(
                                    latestYear?.promoterHolding,
                                    "%"
                                ),
                            },
                            {
                                label: "ANNUAL REVENUE",
                                value: formatCr(
                                    latestYear?.revenue
                                ),
                            },
                            {
                                label: "ANNUAL NET PROFIT",
                                value: formatCr(
                                    latestYear?.netProfit
                                ),
                            },
                            {
                                label: "ANNUAL OPERATING PROFIT",
                                value: formatCr(
                                    latestYear?.operatingProfit
                                ),
                            },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="rounded-2xl border border-white/[0.06] bg-[#0b1422] p-6"
                            >
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    {item.label}
                                </p>

                                <p className="mt-3 text-2xl font-extrabold text-white">
                                    {item.value}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* AI Insights */}
                {activeTab === "AI Insights" && (
                    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="rounded-2xl border border-white/[0.06] bg-[#0b1422] p-6 shadow-md">
                            <div className="mb-4 flex items-center gap-2">
                                <span className="text-base">
                                    🤖
                                </span>

                                <h3 className="text-sm font-bold tracking-wide text-white">
                                    AI Insights
                                </h3>
                            </div>

                            <ul className="space-y-4 text-xs leading-relaxed text-slate-300">
                                <li className="flex items-start gap-2.5">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00d084]" />
                                    <span>
                                        AI analysis will be generated from
                                        the latest reported financial data.
                                    </span>
                                </li>

                                <li className="flex items-start gap-2.5">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00d084]" />
                                    <span>
                                        Revenue and profit trends are
                                        available from the reported
                                        quarterly results.
                                    </span>
                                </li>

                                <li className="flex items-start gap-2.5">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00d084]" />
                                    <span>
                                        Fundamental analysis will use
                                        valuation and balance-sheet metrics
                                        available from the annual data.
                                    </span>
                                </li>

                                <li className="flex items-start gap-2.5">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00d084]" />
                                    <span>
                                        More detailed insights can be added
                                        once the StockJump scoring and AI
                                        analysis APIs are connected.
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <div className="rounded-2xl border border-white/[0.06] bg-[#0b1422] p-6 shadow-md">
                            <h3 className="text-sm font-bold tracking-wide text-white">
                                StockJump Score
                            </h3>

                            <div className="mt-8 text-center">
                                <div className="text-4xl font-black text-slate-500">
                                    -
                                </div>

                                <p className="mt-2 text-xs text-slate-500">
                                    Score will appear once the scoring model
                                    is connected.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}