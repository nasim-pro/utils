"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    TrendingUp,
    Star,
    LogOut,
    ArrowUpRight,
    BarChart2,
    Activity,
    ShieldCheck,
    Zap,
    ArrowUp,
    ArrowDown,
} from "lucide-react";

import DashboardHeader from "./components/DashboardHeader";
import StockSearch from "./components/StockSearch";
import StockTabs, { type DashboardTab } from "./components/StockTabs";
import TelegramBanner from "./components/TelegramBanner";
import EarningsTable from "./components/EarningsTable";
import type { Stock } from "./components/types";
import { appConfig } from "../config";

interface StrongMoverApiItem {
    symbol: string;
    stockName: string;
    quarter: string;
    year: number;

    current?: {
        revenue?: number | null;
        operatingProfit?: number | null;
        profitBeforeTax?: number | null;
        netProfit?: number | null;
        eps?: number | null;
    };

    previous?: {
        revenue?: number | null;
        operatingProfit?: number | null;
        profitBeforeTax?: number | null;
        netProfit?: number | null;
        eps?: number | null;
    };

    growth?: {
        revenue?: number | null;
        operatingProfit?: number | null;
        profitBeforeTax?: number | null;
        netProfit?: number | null;
        eps?: number | null;
    };

    selectedMetric?: string;
    selectedGrowth?: number | null;

    currentPrice?: number | null;
    marketCap?: number | null;
    pe?: number | null;
    pb?: number | null;
    promoterHolding?: number | null;
}

function getCurrentFinancialPeriod() {
    const now = new Date();
    const month = now.getMonth();

    const calendarYear = now.getFullYear();

    // April - June
    if (month >= 3 && month <= 5) {
        return {
            quarter: "Q1",
            year: calendarYear,
        };
    }

    // July - September
    if (month >= 6 && month <= 8) {
        return {
            quarter: "Q2",
            year: calendarYear,
        };
    }

    // October - December
    if (month >= 9 && month <= 11) {
        return {
            quarter: "Q3",
            year: calendarYear,
        };
    }

    // January - March
    return {
        quarter: "Q4",
        year: calendarYear - 1,
    };
}

function formatCr(value?: number | null) {
    if (value === null || value === undefined) {
        return "-";
    }

    return `₹${(value / 100).toFixed(1)} Cr`;
}

export default function DashboardPage() {
    const router = useRouter();

    // Recent Earnings is the default tab.
    const [activeTab, setActiveTab] =
        useState<DashboardTab>("recent");

    const [bannerVisible, setBannerVisible] = useState(true);
    const [query, setQuery] = useState("");
    const [watchlist, setWatchlist] = useState<string[]>([]);

    // All Stocks
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Recent Earnings
    const [recentStocks, setRecentStocks] = useState<Stock[]>([]);
    const [loadingRecent, setLoadingRecent] =
        useState<boolean>(false);

    // Strong Movers
    const [strongMoverStocks, setStrongMoverStocks] =
        useState<Stock[]>([]);
    const [loadingStrongMovers, setLoadingStrongMovers] =
        useState<boolean>(false);
    const [strongMoversLoaded, setStrongMoversLoaded] =
        useState<boolean>(false);

    // Strong Movers filters
    const [gainersLosers, setGainersLosers] = useState<"gainers" | "losers" | "all">("gainers");


    /*
     * Fetch Recent Earnings only when Recent Earnings
     * tab is active.
     */
    useEffect(() => {
        if (
            activeTab !== "recent" ||
            recentStocks.length > 0
        ) {
            return;
        }

        async function fetchRecentEarnings() {
            setLoadingRecent(true);

            try {
                const token = localStorage.getItem("stockjump_token");

                const response = await fetch(
                    `${appConfig.api.baseUrl}/api/recent/quarterly`,
                    {
                        headers: {
                            ...(token ? { Authorization: `Bearer ${token}`,} : {}),
                        },
                    }
                );

                if (!response.ok) {
                    const text = await response.text();

                    throw new Error(
                        `Failed to fetch recent earnings (${response.status}): ${text.slice(
                            0,
                            200
                        )}`
                    );
                }

                const result = await response.json();

                const items = Array.isArray(result)
                    ? result
                    : result.data || result.stocks || [];

                if (items.length > 0) {
                    const formatted: Stock[] = items.map(
                        (item: any) => ({
                            symbol: item.symbol || "",
                            companyName:
                                item.stockName ||
                                item.companyName ||
                                "",
                            sector:
                                item.sector || "General",

                            revenue:
                                item.revenue !== null &&
                                    item.revenue !== undefined
                                    ? formatCr(item.revenue)
                                    : "-",

                            pat:
                                item.netProfit !== null &&
                                    item.netProfit !== undefined
                                    ? formatCr(item.netProfit)
                                    : "-",

                            eps:
                                item.eps !== undefined &&
                                    item.eps !== null
                                    ? item.eps.toFixed(2)
                                    : "-",

                            patGrowth:
                                item.patGrowth !== null &&
                                    item.patGrowth !== undefined
                                    ? item.patGrowth
                                    : 0,

                            sentiment:
                                item.sentiment || "In-Line",

                            quarter: item.quarter,
                            year: item.year,
                            broadcastDate:
                                item.broadcastDate,

                            trendType:
                                (item.patGrowth || 0) >= 0
                                    ? "bullish"
                                    : "bearish",
                        })
                    );

                    setRecentStocks(formatted);
                }
            } catch (error) {
                console.error(
                    "Failed to fetch recent quarterly earnings:",
                    error
                );
            } finally {
                setLoadingRecent(false);
            }
        }

        fetchRecentEarnings();
    }, [activeTab, recentStocks.length]);

    /*
     * Fetch Strong Movers only when the Strong Movers
     * tab is opened.
     */
    useEffect(() => {
        if (
            activeTab !== "top" ||
            strongMoversLoaded
        ) {
            return;
        }

        async function fetchStrongMovers() {
            setLoadingStrongMovers(true);

            try {
                const { quarter, year } =
                    getCurrentFinancialPeriod();

                const token =
                    localStorage.getItem("stockjump_token");

                const url =
                    `${appConfig.api.baseUrl}/api/stocks/strong-movers` +
                    `?quarter=${quarter}&year=${year}`;

                console.log(
                    `Fetching Strong Movers: ${quarter} ${year}`
                );

                const response = await fetch(url, {
                    headers: {
                        ...(token
                            ? {
                                Authorization: `Bearer ${token}`,
                            }
                            : {}),
                    },
                });

                if (!response.ok) {
                    const text = await response.text();

                    throw new Error(
                        `Failed to fetch strong movers (${response.status}): ${text.slice(
                            0,
                            200
                        )}`
                    );
                }

                const contentType =
                    response.headers.get("content-type") || "";

                if (!contentType.includes("application/json")) {
                    const text = await response.text();

                    throw new Error(
                        `Strong Movers API returned non-JSON response: ${text.slice(
                            0,
                            200
                        )}`
                    );
                }

                const result = await response.json();

                const items: StrongMoverApiItem[] =
                    Array.isArray(result)
                        ? result
                        : result.data || [];

                const formatted: Stock[] = items.map(
                    (item) => ({
                        symbol: item.symbol || "",

                        companyName: item.stockName || "",

                        sector: "General",

                        year: item.year,
                        quarter: item.quarter,

                        revenue:
                            item.current?.revenue !== null &&
                                item.current?.revenue !== undefined
                                ? formatCr(
                                    item.current.revenue
                                )
                                : "-",

                        pat:
                            item.current?.netProfit !== null &&
                                item.current?.netProfit !==
                                undefined
                                ? formatCr(
                                    item.current.netProfit
                                )
                                : "-",

                        eps:
                            item.current?.eps !== null &&
                                item.current?.eps !== undefined
                                ? item.current.eps.toFixed(2)
                                : "-",

                        patGrowth:
                            item.selectedGrowth !== null &&
                                item.selectedGrowth !== undefined
                                ? item.selectedGrowth
                                : 0,

                        sentiment: "In-Line",

                        trendType:
                            (item.selectedGrowth || 0) >=
                                0
                                ? "bullish"
                                : "bearish",

                        currentPrice:
                            item.currentPrice ??
                            undefined,

                        marketCap:
                            item.marketCap ??
                            undefined,
                    })
                );

                setStrongMoverStocks(formatted);
                setStrongMoversLoaded(true);
            } catch (error) {
                console.error(
                    "Failed to fetch strong movers:",
                    error
                );
            } finally {
                setLoadingStrongMovers(false);
            }
        }

        fetchStrongMovers();
    }, [activeTab, strongMoversLoaded]);

    function toggleWatchlist(symbol: string) {
        setWatchlist((current) =>
            current.includes(symbol)
                ? current.filter(
                    (item) => item !== symbol
                )
                : [...current, symbol]
        );
    }

    const filteredStocks = useMemo(() => {
        let result: Stock[];

        if (activeTab === "recent") {
            result = [...recentStocks];
        } else if (activeTab === "top") {
            result = [...strongMoverStocks];
        } else {
            result = [...stocks];
        }

        /*
         * Search
         */
        if (query) {
            const search = query.toLowerCase();

            result = result.filter((stock) => {
                const symbol = stock.symbol ?? "";
                const companyName =
                    stock.companyName ?? "";
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

        /*
         * Strong Movers:
         *
         * The API already sorts by selectedGrowth DESC.
         * We only apply the gainers/losers filter here.
         */
        if (activeTab === "top") {
            if (gainersLosers === "gainers") {
                result = result.filter(
                    (stock) =>
                        Number(
                            stock.patGrowth ?? 0
                        ) >= 0
                );
            } else if (
                gainersLosers === "losers"
            ) {
                result = result.filter(
                    (stock) =>
                        Number(
                            stock.patGrowth ?? 0
                        ) < 0
                );
            }
        }

        return result;
    }, [
        activeTab,
        recentStocks,
        strongMoverStocks,
        stocks,
        query,
        gainersLosers,
    ]);

    const activeLoading = activeTab === "recent" ? loadingRecent : activeTab === "top" ? loadingStrongMovers : loading;

    return (
        <div className="min-h-screen bg-[#070d18] text-white">
            <DashboardHeader />

            <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
                {/* Search and Tabs Header */}
                <div className="mb-6 flex flex-col gap-4">
                    <div className="mx-auto w-full max-w-2xl">
                        <StockSearch
                            onSearch={setQuery}
                        />
                    </div>

                    <div className="flex justify-center">
                        <StockTabs
                            activeTab={activeTab}
                            onChange={setActiveTab}
                        />
                    </div>
                </div>

                {/* Strong Movers Filters */}
                {activeTab === "top" && (
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-[#0b1422] p-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-400">
                                YoY PAT:
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() =>
                                    setGainersLosers(
                                        "gainers"
                                    )
                                }
                                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${gainersLosers ===
                                        "gainers"
                                        ? "bg-[#00d084] text-[#050e18]"
                                        : "bg-[#141e2d] text-slate-400 hover:text-white"
                                    }`}
                            >
                                <ArrowUp className="h-3.5 w-3.5" />
                                Top Gainers
                            </button>

                            <button
                                onClick={() =>
                                    setGainersLosers(
                                        "losers"
                                    )
                                }
                                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${gainersLosers ===
                                        "losers"
                                        ? "bg-red-500 text-white"
                                        : "bg-[#141e2d] text-slate-400 hover:text-white"
                                    }`}
                            >
                                <ArrowDown className="h-3.5 w-3.5" />
                                Top Losers
                            </button>

                            <button
                                onClick={() =>
                                    setGainersLosers("all")
                                }
                                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${gainersLosers === "all"
                                        ? "bg-[#00d084] text-[#050e18]"
                                        : "bg-[#141e2d] text-slate-400 hover:text-white"
                                    }`}
                            >
                                All
                            </button>
                        </div>
                    </div>
                )}

                {/* Telegram Banner */}
                {bannerVisible && (
                    <div className="mb-6">
                        <TelegramBanner
                            onClose={() =>
                                setBannerVisible(false)
                            }
                        />
                    </div>
                )}

                {/* Main Content Layout */}
                <div className="rounded-2xl border border-white/[0.06] bg-[#0b1422] p-5 shadow-md sm:p-6">
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold text-slate-100">
                                {activeTab === "recent"
                                    ? "Recent Earnings (24h)"
                                    : activeTab === "top"
                                        ? "Strong Movers"
                                        : "All Tracked NSE Stocks"}
                            </h2>

                            <span className="rounded-full bg-[#00d084]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#00d084]">
                                {filteredStocks.length}{" "}
                                stocks
                            </span>
                        </div>

                        <span className="text-xs text-slate-500">
                            Updated live
                        </span>
                    </div>

                    <div className="mt-4">
                        {activeLoading ? (
                            <div className="w-full py-12 text-center text-sm font-medium text-slate-500">
                                {activeTab === "top"
                                    ? "Calculating strong movers..."
                                    : "Loading data..."}
                            </div>
                        ) : filteredStocks.length ===
                            0 ? (
                            <div className="w-full py-12 text-center text-sm font-medium text-slate-500">
                                No data available
                            </div>
                        ) : (
                            <EarningsTable
                                stocks={filteredStocks}
                                isTopStocks={
                                    activeTab === "top"
                                }
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}