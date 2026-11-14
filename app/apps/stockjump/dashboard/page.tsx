"use client";

import {
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import Link from "next/link";
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    RefreshCw,
    Star,
} from "lucide-react";

import DashboardHeader from "./components/DashboardHeader";
import StockSearch from "./components/StockSearch";
import StockTabs, {
    type DashboardTab,
} from "./components/StockTabs";
import EarningsTable from "./components/EarningsTable";
import type { Stock } from "./components/types";
import {
    fetchRecentQuarterly,
    fetchStrongMovers,
    getCurrentFinancialPeriod,
    resolveLatestPeriod,
    type BasisParam,
    type LatestPeriod,
    type MetricKey,
    type MoverItem,
    type MoversResponse,
    type RecentResponse,
    type ResultRecord,
} from "./lib/api";
import {
    marginPercent,
    metricLabel as metricLabelFor,
    periodLabel,
    releaseSessionInfo,
} from "./lib/format";
import { useWatchlist } from "./lib/watchlist";

type FinancialFilter =
    | "all"
    | "financial"
    | "non-financial";

type MoverDirection = "gainers" | "losers" | "all";

type QualityFilter =
    | "all"
    | "profitable"
    | "loss-making"
    | "after-hours";

type SortKey =
    | "released"
    | "revenue"
    | "netProfit"
    | "operatingMargin"
    | "eps";

function recentToStock(record: ResultRecord): Stock {
    const metrics = record.metricsInCrores ?? {};
    const revenue = metrics.revenue ?? record.revenue;
    const netProfit =
        metrics.netProfit ?? record.netProfit;
    const operatingProfit =
        metrics.operatingProfit ??
        record.operatingProfit;
    const release = releaseSessionInfo(
        record.broadcastDate
    );

    return {
        id:
            record._id ??
            `${record.symbol}-${record.year ?? ""}-${
                record.quarter ?? ""
            }-${record.consolidated ? "c" : "s"}`,
        symbol: record.symbol,
        stockName: record.stockName ?? null,
        companyName:
            record.stockName ?? record.symbol,
        year: record.year,
        quarter: record.quarter,
        broadcastDate: record.broadcastDate,
        consolidated: record.consolidated,
        reportType: record.reportType,
        isFinancial: record.isFinancial,
        revenue,
        netProfit,
        operatingProfit,
        profitBeforeTax:
            metrics.profitBeforeTax ??
            record.profitBeforeTax,
        eps: metrics.eps ?? record.eps,
        operatingMargin: marginPercent(
            operatingProfit,
            revenue
        ),
        netMargin: marginPercent(netProfit, revenue),
        releaseSession: release?.shortLabel ?? null,
        isAfterHours: release?.isAfterHours ?? false,
        currentPrice: record.currentPrice,
        marketCap: record.marketCap,
        pe: record.pe,
        pb: record.pb,
        promoterHolding: record.promoterHolding,
        legacyUnits:
            record.metricsSource === "legacy" ||
            record.legacyUnits === true,
        sector:
            record.isFinancial === true
                ? "Financials"
                : "General",
    };
}

function moverToStock(item: MoverItem): Stock {
    const current =
        item.normalized?.current ?? item.current;
    const previous =
        item.normalized?.previous ?? item.previous;
    const metric = item.selectedMetric ?? "netProfit";

    return {
        id: `${item.symbol}-${item.year ?? ""}-${
            item.quarter ?? ""
        }-${item.basis ?? "standalone"}-${metric}`,
        symbol: item.symbol,
        stockName: item.stockName ?? null,
        companyName: item.stockName ?? item.symbol,
        year: item.year ?? undefined,
        quarter: item.quarter ?? undefined,
        consolidated: item.consolidated,
        reportType: item.reportType,
        isFinancial: item.isFinancial,
        revenue: current.revenue ?? null,
        netProfit: current.netProfit ?? null,
        operatingProfit:
            current.operatingProfit ?? null,
        profitBeforeTax:
            current.profitBeforeTax ?? null,
        eps: current.eps ?? null,
        operatingMargin: marginPercent(
            current.operatingProfit,
            current.revenue
        ),
        netMargin: marginPercent(
            current.netProfit,
            current.revenue
        ),
        currentValue: current[metric] ?? null,
        previousValue: previous[metric] ?? null,
        growth: item.selectedGrowth ?? null,
        metricLabel: metricLabelFor(metric),
        comparisonNote:
            item.comparisonQuality?.note ?? null,
        currentPrice: item.currentPrice ?? null,
        marketCap: item.marketCap ?? null,
        pe: item.pe ?? null,
        pb: item.pb ?? null,
        promoterHolding:
            item.promoterHolding ?? null,
        legacyUnits: item.legacyUnits,
        sector:
            item.isFinancial === true
                ? "Financials"
                : "General",
    };
}

function Pill({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-xl px-3.5 py-2 text-[11px] font-bold transition ${
                active
                    ? "bg-[#00d084] text-[#050e18]"
                    : "bg-[#141e2d] text-slate-400 hover:text-white"
            }`}
        >
            {children}
        </button>
    );
}

function FilterSelect({
    label,
    value,
    onChange,
    children,
}: {
    label: string;
    value: string | number;
    onChange: (value: string) => void;
    children: ReactNode;
}) {
    return (
        <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
            {label}
            <select
                value={value}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                className="h-8 rounded-lg border border-white/[0.08] bg-[#111b2b] px-2 text-[11px] font-semibold text-slate-200 outline-none focus:border-[#00d084]/50"
            >
                {children}
            </select>
        </label>
    );
}

function Pagination({
    page,
    total,
    limit,
    onPage,
}: {
    page: number;
    total: number;
    limit: number;
    onPage: (page: number) => void;
}) {
    const pages = Math.max(
        1,
        Math.ceil(total / Math.max(limit, 1))
    );

    if (total <= limit) {
        return null;
    }

    return (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4 text-[11px] font-semibold text-slate-400">
            <span>
                Page {page} of {pages} ·{" "}
                {total.toLocaleString("en-IN")} results
            </span>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => onPage(page - 1)}
                    className="rounded-lg border border-white/[0.08] bg-[#111b2b] px-3 py-1.5 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Previous
                </button>

                <button
                    type="button"
                    disabled={page >= pages}
                    onClick={() => onPage(page + 1)}
                    className="rounded-lg border border-white/[0.08] bg-[#111b2b] px-3 py-1.5 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const [activeTab, setActiveTab] =
        useState<DashboardTab>("recent");

    const [query, setQuery] = useState("");
    const { watchlist, toggle: toggleWatch } =
        useWatchlist();

    const [sortKey, setSortKey] =
        useState<SortKey>("released");
    const [sortDirection, setSortDirection] =
        useState<"asc" | "desc">("desc");
    const [qualityFilter, setQualityFilter] =
        useState<QualityFilter>("all");
    const [excludeExtremes, setExcludeExtremes] =
        useState(false);

    // Recent earnings / latest stocks
    const [recent, setRecent] =
        useState<RecentResponse | null>(null);
    const [recentLoading, setRecentLoading] =
        useState(false);
    const [recentError, setRecentError] =
        useState("");
    const [recentReload, setRecentReload] =
        useState(0);
    const [recentPage, setRecentPage] = useState(1);
    const [allPage, setAllPage] = useState(1);
    const [recentDays, setRecentDays] = useState(7);
    const [recentFrom, setRecentFrom] = useState("");
    const [recentTo, setRecentTo] = useState("");
    const [recentBasis, setRecentBasis] =
        useState<BasisParam>("preferred");
    const [financialFilter, setFinancialFilter] =
        useState<FinancialFilter>("all");

    // Strong movers
    const initialPeriod =
        getCurrentFinancialPeriod();
    const [movers, setMovers] =
        useState<MoversResponse | null>(null);
    const [moversLoading, setMoversLoading] =
        useState(false);
    const [moversError, setMoversError] =
        useState("");
    const [moversReload, setMoversReload] =
        useState(0);
    const [moverYear, setMoverYear] = useState(
        initialPeriod.year
    );
    const [moverQuarter, setMoverQuarter] = useState(
        initialPeriod.quarter
    );
    const [moverMetric, setMoverMetric] =
        useState<MetricKey>("netProfit");
    const [moverComparison, setMoverComparison] =
        useState<"yoy" | "qoq">("yoy");
    const [moverDirection, setMoverDirection] =
        useState<MoverDirection>("gainers");
    const [moverBasis, setMoverBasis] =
        useState<BasisParam>("preferred");
    const [moverPage, setMoverPage] = useState(1);
    const [latestPeriod, setLatestPeriod] =
        useState<LatestPeriod | null>(null);

    useEffect(() => {
        let cancelled = false;

        resolveLatestPeriod().then((period) => {
            if (cancelled) {
                return;
            }

            setLatestPeriod(period);
            setMoverYear(period.year);
            setMoverQuarter(period.quarter);
        });

        return () => {
            cancelled = true;
        };
    }, []);

    const recentDaysForTab =
        activeTab === "all" || activeTab === "watchlist"
            ? 90
            : recentDays;
    const recentPageForTab =
        activeTab === "all"
            ? allPage
            : activeTab === "watchlist"
              ? 1
              : recentPage;
    const recentLimit =
        activeTab === "all"
            ? 50
            : activeTab === "watchlist"
              ? 100
              : 25;
    const customRangeActive =
        activeTab === "recent" &&
        (recentFrom !== "" || recentTo !== "");
    const recentFromParam = customRangeActive
        ? recentFrom
            ? `${recentFrom}T00:00:00.000Z`
            : undefined
        : undefined;
    const recentToParam = customRangeActive
        ? recentTo
            ? `${recentTo}T23:59:59.999Z`
            : undefined
        : undefined;

    useEffect(() => {
        if (
            activeTab !== "recent" &&
            activeTab !== "all" &&
            activeTab !== "watchlist"
        ) {
            return;
        }

        let cancelled = false;

        async function load() {
            setRecentLoading(true);
            setRecentError("");

            try {
                const response =
                    await fetchRecentQuarterly({
                        page: recentPageForTab,
                        limit: recentLimit,
                        days: customRangeActive
                            ? undefined
                            : recentDaysForTab,
                        from: recentFromParam,
                        to: recentToParam,
                        consolidated: recentBasis,
                        isFinancial:
                            financialFilter === "all"
                                ? undefined
                                : financialFilter ===
                                    "financial",
                    });

                if (!cancelled) {
                    setRecent(response);
                }
            } catch (error) {
                if (!cancelled) {
                    setRecent(null);
                    setRecentError(
                        error instanceof Error
                            ? error.message
                            : "Unable to load recent results"
                    );
                }
            } finally {
                if (!cancelled) {
                    setRecentLoading(false);
                }
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [
        activeTab,
        recentPageForTab,
        recentDaysForTab,
        recentLimit,
        recentBasis,
        financialFilter,
        recentReload,
        customRangeActive,
        recentFromParam,
        recentToParam,
    ]);

    useEffect(() => {
        if (activeTab !== "top") {
            return;
        }

        let cancelled = false;

        async function load() {
            setMoversLoading(true);
            setMoversError("");

            try {
                const response =
                    await fetchStrongMovers({
                        year: moverYear,
                        quarter: moverQuarter,
                        metric: moverMetric,
                        comparison: moverComparison,
                        sort:
                            moverDirection === "losers"
                                ? "asc"
                                : "desc",
                        page: moverPage,
                        limit: 20,
                        consolidated: moverBasis,
                    });

                if (!cancelled) {
                    setMovers(response);
                }
            } catch (error) {
                if (!cancelled) {
                    setMovers(null);
                    setMoversError(
                        error instanceof Error
                            ? error.message
                            : "Unable to load strong movers"
                    );
                }
            } finally {
                if (!cancelled) {
                    setMoversLoading(false);
                }
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [
        activeTab,
        moverYear,
        moverQuarter,
        moverMetric,
        moverComparison,
        moverDirection,
        moverBasis,
        moverPage,
        moversReload,
    ]);

    const recentRows = useMemo(
        () => (recent?.data ?? []).map(recentToStock),
        [recent]
    );

    const moverRows = useMemo(
        () => (movers?.data ?? []).map(moverToStock),
        [movers]
    );

    const filteredStocks = useMemo(() => {
        let result: Stock[] =
            activeTab === "top"
                ? [...moverRows]
                : [...recentRows];

        if (activeTab === "watchlist") {
            result = result.filter((stock) =>
                watchlist.includes(stock.symbol.toUpperCase())
            );
        }

        if (query) {
            const search = query.toLowerCase();

            result = result.filter((stock) => {
                const symbol =
                    stock.symbol ?? "";
                const companyName =
                    stock.companyName ??
                    stock.stockName ??
                    "";
                const sector = stock.sector ?? "";

                return (
                    symbol
                        .toLowerCase()
                        .includes(search) ||
                    companyName
                        .toLowerCase()
                        .includes(search) ||
                    sector
                        .toLowerCase()
                        .includes(search)
                );
            });
        }

        if (
            activeTab === "top" &&
            moverDirection === "gainers"
        ) {
            result = result.filter(
                (stock) =>
                    (stock.growth ?? 0) >= 0
            );
        }

        if (
            activeTab === "top" &&
            moverDirection === "losers"
        ) {
            result = result.filter(
                (stock) =>
                    (stock.growth ?? 0) < 0
            );
        }

        if (
            activeTab === "top" &&
            excludeExtremes
        ) {
            result = result.filter(
                (stock) =>
                    Math.abs(stock.growth ?? 0) < 1000
            );
        }

        if (qualityFilter === "profitable") {
            result = result.filter(
                (stock) => (stock.netProfit ?? 0) > 0
            );
        }

        if (qualityFilter === "loss-making") {
            result = result.filter(
                (stock) => (stock.netProfit ?? 0) < 0
            );
        }

        if (qualityFilter === "after-hours") {
            result = result.filter(
                (stock) => stock.isAfterHours === true
            );
        }

        const sortValue = (stock: Stock): number | null => {
            switch (sortKey) {
                case "revenue":
                    return stock.revenue ?? null;
                case "netProfit":
                    return stock.netProfit ?? null;
                case "operatingMargin":
                    return stock.operatingMargin ?? null;
                case "eps":
                    return stock.eps ?? null;
                default:
                    return stock.broadcastDate
                        ? new Date(
                              stock.broadcastDate
                          ).getTime()
                        : null;
            }
        };

        result.sort((a, b) => {
            const left = sortValue(a);
            const right = sortValue(b);

            if (left === null && right === null) {
                return 0;
            }

            if (left === null) {
                return 1;
            }

            if (right === null) {
                return -1;
            }

            return sortDirection === "asc"
                ? left - right
                : right - left;
        });

        return result;
    }, [
        activeTab,
        recentRows,
        moverRows,
        query,
        moverDirection,
        watchlist,
        qualityFilter,
        excludeExtremes,
        sortKey,
        sortDirection,
    ]);

    const activeLoading =
        activeTab === "top"
            ? moversLoading
            : recentLoading;

    const activeError =
        activeTab === "top"
            ? moversError
            : recentError;

    const usesLegacyUnits = (
        activeTab === "top" ? moverRows : recentRows
    ).some((stock) => stock.legacyUnits);

    const activeTotal =
        activeTab === "top"
            ? movers?.total ?? 0
            : recent?.total ?? 0;

    const activePage =
        activeTab === "top"
            ? moverPage
            : recentPageForTab;

    const activeLimit =
        activeTab === "top"
            ? movers?.limit ?? 20
            : recent?.limit ?? recentLimit;

    function changePage(page: number) {
        if (activeTab === "top") {
            setMoverPage(page);
        } else if (activeTab === "all") {
            setAllPage(page);
        } else if (activeTab === "watchlist") {
            return;
        } else {
            setRecentPage(page);
        }
    }

    function retry() {
        if (activeTab === "top") {
            setMoversReload((value) => value + 1);
        } else {
            setRecentReload((value) => value + 1);
        }
    }

    const moverYearOptions = useMemo(() => {
        const latest =
            latestPeriod?.year ??
            getCurrentFinancialPeriod().year;

        return [
            latest,
            latest - 1,
            latest - 2,
            latest - 3,
        ];
    }, [latestPeriod]);

    const title =
        activeTab === "recent"
            ? customRangeActive
                ? `Recent Earnings (${recentFrom || "start"} → ${
                      recentTo || "now"
                  })`
                : `Recent Earnings (${
                      recentDays === 1
                          ? "24h"
                          : `${recentDays}d`
                  })`
            : activeTab === "top"
                ? "Strong Movers"
                : activeTab === "watchlist"
                  ? `My Watchlist (${watchlist.length})`
                  : "Latest Stocks (90d)";

    return (
        <div className="min-h-screen bg-[#070d18] text-white">
            <DashboardHeader />

            <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
                <div className="mb-6 flex flex-col gap-4">
                    <div className="mx-auto w-full max-w-2xl">
                        <StockSearch onSearch={setQuery} />

                        {query && (
                            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-[10px] font-medium text-slate-500">
                                <span>
                                    Filtering the loaded page.
                                </span>

                                {/^[A-Za-z0-9&.-]{1,20}$/.test(
                                    query
                                ) && (
                                    <Link
                                        href={`/apps/stockjump/dashboard/stock?symbol=${encodeURIComponent(
                                            query.toUpperCase()
                                        )}`}
                                        className="font-bold text-[#00d084] hover:underline"
                                    >
                                        Open{" "}
                                        {query.toUpperCase()}{" "}
                                        detail →
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center">
                        <StockTabs
                            activeTab={activeTab}
                            onChange={setActiveTab}
                        />
                    </div>
                </div>

                {(activeTab === "recent" ||
                    activeTab === "all" ||
                    activeTab === "watchlist") && (
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-[#0b1422] p-4">
                        <div className="flex flex-wrap items-center gap-3">
                            {activeTab === "recent" && (
                                <div className="flex items-center gap-1 rounded-xl bg-[#111b2b] p-1">
                                    {[1, 7, 30].map((days) => (
                                        <Pill
                                            key={days}
                                            active={
                                                !customRangeActive &&
                                                recentDays ===
                                                    days
                                            }
                                            onClick={() => {
                                                setRecentDays(
                                                    days
                                                );
                                                setRecentFrom("");
                                                setRecentTo("");
                                                setRecentPage(
                                                    1
                                                );
                                            }}
                                        >
                                            {days === 1
                                                ? "24h"
                                                : `${days}d`}
                                        </Pill>
                                    ))}
                                </div>
                            )}

                            {activeTab === "recent" && (
                                <div className="flex items-center gap-2 rounded-xl bg-[#111b2b] px-2.5 py-1.5 text-[11px] font-semibold text-slate-500">
                                    <span>From</span>
                                    <input
                                        type="date"
                                        value={recentFrom}
                                        max={recentTo || undefined}
                                        onChange={(event) => {
                                            setRecentFrom(
                                                event.target.value
                                            );
                                            setRecentPage(1);
                                        }}
                                        className="rounded-lg border border-white/[0.08] bg-[#0b1422] px-2 py-1 text-[11px] text-slate-200 outline-none [color-scheme:dark] focus:border-[#00d084]/50"
                                    />
                                    <span>To</span>
                                    <input
                                        type="date"
                                        value={recentTo}
                                        min={recentFrom || undefined}
                                        onChange={(event) => {
                                            setRecentTo(
                                                event.target.value
                                            );
                                            setRecentPage(1);
                                        }}
                                        className="rounded-lg border border-white/[0.08] bg-[#0b1422] px-2 py-1 text-[11px] text-slate-200 outline-none [color-scheme:dark] focus:border-[#00d084]/50"
                                    />

                                    {customRangeActive && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setRecentFrom("");
                                                setRecentTo("");
                                                setRecentPage(1);
                                            }}
                                            className="rounded-lg px-1.5 py-1 text-[10px] font-bold text-slate-400 transition hover:bg-white/5 hover:text-white"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                            )}

                            <FilterSelect
                                label="Basis"
                                value={recentBasis}
                                onChange={(value) => {
                                    setRecentBasis(
                                        value as BasisParam
                                    );
                                    setRecentPage(1);
                                    setAllPage(1);
                                }}
                            >
                                <option value="preferred">
                                    Preferred
                                </option>
                                <option value="all">
                                    All bases
                                </option>
                                <option value="true">
                                    Consolidated
                                </option>
                                <option value="false">
                                    Standalone
                                </option>
                            </FilterSelect>

                            <FilterSelect
                                label="Companies"
                                value={financialFilter}
                                onChange={(value) => {
                                    setFinancialFilter(
                                        value as FinancialFilter
                                    );
                                    setRecentPage(1);
                                    setAllPage(1);
                                }}
                            >
                                <option value="all">
                                    All
                                </option>
                                <option value="financial">
                                    Financials
                                </option>
                                <option value="non-financial">
                                    Non-financials
                                </option>
                            </FilterSelect>
                        </div>

                        <button
                            type="button"
                            onClick={retry}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#111b2b] px-3 py-2 text-[11px] font-bold text-slate-300 transition hover:text-white"
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Refresh
                        </button>
                    </div>
                )}

                {activeTab !== "top" && (
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-[#0b1422] px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                Show
                            </span>

                            {(
                                [
                                    ["all", "All"],
                                    [
                                        "profitable",
                                        "Profitable",
                                    ],
                                    [
                                        "loss-making",
                                        "Loss-making",
                                    ],
                                    [
                                        "after-hours",
                                        "After hours",
                                    ],
                                ] as const
                            ).map(([value, label]) => (
                                <Pill
                                    key={value}
                                    active={
                                        qualityFilter === value
                                    }
                                    onClick={() =>
                                        setQualityFilter(value)
                                    }
                                >
                                    {label}
                                </Pill>
                            ))}

                            {activeTab === "watchlist" && (
                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-[#111b2b] px-2.5 py-1.5 text-[10px] font-semibold text-slate-500">
                                    <Star className="h-3 w-3" />
                                    Saved in this browser
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <FilterSelect
                                label="Sort"
                                value={sortKey}
                                onChange={(value) =>
                                    setSortKey(
                                        value as SortKey
                                    )
                                }
                            >
                                <option value="released">
                                    Release date
                                </option>
                                <option value="revenue">
                                    Revenue
                                </option>
                                <option value="netProfit">
                                    Net profit
                                </option>
                                <option value="operatingMargin">
                                    Operating margin
                                </option>
                                <option value="eps">EPS</option>
                            </FilterSelect>

                            <button
                                type="button"
                                onClick={() =>
                                    setSortDirection(
                                        (current) =>
                                            current === "asc"
                                                ? "desc"
                                                : "asc"
                                    )
                                }
                                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#111b2b] px-2.5 text-[11px] font-semibold text-slate-300 transition hover:text-white"
                                title="Toggle sort direction"
                            >
                                <ArrowUpDown className="h-3.5 w-3.5" />
                                {sortKey === "released"
                                    ? sortDirection === "desc"
                                        ? "Newest first"
                                        : "Oldest first"
                                    : sortDirection === "desc"
                                      ? "High → low"
                                      : "Low → high"}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === "top" && (
                    <div className="mb-6 space-y-3 rounded-2xl border border-white/[0.06] bg-[#0b1422] p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-3">
                                <FilterSelect
                                    label="Quarter"
                                    value={moverQuarter}
                                    onChange={(value) => {
                                        setMoverQuarter(value);
                                        setMoverPage(1);
                                    }}
                                >
                                    {[
                                        "Q1",
                                        "Q2",
                                        "Q3",
                                        "Q4",
                                    ].map((quarter) => (
                                        <option
                                            key={quarter}
                                            value={quarter}
                                        >
                                            {quarter}
                                        </option>
                                    ))}
                                </FilterSelect>

                                <FilterSelect
                                    label="FY"
                                    value={moverYear}
                                    onChange={(value) => {
                                        setMoverYear(
                                            Number(value)
                                        );
                                        setMoverPage(1);
                                    }}
                                >
                                    {moverYearOptions.map(
                                        (year) => (
                                            <option
                                                key={year}
                                                value={year}
                                            >
                                                FY{year}
                                            </option>
                                        )
                                    )}
                                </FilterSelect>

                                <FilterSelect
                                    label="Metric"
                                    value={moverMetric}
                                    onChange={(value) => {
                                        setMoverMetric(
                                            value as MetricKey
                                        );
                                        setMoverPage(1);
                                    }}
                                >
                                    <option value="netProfit">
                                        Net profit
                                    </option>
                                    <option value="revenue">
                                        Revenue
                                    </option>
                                    <option value="operatingProfit">
                                        Operating profit
                                    </option>
                                    <option value="profitBeforeTax">
                                        Profit before tax
                                    </option>
                                    <option value="eps">
                                        EPS
                                    </option>
                                </FilterSelect>

                                <FilterSelect
                                    label="Compare"
                                    value={moverComparison}
                                    onChange={(value) => {
                                        setMoverComparison(
                                            value as
                                                | "yoy"
                                                | "qoq"
                                        );
                                        setMoverPage(1);
                                    }}
                                >
                                    <option value="yoy">
                                        YoY
                                    </option>
                                    <option value="qoq">
                                        QoQ
                                    </option>
                                </FilterSelect>

                                <FilterSelect
                                    label="Basis"
                                    value={moverBasis}
                                    onChange={(value) => {
                                        setMoverBasis(
                                            value as BasisParam
                                        );
                                        setMoverPage(1);
                                    }}
                                >
                                    <option value="preferred">
                                        Preferred
                                    </option>
                                    <option value="all">
                                        All bases
                                    </option>
                                    <option value="true">
                                        Consolidated
                                    </option>
                                    <option value="false">
                                        Standalone
                                    </option>
                                </FilterSelect>
                            </div>

                            <button
                                type="button"
                                onClick={retry}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#111b2b] px-3 py-2 text-[11px] font-bold text-slate-300 transition hover:text-white"
                            >
                                <RefreshCw className="h-3.5 w-3.5" />
                                Refresh
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <Pill
                                    active={
                                        moverDirection ===
                                        "gainers"
                                    }
                                    onClick={() => {
                                        setMoverDirection(
                                            "gainers"
                                        );
                                        setMoverPage(1);
                                    }}
                                >
                                    <span className="inline-flex items-center gap-1.5">
                                        <ArrowUp className="h-3.5 w-3.5" />
                                        Top Gainers
                                    </span>
                                </Pill>

                                <Pill
                                    active={
                                        moverDirection ===
                                        "losers"
                                    }
                                    onClick={() => {
                                        setMoverDirection(
                                            "losers"
                                        );
                                        setMoverPage(1);
                                    }}
                                >
                                    <span className="inline-flex items-center gap-1.5">
                                        <ArrowDown className="h-3.5 w-3.5" />
                                        Top Losers
                                    </span>
                                </Pill>

                                <Pill
                                    active={
                                        moverDirection ===
                                        "all"
                                    }
                                    onClick={() => {
                                        setMoverDirection(
                                            "all"
                                        );
                                        setMoverPage(1);
                                    }}
                                >
                                    All
                                </Pill>

                                <Pill
                                    active={excludeExtremes}
                                    onClick={() =>
                                        setExcludeExtremes(
                                            (current) =>
                                                !current
                                        )
                                    }
                                >
                                    Hide extreme
                                </Pill>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-500">
                                {movers?.comparisonQuarter
                                    ?.year &&
                                    movers
                                        .comparisonQuarter
                                        .quarter && (
                                        <span className="rounded-lg border border-white/[0.06] bg-[#111b2b] px-2.5 py-1.5">
                                            vs{" "}
                                            {periodLabel(
                                                movers
                                                    .comparisonQuarter
                                                    .year,
                                                movers
                                                    .comparisonQuarter
                                                    .quarter
                                            )}
                                        </span>
                                    )}

                                {latestPeriod &&
                                    !latestPeriod.fromApi && (
                                        <span className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-2.5 py-1.5 text-amber-300/80">
                                            Latest period
                                            estimated — adjust
                                            if needed
                                        </span>
                                    )}
                            </div>
                        </div>
                    </div>
                )}

                {usesLegacyUnits && (
                    <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2.5 text-[11px] leading-relaxed text-amber-200/80">
                        Some records have no unit metadata, so
                        the API assumes they are already in
                        Crores. Values marked with{" "}
                        <span className="font-bold text-amber-300">
                            *
                        </span>{" "}
                        fall into that group and may be
                        inaccurate for older consolidated
                        filings.
                    </div>
                )}

                <div className="rounded-2xl border border-white/[0.06] bg-[#0b1422] p-5 shadow-md sm:p-6">
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold text-slate-100">
                                {title}
                            </h2>

                            <span className="rounded-full bg-[#00d084]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#00d084]">
                                {filteredStocks.length}
                                {activeTotal >
                                filteredStocks.length
                                    ? ` of ${activeTotal}`
                                    : ""}{" "}
                                stocks
                            </span>
                        </div>

                        <span className="text-xs text-slate-500">
                            {activeTab === "top"
                                ? `${metricLabelFor(
                                      moverMetric
                                  )} · ${moverComparison.toUpperCase()}`
                                : "Updated live"}
                        </span>
                    </div>

                    <div className="mt-4">
                        {activeError ? (
                            <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-8 text-center">
                                <p className="text-sm font-semibold text-red-300">
                                    {activeError}
                                </p>

                                <button
                                    type="button"
                                    onClick={retry}
                                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#00d084]/15 px-4 py-2 text-xs font-bold text-[#00d084] transition hover:bg-[#00d084]/25"
                                >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    Try again
                                </button>
                            </div>
                        ) : activeLoading ? (
                            <div className="w-full py-12 text-center text-sm font-medium text-slate-500">
                                {activeTab === "top"
                                    ? "Calculating strong movers..."
                                    : "Loading results..."}
                            </div>
                        ) : filteredStocks.length === 0 ? (
                            <div className="w-full py-12 text-center text-sm font-medium text-slate-500">
                                {activeTab === "watchlist"
                                    ? watchlist.length === 0
                                        ? "Your watchlist is empty. Star a company from Recent Earnings or from its detail page to follow it here."
                                        : "None of your watched companies reported in the last 90 days, or the current filters hide them."
                                    : activeTab === "top"
                                      ? "No movers matched. Try another period, metric or basis."
                                      : activeTab === "all"
                                        ? "No results in the last 90 days."
                                        : "No results match this window and filter. Try 30 days, 'All bases' or clear the quality filter."}
                            </div>
                        ) : (
                            <EarningsTable
                                stocks={filteredStocks}
                                isTopStocks={
                                    activeTab === "top"
                                }
                                metricLabel={metricLabelFor(
                                    moverMetric
                                )}
                                starredSymbols={watchlist}
                                onToggleStar={toggleWatch}
                            />
                        )}
                    </div>

                    {!activeLoading &&
                        !activeError &&
                        activeTab !== "watchlist" && (
                            <Pagination
                                page={activePage}
                                total={activeTotal}
                                limit={activeLimit}
                                onPage={changePage}
                            />
                        )}
                </div>
            </main>
        </div>
    );
}
