"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, Star, ArrowLeft } from "lucide-react";
import DashboardHeader from "../components/DashboardHeader";

interface StockDetailClientProps {
    symbol: string;
}

export default function StockDetailClient({ symbol }: StockDetailClientProps) {
    const ticker = symbol.toUpperCase();

    const [activeTab, setActiveTab] = useState<"Financials" | "Growth" | "Fundamentals" | "AI Insights">("Financials");
    const [starred, setStarred] = useState(false);

    const stockData = {
        name: ticker === "RELIANCE" ? "Reliance Industries Ltd" : `${ticker} Corporation`,
        symbol: ticker,
        sector: "Energy & Petrochem",
        quarter: "Q3 FY25",
        status: "Earnings Beat",
        score: 82,
        metrics: [
            { label: "REVENUE", value: "₹2,58,027 Cr", change: "↑ +7.7% YoY" },
            { label: "PAT", value: "₹18,540 Cr", change: "↑ +11.7% YoY" },
            { label: "EBITDA", value: "₹48,003 Cr", change: "↑ +7.8% YoY" },
            { label: "EPS", value: "₹13.70", change: "↑ +9.2% QoQ" },
            { label: "NET MARGIN", value: "7.2%", change: "↑ +0.4pp QoQ" },
            { label: "DEBT-TO-EQUITY", value: "0.44", change: "↓ -0.03 QoQ" },
        ],
        aiInsights: [
            "Earnings beat consensus by 4.2% on stronger refining margins.",
            "Jio & Retail now contribute over 45% of consolidated EBITDA.",
            "Deleveraging trend improves balance-sheet resilience QoQ.",
            "Momentum score suggests continued positive re-rating potential.",
        ],
        scoringBreakdown: [
            { label: "Earnings Quality", score: 90 },
            { label: "Growth Momentum", score: 78 },
            { label: "Valuation", score: 65, warning: true },
            { label: "Management Efficiency", score: 85 },
        ],
        quarters: [
            { q: "Q2 FY24", rev: 68, pat: 10 },
            { q: "Q3 FY24", rev: 67, pat: 10 },
            { q: "Q4 FY24", rev: 70, pat: 10 },
            { q: "Q1 FY25", rev: 72, pat: 10 },
            { q: "Q2 FY25", rev: 73, pat: 10 },
            { q: "Q3 FY25", rev: 73, pat: 10 },
        ]
    };

    return (
        <div className="min-h-screen bg-[#070d18] text-white">
            <DashboardHeader />

            <main className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">

                {/* Back to Listings & Breadcrumb Header */}
                <div className="mb-6 flex items-center justify-between">
                    <Link
                        href="/apps/stockjump/dashboard"
                        className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0b1422] px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
                    </Link>

                    <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <Link href="/apps/stockjump/dashboard" className="hover:text-white transition">
                            Dashboard
                        </Link>
                        <span>›</span>
                        <span className="text-slate-200 font-semibold">{stockData.name}</span>
                    </div>
                </div>

                {/* Top Banner Card */}
                <div className="relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#0b1422] p-6 sm:p-8 shadow-md">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                                    {stockData.name}
                                </h1>
                                <span className="rounded-lg bg-[#12221b] border border-[#00d084]/20 px-2.5 py-1 text-xs font-bold text-[#00d084] tracking-wide">
                                    {stockData.symbol}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5 pt-1">
                                <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#131d2e] border border-white/5 px-3 py-1.5 text-xs font-medium text-slate-300">
                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> {stockData.sector}
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#131d2e] border border-white/5 px-3 py-1.5 text-xs font-medium text-slate-300">
                                    📅 {stockData.quarter}
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#00d084]/15 border border-[#00d084]/30 px-3 py-1.5 text-xs font-bold text-[#00d084]">
                                    ↗ {stockData.status}
                                </span>
                            </div>
                        </div>

                        {/* Right side: Score & Star */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setStarred(!starred)}
                                className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition ${starred
                                        ? "border-yellow-400/40 bg-yellow-400/10 text-yellow-400"
                                        : "border-white/10 bg-[#121c2e] text-slate-400 hover:text-white"
                                    }`}
                                aria-label="Bookmark stock"
                            >
                                <Star className={`h-5 w-5 ${starred ? "fill-yellow-400 text-yellow-400" : ""}`} />
                            </button>

                            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#070e1a] px-5 py-3">
                                <div className="text-right">
                                    <p className="text-2xl font-black tracking-tight text-[#00d084]">
                                        {stockData.score}
                                        <span className="text-xs font-semibold text-slate-500"> /100</span>
                                    </p>
                                    <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                        Stockjump Score
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Sub Navigation Tabs */}
                <div className="mt-8 flex border-b border-white/[0.06] gap-8">
                    {(["Financials", "Growth", "Fundamentals", "AI Insights"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 text-xs sm:text-sm font-bold transition relative ${activeTab === tab
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

                {/* Main Content Layout Grid */}
                <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">

                    {/* Left 2 Columns: Metrics & Revenue Chart */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* 6 Metrics Grid Cards */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            {stockData.metrics.map((m) => {
                                const isPositive = m.change.startsWith("↑");
                                return (
                                    <div key={m.label} className="rounded-2xl border border-white/[0.06] bg-[#0b1422] p-5 shadow-sm">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            {m.label}
                                        </p>
                                        <p className="mt-2 text-xl font-extrabold tracking-tight text-white">
                                            {m.value}
                                        </p>
                                        <p className={`mt-1 text-xs font-bold ${isPositive ? "text-[#00d084]" : "text-red-400"}`}>
                                            {m.change}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Revenue vs PAT Chart Section */}
                        <div className="rounded-2xl border border-white/[0.06] bg-[#0b1422] p-6 shadow-md">
                            <h3 className="text-sm font-bold text-slate-200">
                                📊 Revenue vs PAT — Last 6 Quarters (₹ Cr)
                            </h3>

                            <div className="mt-8 h-48 flex items-end justify-between gap-3 sm:gap-6 px-4">
                                {stockData.quarters.map((qItem, idx) => (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                        <div className="w-full flex items-end justify-center gap-1 h-36">
                                            {/* Revenue bar */}
                                            <div
                                                className="w-4 sm:w-6 rounded-t bg-[#00d084] transition-all hover:opacity-90"
                                                style={{ height: `${qItem.rev}%` }}
                                            />
                                            {/* PAT bar */}
                                            <div
                                                className="w-2 sm:w-3 rounded-t bg-amber-500 transition-all hover:opacity-90"
                                                style={{ height: `${qItem.pat * 2.5}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-medium text-slate-500 whitespace-nowrap">
                                            {qItem.q}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: AI Insights & Scoring Breakdown */}
                    <div className="space-y-6">

                        {/* AI Insights Box */}
                        <div className="rounded-2xl border border-white/[0.06] bg-[#0b1422] p-6 shadow-md">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-base">🤖</span>
                                <h3 className="text-sm font-bold text-white tracking-wide">
                                    AI Insights
                                </h3>
                            </div>

                            <ul className="space-y-3.5 text-xs leading-relaxed text-slate-300">
                                {stockData.aiInsights.map((insight, index) => (
                                    <li key={index} className="flex items-start gap-2.5">
                                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00d084]" />
                                        <span>{insight}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Scoring Breakdown Box */}
                        <div className="rounded-2xl border border-white/[0.06] bg-[#0b1422] p-6 shadow-md">
                            <div className="flex items-center gap-2 mb-5">
                                <span className="text-base">📈</span>
                                <h3 className="text-sm font-bold text-white tracking-wide">
                                    Scoring Breakdown
                                </h3>
                            </div>

                            <div className="space-y-4">
                                {stockData.scoringBreakdown.map((item) => (
                                    <div key={item.label} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs font-semibold">
                                            <span className="text-slate-400">{item.label}</span>
                                            <span className={item.warning ? "text-amber-400" : "text-[#00d084]"}>
                                                {item.score}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-[#121c2d]">
                                            <div
                                                className={`h-full rounded-full ${item.warning ? "bg-amber-500" : "bg-[#00d084]"}`}
                                                style={{ width: `${item.score}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Telegram Alert Box */}
                        <div className="rounded-2xl border border-[#0d4d6b] bg-[#072d42] p-6 shadow-md text-center">
                            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#168dcc] text-white shadow mb-3">
                                <Send className="h-4 w-4" fill="currentColor" />
                            </div>
                            <h4 className="text-sm font-bold text-white">
                                Track {ticker} on Telegram
                            </h4>
                            <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                                Get notified instantly when new earnings drop for this stock.
                            </p>
                            <a
                                href="#"
                                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#168dcc] py-3 text-xs font-bold text-white transition hover:bg-[#1b9de0] shadow"
                            >
                                <Send className="h-3.5 w-3.5" fill="currentColor" /> Join Channel
                            </a>
                        </div>

                    </div>

                </div>

            </main>
        </div>
    );
}