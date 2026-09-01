"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
    ArrowDown
} from "lucide-react";

import DashboardHeader from "./components/DashboardHeader";
import StockSearch from "./components/StockSearch";
import StockTabs, { type DashboardTab } from "./components/StockTabs";
import TelegramBanner from "./components/TelegramBanner";
import EarningsTable from "./components/EarningsTable";
import type { Stock } from "./components/types";
import { appConfig } from "../config";

export default function DashboardPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<DashboardTab>("top");
    const [bannerVisible, setBannerVisible] = useState(true);
    const [query, setQuery] = useState("");
    const [watchlist, setWatchlist] = useState<string[]>(["HDFCBANK"]);

    // State for API data only
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [recentStocks, setRecentStocks] = useState<Stock[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingRecent, setLoadingRecent] = useState<boolean>(false);

    // Top Stocks filters state
    const [sortBy, setSortBy] = useState<"PAT" | "EPS" | "Revenue Growth" | "P/E Ratio" | "ROE">("PAT");
    const [gainersLosers, setGainersLosers] = useState<"gainers" | "losers" | "all">("gainers");

    // Fetch Top/All stocks on initial load
    useEffect(() => {
        async function fetchStocks() {
            setLoading(true);
            try {
                const token = localStorage.getItem("stockjump_token");
                const response = await fetch(`${appConfig.api.baseUrl}/api/stocks`, {
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });
                const result = await response.json();
                const items = Array.isArray(result) ? result : (result.data || result.stocks || []);

                if (items.length > 0) {
                    const formatted: Stock[] = items.map((item: any) => ({
                        symbol: item.symbol || "",
                        companyName: item.stockName || item.companyName || "",
                        sector: item.sector || "General",
                        revenue: item.revenue ? `₹${(item.revenue / 100).toFixed(1)} Cr` : "N/A",
                        pat: item.netProfit ? `₹${(item.netProfit / 100).toFixed(1)} Cr` : "N/A",
                        eps: item.eps !== undefined && item.eps !== null ? item.eps.toFixed(2) : "0.00",
                        patGrowth: item.patGrowth || 0.0,
                        sentiment: item.sentiment || "In-Line",
                        trendType: (item.patGrowth || 0) >= 0 ? "bullish" : "bearish",
                    }));
                    setStocks(formatted);
                }
            } catch (error) {
                console.error("Failed to fetch stocks:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchStocks();
    }, []);

    // Fetch API data when "recent" tab is active
    useEffect(() => {
        if (activeTab === "recent" && recentStocks.length === 0) {
            async function fetchRecentEarnings() {
                setLoadingRecent(true);
                try {
                    const token = localStorage.getItem("stockjump_token");
                    const response = await fetch(`${appConfig.api.baseUrl}/api/recent/quarterly`, {
                        headers: {
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                    });
                    const result = await response.json();
                    const items = Array.isArray(result) ? result : (result.data || result.stocks || []);

                    if (items.length > 0) {
                        const formatted: Stock[] = items.map((item: any) => ({
                            symbol: item.symbol || "",
                            companyName: item.stockName || item.companyName || "",
                            sector: item.sector || "General",
                            revenue: item.revenue ? `₹${(item.revenue / 100).toFixed(1)} Cr` : "N/A",
                            pat: item.netProfit ? `₹${(item.netProfit / 100).toFixed(1)} Cr` : "N/A",
                            eps: item.eps !== undefined && item.eps !== null ? item.eps.toFixed(2) : "0.00",
                            patGrowth: item.patGrowth || 0.0,
                            sentiment: item.sentiment || "In-Line",
                            quarter: item.quarter,
                            year: item.year,
                            broadcastDate: item.broadcastDate,
                            trendType: (item.patGrowth || 0) >= 0 ? "bullish" : "bearish",
                        }));
                        setRecentStocks(formatted);
                    }
                } catch (error) {
                    console.error("Failed to fetch recent quarterly earnings:", error);
                } finally {
                    setLoadingRecent(false);
                }
            }

            fetchRecentEarnings();
        }
    }, [activeTab, recentStocks.length]);

    function toggleWatchlist(symbol: string) {
        setWatchlist((current) =>
            current.includes(symbol)
                ? current.filter((item) => item !== symbol)
                : [...current, symbol]
        );
    }

    const filteredStocks = useMemo(() => {
        let result = activeTab === "recent" ? [...recentStocks] : [...stocks];

        if (query) {
            const search = query.toLowerCase();
            result = result.filter((stock) => {
                const symbol = stock.symbol ?? "";
                const companyName = stock.companyName ?? "";
                const sector = stock.sector ?? "";

                return (
                    symbol.toLowerCase().includes(search) ||
                    companyName.toLowerCase().includes(search) ||
                    sector.toLowerCase().includes(search)
                );
            });
        }

        if (activeTab === "top") {
            if (gainersLosers === "gainers") {
                result = result.filter((s) => (Number(s.patGrowth ?? 0) >= 0));
            } else if (gainersLosers === "losers") {
                result = result.filter((s) => (Number(s.patGrowth ?? 0) < 0));
            }

            result.sort((a, b) => {
                const patGrowthA = Number(a.patGrowth ?? 0);
                const patGrowthB = Number(b.patGrowth ?? 0);
                const epsA = Number(a.eps ?? 0);
                const epsB = Number(b.eps ?? 0);

                if (sortBy === "EPS") return epsB - epsA;
                if (sortBy === "Revenue Growth") return patGrowthB - patGrowthA;
                return patGrowthB - patGrowthA;
            });
        }

        return result;
    }, [activeTab, recentStocks, stocks, query, sortBy, gainersLosers]);

    return (
        <div className="min-h-screen bg-[#070d18] text-white">
            <DashboardHeader />

            <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">

                {/* Search and Tabs Header */}
                <div className="mb-6 flex flex-col gap-4">
                    <div className="mx-auto w-full max-w-2xl">
                        <StockSearch onSearch={setQuery} />
                    </div>
                    <div className="flex justify-center">
                        <StockTabs activeTab={activeTab} onChange={setActiveTab} />
                    </div>
                </div>

                {/* Conditional Sub-Filters for "Top Stocks" Tab */}
                {activeTab === "top" && (
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-[#0b1422] p-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-slate-400 mr-2">Sort by:</span>
                            {(["PAT", "EPS", "Revenue Growth", "P/E Ratio", "ROE"] as const).map((criteria) => (
                                <button
                                    key={criteria}
                                    onClick={() => setSortBy(criteria)}
                                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${sortBy === criteria
                                            ? "bg-[#00d084] text-[#050e18]"
                                            : "bg-[#141e2d] text-slate-400 hover:text-white"
                                        }`}
                                >
                                    {criteria}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setGainersLosers("gainers")}
                                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${gainersLosers === "gainers"
                                        ? "bg-[#00d084] text-[#050e18]"
                                        : "bg-[#141e2d] text-slate-400 hover:text-white"
                                    }`}
                            >
                                <ArrowUp className="h-3.5 w-3.5" /> Top Gainers
                            </button>
                            <button
                                onClick={() => setGainersLosers("losers")}
                                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${gainersLosers === "losers"
                                        ? "bg-red-500 text-white"
                                        : "bg-[#141e2d] text-slate-400 hover:text-white"
                                    }`}
                            >
                                <ArrowDown className="h-3.5 w-3.5" /> Top Losers
                            </button>
                        </div>
                    </div>
                )}

                {/* Telegram Banner */}
                {bannerVisible && (
                    <div className="mb-6">
                        <TelegramBanner onClose={() => setBannerVisible(false)} />
                    </div>
                )}

                {/* Main Content Layout */}
                <div className="rounded-2xl border border-white/[0.06] bg-[#0b1422] p-5 sm:p-6 shadow-md">
                    <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold text-slate-100">
                                {activeTab === "recent"
                                    ? "Recent Earnings (24h)"
                                    : activeTab === "top"
                                        ? "Top Ranked Stocks"
                                        : "All Tracked NSE Stocks"}
                            </h2>
                            <span className="rounded-full bg-[#00d084]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#00d084]">
                                {filteredStocks.length} stocks
                            </span>
                        </div>
                        <span className="text-xs text-slate-500">
                            Updated live
                        </span>
                    </div>

                    <div className="mt-4">
                        {(activeTab === "recent" && loadingRecent) || (activeTab !== "recent" && loading) ? (
                            <div className="w-full py-12 text-center text-sm font-medium text-slate-500">
                                Loading data...
                            </div>
                        ) : filteredStocks.length === 0 ? (
                            <div className="w-full py-12 text-center text-sm font-medium text-slate-500">
                                No data available
                            </div>
                        ) : (
                            <EarningsTable stocks={filteredStocks} isTopStocks={activeTab === "top"} />
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
}