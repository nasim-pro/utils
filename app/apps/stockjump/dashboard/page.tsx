"use client";

import { useMemo, useState } from "react";
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

const stocks: Stock[] = [
    {
        symbol: "RELIANCE",
        companyName: "Reliance Industries",
        sector: "Energy",
        revenue: "₹2,58,000 Cr",
        pat: "₹18,540 Cr",
        eps: "27.4",
        patGrowth: 12.8,
        sentiment: "Beat",
        rank: 1,
        score: 94,
        trendType: "bullish",
    },
    {
        symbol: "HDFCBANK",
        companyName: "HDFC Bank",
        sector: "Banking",
        revenue: "₹1,07,900 Cr",
        pat: "₹16,820 Cr",
        eps: "22.1",
        patGrowth: 7.3,
        sentiment: "In-Line",
        rank: 2,
        score: 91,
        trendType: "bullish",
    },
    {
        symbol: "TCS",
        companyName: "Tata Consultancy Svcs",
        sector: "IT Services",
        revenue: "₹60,580 Cr",
        pat: "₹12,105 Cr",
        eps: "33.2",
        patGrowth: 9.4,
        sentiment: "Beat",
        rank: 3,
        score: 78,
        trendType: "neutral",
    },
    {
        symbol: "ICICIBANK",
        companyName: "ICICI Bank",
        sector: "Banking",
        revenue: "₹45,200 Cr",
        pat: "₹11,270 Cr",
        eps: "16.9",
        patGrowth: 14.2,
        sentiment: "Beat",
        rank: 4,
        score: 85,
        trendType: "bullish",
    },
    {
        symbol: "INFY",
        companyName: "Infosys",
        sector: "IT Services",
        revenue: "₹38,320 Cr",
        pat: "₹6,840 Cr",
        eps: "15.8",
        patGrowth: -3.1,
        sentiment: "Miss",
        rank: 5,
        score: 72,
        trendType: "bearish",
    },
    {
        symbol: "BHARTIARTL",
        companyName: "Bharti Airtel",
        sector: "Telecom",
        revenue: "₹32,400 Cr",
        pat: "₹5,320 Cr",
        eps: "9.4",
        patGrowth: 11.0,
        sentiment: "Beat",
        rank: 6,
        score: 81,
        trendType: "bullish",
    },
    {
        symbol: "LT",
        companyName: "Larsen & Toubro",
        sector: "Infrastructure",
        revenue: "₹55,100 Cr",
        pat: "₹4,110 Cr",
        eps: "29.8",
        patGrowth: 8.5,
        sentiment: "In-Line",
        rank: 7,
        score: 58,
        trendType: "neutral",
    },
    {
        symbol: "TATAMOTORS",
        companyName: "Tata Motors",
        sector: "Automobile",
        revenue: "₹1,05,000 Cr",
        pat: "₹3,780 Cr",
        eps: "11.2",
        patGrowth: -4.5,
        sentiment: "Miss",
        rank: 8,
        score: 49,
        trendType: "bearish",
    },
];

export default function DashboardPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<DashboardTab>("top");
    const [bannerVisible, setBannerVisible] = useState(true);
    const [query, setQuery] = useState("");
    const [watchlist, setWatchlist] = useState<string[]>(["HDFCBANK"]);

    // Top Stocks filters state
    const [sortBy, setSortBy] = useState<"PAT" | "EPS" | "Revenue Growth" | "P/E Ratio" | "ROE">("PAT");
    const [gainersLosers, setGainersLosers] = useState<"gainers" | "losers" | "all">("gainers");

    function toggleWatchlist(symbol: string) {
        setWatchlist((current) =>
            current.includes(symbol)
                ? current.filter((item) => item !== symbol)
                : [...current, symbol]
        );
    }

    const filteredStocks = useMemo(() => {
        let result = [...stocks];

        if (query) {
            const search = query.toLowerCase();
            result = result.filter(
                (stock) =>
                    stock.symbol.toLowerCase().includes(search) ||
                    stock.companyName.toLowerCase().includes(search) ||
                    stock.sector.toLowerCase().includes(search)
            );
        }

        if (activeTab === "top") {
            if (gainersLosers === "gainers") {
                result = result.filter(s => s.patGrowth >= 0);
            } else if (gainersLosers === "losers") {
                result = result.filter(s => s.patGrowth < 0);
            }

            result.sort((a, b) => {
                if (sortBy === "EPS") return parseFloat(b.eps) - parseFloat(a.eps);
                if (sortBy === "Revenue Growth") return b.patGrowth - a.patGrowth;
                return b.patGrowth - a.patGrowth; // Default PAT sorting priority
            });
        }

        return result;
    }, [activeTab, query, sortBy, gainersLosers]);

    const watchlistStocks = useMemo(() => {
        return stocks.filter((s) => watchlist.includes(s.symbol));
    }, [watchlist]);

    function handleLogout() {
        localStorage.removeItem("stockjump_token");
        router.replace(appConfig.links.login);
    }

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
                            Updated 2 min ago • Q3 FY25
                        </span>
                    </div>

                    <div className="mt-4">
                        <EarningsTable stocks={filteredStocks} isTopStocks={activeTab === "top"} />
                    </div>
                </div>

            </main>
        </div>
    );
}