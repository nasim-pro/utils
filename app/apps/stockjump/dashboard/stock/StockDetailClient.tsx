"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    AlertTriangle,
    ArrowLeft,
    Send,
    Sparkles,
    Star,
} from "lucide-react";
import DashboardHeader from "../components/DashboardHeader";
import {
    fetchAnalysisHistory,
    fetchQuarterlyHistory,
    fetchStockDetail,
    fetchYearlyHistory,
    filterByBasis,
    type AnalysisRecord,
    type ResultRecord,
    type StockDetailData,
} from "../lib/api";
import {
    calculateGrowth,
    formatCrores,
    formatDate,
    formatDateTime,
    formatGrowth,
    formatNumber,
    formatRupees,
    growthClass,
    periodLabel,
} from "../lib/format";

interface StockDetailClientProps {
    symbol: string;
}

type BasisMode =
    | "preferred"
    | "consolidated"
    | "standalone";

type DetailTab =
    | "Financials"
    | "Growth"
    | "Fundamentals"
    | "AI Insights";

type MetricField =
    | "revenue"
    | "operatingProfit"
    | "profitBeforeTax"
    | "netProfit"
    | "eps";

function analysisFromResult(
    record: ResultRecord | null
): AnalysisRecord | null {
    if (!record) {
        return null;
    }

    const insight =
        record.aiInsight ?? record.aiSummary ?? null;
    const analysis = record.aiAnalysis ?? null;

    if (!insight && !analysis) {
        return null;
    }

    return {
        symbol: record.symbol,
        year: record.year,
        quarter: record.quarter,
        consolidated: record.consolidated,
        reportType: record.reportType,
        insight,
        analysis,
        sentiment: record.aiSentiment ?? null,
        aiModel: record.aiModel ?? null,
        promptVersion:
            record.aiPromptVersion ?? null,
        status: "completed",
        updatedAt:
            record.aiUpdatedAt ??
            record.updatedAt ??
            null,
    };
}

function matchesBasis(
    record: {
        consolidated?: boolean;
        reportType?: string;
    },
    mode: BasisMode
): boolean {
    if (mode === "preferred") {
        return true;
    }

    const consolidated =
        record.consolidated === true ||
        record.reportType === "consolidated";

    return mode === "consolidated"
        ? consolidated
        : !consolidated;
}

function previousQuarter(
    series: ResultRecord[],
    record: ResultRecord | null
): ResultRecord | null {
    if (!record?.quarter || !record.year) {
        return null;
    }

    const target: Record<string, [number, string]> =
    {
        Q1: [record.year - 1, "Q4"],
        Q2: [record.year, "Q1"],
        Q3: [record.year, "Q2"],
        Q4: [record.year, "Q3"],
    };

    const pair = target[record.quarter];

    if (!pair) {
        return null;
    }

    return (
        series.find(
            (item) =>
                item.year === pair[0] &&
                item.quarter === pair[1]
        ) ?? null
    );
}

function sameQuarterLastYear(
    series: ResultRecord[],
    record: ResultRecord | null
): ResultRecord | null {
    if (!record?.quarter || !record.year) {
        return null;
    }

    return (
        series.find(
            (item) =>
                item.year === record.year! - 1 &&
                item.quarter === record.quarter
        ) ?? null
    );
}

function previousYear(
    series: ResultRecord[],
    record: ResultRecord | null
): ResultRecord | null {
    if (!record?.year) {
        return null;
    }

    return (
        series.find(
            (item) =>
                item.year === record.year! - 1
        ) ?? null
    );
}

function growth(
    current: ResultRecord | null,
    previous: ResultRecord | null,
    field: MetricField
): number | null {
    return calculateGrowth(
        current?.metricsInCrores?.[field],
        previous?.metricsInCrores?.[field]
    );
}

function basisLabel(consolidated?: boolean): string {
    return consolidated
        ? "Consolidated"
        : "Standalone";
}

function sentimentClass(
    sentiment?: string | null
): string {
    if (sentiment === "bullish") {
        return "border-[#00d084]/20 bg-[#00d084]/10 text-[#00d084]";
    }

    if (sentiment === "bearish") {
        return "border-red-500/20 bg-red-500/10 text-red-300";
    }

    return "border-slate-500/20 bg-slate-500/10 text-slate-300";
}

function statusClass(status?: string | null): string {
    if (status === "completed") {
        return "bg-[#00d084]/10 text-[#00d084]";
    }

    if (status === "failed") {
        return "bg-red-500/10 text-red-300";
    }

    if (status === "pending") {
        return "bg-amber-500/10 text-amber-300";
    }

    return "bg-slate-500/10 text-slate-300";
}

function MetricTrendChart({
    records,
}: {
    records: ResultRecord[];
}) {
    const data = records.slice(0, 8).reverse();

    if (data.length === 0) {
        return (
            <div className="py-16 text-center text-xs text-slate-500">
                No quarterly history available yet.
            </div>
        );
    }

    const values = data.flatMap((record) => [
        record.metricsInCrores?.revenue ?? 0,
        record.metricsInCrores?.netProfit ?? 0,
    ]);

    const max = Math.max(1, ...values);
    const min = Math.min(0, ...values);
    const range = max - min || 1;

    const width = 720;
    const height = 260;
    const padding = {
        top: 16,
        right: 16,
        bottom: 34,
        left: 16,
    };
    const innerWidth =
        width - padding.left - padding.right;
    const innerHeight =
        height - padding.top - padding.bottom;

    const y = (value: number) =>
        padding.top +
        ((max - value) / range) * innerHeight;

    const zeroY = y(0);
    const groupWidth = innerWidth / data.length;
    const revenueWidth = Math.min(
        24,
        groupWidth * 0.3
    );
    const profitWidth = Math.min(
        12,
        groupWidth * 0.16
    );

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label="Revenue and net profit by quarter"
            className="h-64 w-full"
        >
            <line
                x1={padding.left}
                x2={width - padding.right}
                y1={zeroY}
                y2={zeroY}
                stroke="#334155"
                strokeWidth="1"
            />

            {data.map((record, index) => {
                const center =
                    padding.left +
                    groupWidth * index +
                    groupWidth / 2;

                const revenue =
                    record.metricsInCrores?.revenue ??
                    null;
                const profit =
                    record.metricsInCrores?.netProfit ??
                    null;

                const revenueTop = y(revenue ?? 0);
                const profitTop = y(profit ?? 0);

                return (
                    <g
                        key={`${record.year}-${
                            record.quarter
                        }-${index}`}
                    >
                        <rect
                            x={center - revenueWidth - 2}
                            y={Math.min(
                                revenueTop,
                                zeroY
                            )}
                            width={revenueWidth}
                            height={Math.max(
                                2,
                                Math.abs(
                                    zeroY - revenueTop
                                )
                            )}
                            rx="2"
                            fill="#00d084"
                        >
                            <title>
                                {periodLabel(
                                    record.year,
                                    record.quarter
                                )}{" "}
                                revenue:{" "}
                                {formatCrores(revenue)}
                            </title>
                        </rect>

                        <rect
                            x={center + 2}
                            y={Math.min(
                                profitTop,
                                zeroY
                            )}
                            width={profitWidth}
                            height={Math.max(
                                2,
                                Math.abs(
                                    zeroY - profitTop
                                )
                            )}
                            rx="2"
                            fill="#f59e0b"
                        >
                            <title>
                                {periodLabel(
                                    record.year,
                                    record.quarter
                                )}{" "}
                                PAT:{" "}
                                {formatCrores(profit)}
                            </title>
                        </rect>

                        <text
                            x={center}
                            y={height - 10}
                            textAnchor="middle"
                            fill="#64748b"
                            fontSize="10"
                        >
                            {record.quarter ?? "-"}
                            {record.year
                                ? ` '${String(
                                      record.year
                                  ).slice(-2)}`
                                : ""}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

function DataQualityNotice({
    record,
}: {
    record: ResultRecord | null;
}) {
    const warnings =
        record?.dataQuality?.warnings ?? [];

    if (warnings.length === 0) {
        return null;
    }

    return (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-amber-300">
                <AlertTriangle className="h-3.5 w-3.5" />
                Data quality notes
            </p>

            <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-amber-100/70">
                {warnings.slice(0, 4).map((warning) => (
                    <li key={warning}>• {warning}</li>
                ))}
            </ul>
        </div>
    );
}

export default function StockDetailClient({
    symbol,
}: StockDetailClientProps) {
    const ticker = symbol.toUpperCase();

    const [activeTab, setActiveTab] =
        useState<DetailTab>("Financials");
    const [basisMode, setBasisMode] =
        useState<BasisMode>("preferred");
    const [starred, setStarred] = useState(false);

    const [detail, setDetail] =
        useState<StockDetailData | null>(null);
    const [quarterly, setQuarterly] = useState<
        ResultRecord[]
    >([]);
    const [yearly, setYearly] = useState<
        ResultRecord[]
    >([]);
    const [analyses, setAnalyses] = useState<
        AnalysisRecord[]
    >([]);
    const [analysisSupported, setAnalysisSupported] =
        useState(true);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError("");
            setBasisMode("preferred");

            const results = await Promise.allSettled([
                fetchStockDetail(ticker),
                fetchQuarterlyHistory(ticker, {
                    limit: 40,
                    consolidated: "all",
                }),
                fetchYearlyHistory(ticker, {
                    limit: 12,
                    consolidated: "all",
                }),
                fetchAnalysisHistory(ticker, {
                    limit: 12,
                    consolidated: "all",
                }),
            ]);

            if (cancelled) {
                return;
            }

            let detailData: StockDetailData | null =
                null;
            let quarterlyData: ResultRecord[] = [];
            let yearlyData: ResultRecord[] = [];
            let analysisData: AnalysisRecord[] = [];
            let analysisEndpointSupported = true;
            const errors: string[] = [];

            const [detailResult, quarterlyResult, yearlyResult, analysisResult] =
                results;

            if (detailResult.status === "fulfilled") {
                detailData = detailResult.value;
                setDetail(detailData);
            } else {
                errors.push(
                    detailResult.reason instanceof Error
                        ? detailResult.reason.message
                        : "Unable to load stock detail"
                );
            }

            if (quarterlyResult.status === "fulfilled") {
                quarterlyData = quarterlyResult.value.data;
                setQuarterly(quarterlyData);
            } else {
                errors.push(
                    quarterlyResult.reason instanceof Error
                        ? quarterlyResult.reason.message
                        : "Unable to load quarterly history"
                );
            }

            if (yearlyResult.status === "fulfilled") {
                yearlyData = yearlyResult.value.data;
                setYearly(yearlyData);
            } else {
                errors.push(
                    yearlyResult.reason instanceof Error
                        ? yearlyResult.reason.message
                        : "Unable to load yearly history"
                );
            }

            if (analysisResult.status === "fulfilled") {
                analysisData = analysisResult.value.data;
                analysisEndpointSupported =
                    analysisResult.value.supported;
                setAnalyses(analysisData);
            } else {
                analysisEndpointSupported = false;
                setAnalyses([]);
            }

            setAnalysisSupported(
                analysisEndpointSupported
            );

            const hasAnyData =
                Boolean(detailData) ||
                quarterlyData.length > 0 ||
                yearlyData.length > 0;

            if (!hasAnyData) {
                setError(
                    errors[0] ??
                    `No financial data available for ${ticker}.`
                );
            }

            setLoading(false);
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [ticker]);

    const preferredQuarterly = useMemo(
        () => filterByBasis(quarterly, "preferred"),
        [quarterly]
    );

    const preferredYearly = useMemo(
        () => filterByBasis(yearly, "preferred"),
        [yearly]
    );

    const selectedQuarterly = useMemo(() => {
        const filtered = filterByBasis(
            quarterly,
            basisMode
        );

        if (filtered.length > 0) {
            return filtered;
        }

        if (basisMode === "consolidated") {
            return detail?.quarterly.consolidated
                ? [detail.quarterly.consolidated]
                : [];
        }

        if (basisMode === "standalone") {
            return detail?.quarterly.standalone
                ? [detail.quarterly.standalone]
                : [];
        }

        return detail?.latestQuarter
            ? [detail.latestQuarter]
            : [];
    }, [quarterly, basisMode, detail]);

    const selectedYearly = useMemo(() => {
        const filtered = filterByBasis(
            yearly,
            basisMode
        );

        if (filtered.length > 0) {
            return filtered;
        }

        if (basisMode === "consolidated") {
            return detail?.yearly.consolidated
                ? [detail.yearly.consolidated]
                : [];
        }

        if (basisMode === "standalone") {
            return detail?.yearly.standalone
                ? [detail.yearly.standalone]
                : [];
        }

        return detail?.latestYear
            ? [detail.latestYear]
            : [];
    }, [yearly, basisMode, detail]);

    const latestQuarter = selectedQuarterly[0] ?? null;
    const latestYear = selectedYearly[0] ?? null;

    const previousQuarterRecord = previousQuarter(
        selectedQuarterly,
        latestQuarter
    );
    const yearAgoQuarter = sameQuarterLastYear(
        selectedQuarterly,
        latestQuarter
    );
    const previousYearRecord = previousYear(
        selectedYearly,
        latestYear
    );

    const summaryRecord =
        latestQuarter ?? latestYear;

    /**
     * Company-level fundamentals are usually attached to the yearly record,
     * while the latest quarter carries the result metrics. Fall back across
     * both so the Fundamentals tab is not empty for stocks whose latest
     * quarter record omits them.
     */
    const fundamentals = {
        pe: latestQuarter?.pe ?? latestYear?.pe ?? null,
        pb: latestQuarter?.pb ?? latestYear?.pb ?? null,
        bookValue:
            latestQuarter?.bookValue ??
            latestYear?.bookValue ??
            null,
        debt: latestQuarter?.debt ?? latestYear?.debt ?? null,
        marketCap:
            latestQuarter?.marketCap ??
            latestYear?.marketCap ??
            null,
        promoterHolding:
            latestQuarter?.promoterHolding ??
            latestYear?.promoterHolding ??
            null,
        currentPrice:
            latestQuarter?.currentPrice ??
            latestYear?.currentPrice ??
            null,
    };

    const companyName =
        detail?.stockName ??
        latestQuarter?.stockName ??
        latestYear?.stockName ??
        ticker;

    const latestPeriod = periodLabel(
        latestQuarter?.year ?? latestYear?.year,
        latestQuarter?.quarter
    );

    const hasConsolidated =
        quarterly.some((record) => record.consolidated) ||
        yearly.some((record) => record.consolidated) ||
        Boolean(
            detail?.quarterly.consolidated ??
            detail?.yearly.consolidated
        );

    const hasStandalone =
        quarterly.some((record) => !record.consolidated) ||
        yearly.some((record) => !record.consolidated) ||
        Boolean(
            detail?.quarterly.standalone ??
            detail?.yearly.standalone
        );

    const usesLegacyUnits = [
        ...selectedQuarterly,
        ...selectedYearly,
    ].some(
        (record) =>
            record.metricsSource === "legacy" ||
            record.legacyUnits === true
    );

    const unitNote = summaryRecord
        ? summaryRecord.legacyUnits
            ? "This record has no unit metadata, so values are assumed to be ₹ Cr. Older consolidated filings may use a different unit."
            : summaryRecord.metricsSource === "api"
                ? "Normalized by the API to ₹ Cr"
                : summaryRecord.metricsSource === "unit"
                    ? `Converted from ${
                          summaryRecord.unit ??
                          summaryRecord.amountUnit ??
                          "reported units"
                      } to ₹ Cr`
                    : "Legacy record without unit metadata — assumed ₹ Cr"
        : null;

    const relevantAnalyses = useMemo(
        () =>
            analyses.filter((analysis) =>
                matchesBasis(analysis, basisMode)
            ),
        [analyses, basisMode]
    );

    const matchingAnalysis =
        relevantAnalyses.find(
            (analysis) =>
                analysis.year === latestQuarter?.year &&
                analysis.quarter ===
                latestQuarter?.quarter
        ) ?? relevantAnalyses[0];

    const detailAnalysis =
        detail?.analysis &&
            matchesBasis(detail.analysis, basisMode)
            ? detail.analysis
            : null;

    const latestAnalysis =
        matchingAnalysis ??
        detailAnalysis ??
        analysisFromResult(
            latestQuarter ?? latestYear
        );

    const analysisHistory =
        relevantAnalyses.length > 0
            ? relevantAnalyses
            : latestAnalysis
                ? [latestAnalysis]
                : [];

    const metricCards = summaryRecord
        ? [
            {
                label: "Revenue",
                value: formatCrores(
                    summaryRecord.metricsInCrores
                        ?.revenue
                ),
                qoq: latestQuarter
                    ? growth(
                        latestQuarter,
                        previousQuarterRecord,
                        "revenue"
                    )
                    : null,
                yoy: latestQuarter
                    ? growth(
                        latestQuarter,
                        yearAgoQuarter,
                        "revenue"
                    )
                    : growth(
                        latestYear,
                        previousYearRecord,
                        "revenue"
                    ),
            },
            {
                label: "Net profit",
                value: formatCrores(
                    summaryRecord.metricsInCrores
                        ?.netProfit
                ),
                qoq: latestQuarter
                    ? growth(
                        latestQuarter,
                        previousQuarterRecord,
                        "netProfit"
                    )
                    : null,
                yoy: latestQuarter
                    ? growth(
                        latestQuarter,
                        yearAgoQuarter,
                        "netProfit"
                    )
                    : growth(
                        latestYear,
                        previousYearRecord,
                        "netProfit"
                    ),
            },
            {
                label: "Operating profit",
                value: formatCrores(
                    summaryRecord.metricsInCrores
                        ?.operatingProfit
                ),
                qoq: latestQuarter
                    ? growth(
                        latestQuarter,
                        previousQuarterRecord,
                        "operatingProfit"
                    )
                    : null,
                yoy: latestQuarter
                    ? growth(
                        latestQuarter,
                        yearAgoQuarter,
                        "operatingProfit"
                    )
                    : null,
            },
            {
                label: "EPS",
                value: formatRupees(
                    summaryRecord.metricsInCrores
                        ?.eps ??
                    summaryRecord.eps
                ),
                qoq: latestQuarter
                    ? growth(
                        latestQuarter,
                        previousQuarterRecord,
                        "eps"
                    )
                    : null,
                yoy: latestQuarter
                    ? growth(
                        latestQuarter,
                        yearAgoQuarter,
                        "eps"
                    )
                    : null,
            },
            {
                label: "Current price",
                value: formatRupees(
                    fundamentals.currentPrice
                ),
                qoq: null,
                yoy: null,
            },
            {
                label: "Market cap",
                value: formatCrores(
                    fundamentals.marketCap
                ),
                qoq: null,
                yoy: null,
            },
        ]
        : [];

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

    if (
        !latestQuarter &&
        !latestYear &&
        preferredQuarterly.length === 0 &&
        preferredYearly.length === 0
    ) {
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

                <div className="relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#0b1422] p-6 shadow-md sm:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                                    {companyName}
                                </h1>

                                <span className="rounded-lg border border-[#00d084]/20 bg-[#12221b] px-2.5 py-1 text-xs font-bold tracking-wide text-[#00d084]">
                                    {ticker}
                                </span>

                                {latestQuarter?.hasAiAnalysis && (
                                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-purple-400/20 bg-purple-400/10 px-2.5 py-1 text-[10px] font-bold text-purple-200">
                                        <Sparkles className="h-3 w-3" />
                                        AI analyzed
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5">
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

                                {summaryRecord && (
                                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/5 bg-[#131d2e] px-3 py-1.5 text-xs font-medium text-slate-300">
                                        {basisLabel(
                                            summaryRecord.consolidated
                                        )}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    Basis
                                </span>

                                {(
                                    [
                                        {
                                            id: "preferred" as const,
                                            label: "Preferred",
                                            enabled: true,
                                        },
                                        {
                                            id: "consolidated" as const,
                                            label: "Consolidated",
                                            enabled:
                                                hasConsolidated,
                                        },
                                        {
                                            id: "standalone" as const,
                                            label: "Standalone",
                                            enabled:
                                                hasStandalone,
                                        },
                                    ]
                                ).map((option) => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        disabled={!option.enabled}
                                        onClick={() =>
                                            setBasisMode(
                                                option.id
                                            )
                                        }
                                        className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold transition disabled:cursor-not-allowed disabled:opacity-30 ${
                                            basisMode ===
                                                option.id
                                                ? "border-[#00d084]/30 bg-[#00d084]/10 text-[#00d084]"
                                                : "border-white/[0.08] bg-[#111b2b] text-slate-400 hover:text-slate-200"
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>

                            {usesLegacyUnits && (
                                <p className="max-w-xl text-[10px] leading-relaxed text-amber-300/80">
                                    Some records have no unit
                                    metadata. Their values are
                                    treated as ₹ Cr, matching the
                                    backend&apos;s fallback, and
                                    may be inaccurate for older
                                    consolidated filings.
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setStarred(!starred)
                            }
                            className={`flex h-11 w-11 shrink-0 items-center justify-center self-start rounded-2xl border transition ${
                                starred
                                    ? "border-yellow-400/40 bg-yellow-400/10 text-yellow-400"
                                    : "border-white/10 bg-[#121c2e] text-slate-400 hover:text-white"
                            }`}
                            aria-label="Bookmark stock"
                        >
                            <Star
                                className={`h-5 w-5 ${
                                    starred
                                        ? "fill-yellow-400 text-yellow-400"
                                        : ""
                                }`}
                            />
                        </button>
                    </div>
                </div>

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
                            onClick={() =>
                                setActiveTab(tab)
                            }
                            className={`relative whitespace-nowrap pb-3 text-xs font-bold transition sm:text-sm ${
                                activeTab === tab
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

                {activeTab === "Financials" && (
                    <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
                        <div className="space-y-8 lg:col-span-2">
                            {metricCards.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    {metricCards.map((metric) => (
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

                                            <div className="mt-1 space-y-0.5">
                                                {metric.qoq !== null && (
                                                    <p
                                                        className={`text-[11px] font-bold ${growthClass(
                                                            metric.qoq
                                                        )}`}
                                                    >
                                                        {formatGrowth(
                                                            metric.qoq
                                                        )}{" "}
                                                        QoQ
                                                    </p>
                                                )}

                                                {metric.yoy !== null && (
                                                    <p
                                                        className={`text-[10px] font-semibold ${growthClass(
                                                            metric.yoy
                                                        )}`}
                                                    >
                                                        {formatGrowth(
                                                            metric.yoy
                                                        )}{" "}
                                                        YoY
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-white/[0.06] bg-[#0b1422] p-10 text-center text-xs text-slate-500">
                                    No quarterly result available
                                    for this basis.
                                </div>
                            )}

                            <div className="rounded-2xl border border-white/[0.06] bg-[#0b1422] p-6 shadow-md">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-200">
                                            📊 Revenue vs PAT
                                        </h3>

                                        <p className="mt-1 text-[11px] text-slate-500">
                                            Last{" "}
                                            {Math.min(
                                                8,
                                                selectedQuarterly.length
                                            )}{" "}
                                            reported quarters · ₹ Cr
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

                                <MetricTrendChart
                                    records={
                                        selectedQuarterly
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
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
                                            Basis
                                        </span>

                                        <span className="font-semibold text-slate-200">
                                            {summaryRecord
                                                ? basisLabel(
                                                    summaryRecord.consolidated
                                                )
                                                : "-"}
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-500">
                                            Revenue
                                        </span>

                                        <span className="font-semibold text-slate-200">
                                            {formatCrores(
                                                summaryRecord
                                                    ?.metricsInCrores
                                                    ?.revenue
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-500">
                                            Net Profit
                                        </span>

                                        <span className="font-semibold text-slate-200">
                                            {formatCrores(
                                                summaryRecord
                                                    ?.metricsInCrores
                                                    ?.netProfit
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-500">
                                            EPS
                                        </span>

                                        <span className="font-semibold text-slate-200">
                                            {formatRupees(
                                                summaryRecord
                                                    ?.metricsInCrores
                                                    ?.eps ??
                                                summaryRecord?.eps
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-500">
                                            Release
                                        </span>

                                        <span className="font-semibold text-slate-200">
                                            {formatDate(
                                                latestQuarter?.broadcastDate ??
                                                latestYear?.broadcastDate
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-500">
                                            Fundamental
                                        </span>

                                        <span className="font-semibold text-slate-200">
                                            {summaryRecord
                                                ?.isFinancial ===
                                            true
                                                ? "Financial company"
                                                : summaryRecord?.isFinancial ===
                                                    false
                                                    ? "Non-financial"
                                                    : "-"}
                                        </span>
                                    </div>
                                </div>

                                {summaryRecord?.dataQuality
                                    ?.operatingProfitNotApplicable && (
                                        <p className="mt-4 rounded-lg border border-white/[0.06] bg-[#111b2b] px-3 py-2 text-[10px] leading-relaxed text-slate-400">
                                            Operating profit is not
                                            applicable for this
                                            company&apos;s reporting
                                            format.
                                        </p>
                                    )}

                                {unitNote && (
                                    <p className="mt-4 text-[10px] leading-relaxed text-slate-500">
                                        {unitNote}
                                    </p>
                                )}

                                <div className="mt-5">
                                    <DataQualityNotice
                                        record={
                                            summaryRecord
                                        }
                                    />
                                </div>
                            </div>

                            <div className="rounded-2xl border border-white/[0.06] bg-[#0b1422] p-6 shadow-md">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-[#00d084]" />

                                    <h3 className="text-sm font-bold tracking-wide text-white">
                                        AI Take
                                    </h3>
                                </div>

                                {latestAnalysis ? (
                                    <>
                                        <div className="mt-4 flex flex-wrap items-center gap-2">
                                            <span
                                                className={`rounded-full border px-2.5 py-1 text-[10px] font-bold capitalize ${sentimentClass(
                                                    latestAnalysis.sentiment
                                                )}`}
                                            >
                                                {latestAnalysis.sentiment ??
                                                    "neutral"}
                                            </span>

                                            <span
                                                className={`rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${statusClass(
                                                    latestAnalysis.status
                                                )}`}
                                            >
                                                {latestAnalysis.status ??
                                                    "completed"}
                                            </span>
                                        </div>

                                        {latestAnalysis.insight ||
                                        latestAnalysis.analysis ? (
                                            <>
                                                <p className="mt-4 text-xs leading-relaxed text-slate-300">
                                                    {latestAnalysis.insight ??
                                                        latestAnalysis.analysis}
                                                </p>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setActiveTab(
                                                            "AI Insights"
                                                        )
                                                    }
                                                    className="mt-4 text-[11px] font-bold text-[#00d084] hover:underline"
                                                >
                                                    Read full analysis →
                                                </button>
                                            </>
                                        ) : (
                                            <p className="mt-4 text-xs leading-relaxed text-slate-400">
                                                {latestAnalysis.status ===
                                                "completed"
                                                    ? "The analysis completed but did not return a summary."
                                                    : `Analysis is ${
                                                          latestAnalysis.status ??
                                                          "queued"
                                                      }. It will appear here once the background worker finishes.`}
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <p className="mt-4 text-xs leading-relaxed text-slate-400">
                                        No AI analysis has been
                                        generated for this result
                                        yet.
                                    </p>
                                )}
                            </div>

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
                                    Get notified instantly when new
                                    earnings drop for this stock.
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

                {activeTab === "Growth" && (
                    <div className="mt-8 space-y-6">
                        <div className="rounded-2xl border border-white/[0.06] bg-[#0b1422] p-6">
                            <div className="flex flex-wrap items-end justify-between gap-3">
                                <div>
                                    <h3 className="text-sm font-bold text-white">
                                        Quarterly Growth
                                    </h3>

                                    <p className="mt-1 text-[11px] text-slate-500">
                                        QoQ compares the previous
                                        quarter, YoY the same quarter
                                        last year. Values are in ₹ Cr.
                                    </p>
                                </div>

                                <span className="rounded-lg border border-white/[0.06] bg-[#111b2b] px-2.5 py-1.5 text-[10px] font-bold text-slate-400">
                                    {basisMode === "preferred"
                                        ? "Preferred basis"
                                        : basisLabel(
                                            basisMode ===
                                                "consolidated"
                                        )}
                                </span>
                            </div>

                            <div className="mt-6 overflow-x-auto">
                                <table className="w-full min-w-[760px] text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-white/[0.06] text-[10px] uppercase tracking-wider text-slate-500">
                                            <th className="pb-3">
                                                Period
                                            </th>
                                            <th className="pb-3 text-right">
                                                Revenue
                                            </th>
                                            <th className="pb-3 text-right">
                                                QoQ
                                            </th>
                                            <th className="pb-3 text-right">
                                                YoY
                                            </th>
                                            <th className="pb-3 text-right">
                                                PAT
                                            </th>
                                            <th className="pb-3 text-right">
                                                QoQ
                                            </th>
                                            <th className="pb-3 text-right">
                                                YoY
                                            </th>
                                            <th className="pb-3 text-right">
                                                EPS
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {selectedQuarterly.map(
                                            (item, index) => {
                                                const prev =
                                                    previousQuarter(
                                                        selectedQuarterly,
                                                        item
                                                    );
                                                const lastYear =
                                                    sameQuarterLastYear(
                                                        selectedQuarterly,
                                                        item
                                                    );

                                                const revenueQoQ =
                                                    growth(
                                                        item,
                                                        prev,
                                                        "revenue"
                                                    );
                                                const revenueYoY =
                                                    growth(
                                                        item,
                                                        lastYear,
                                                        "revenue"
                                                    );
                                                const patQoQ =
                                                    growth(
                                                        item,
                                                        prev,
                                                        "netProfit"
                                                    );
                                                const patYoY =
                                                    growth(
                                                        item,
                                                        lastYear,
                                                        "netProfit"
                                                    );

                                                return (
                                                    <tr
                                                        key={`${item.year}-${item.quarter}-${index}`}
                                                        className="border-b border-white/[0.04] last:border-0"
                                                    >
                                                        <td className="py-4 font-semibold text-slate-200">
                                                            {periodLabel(
                                                                item.year,
                                                                item.quarter
                                                            )}
                                                        </td>

                                                        <td className="py-4 text-right font-semibold text-slate-300">
                                                            {formatCrores(
                                                                item
                                                                    .metricsInCrores
                                                                    ?.revenue
                                                            )}
                                                        </td>

                                                        <td
                                                            className={`py-4 text-right font-bold ${growthClass(
                                                                revenueQoQ
                                                            )}`}
                                                        >
                                                            {formatGrowth(
                                                                revenueQoQ
                                                            )}
                                                        </td>

                                                        <td
                                                            className={`py-4 text-right font-bold ${growthClass(
                                                                revenueYoY
                                                            )}`}
                                                        >
                                                            {formatGrowth(
                                                                revenueYoY
                                                            )}
                                                        </td>

                                                        <td className="py-4 text-right font-semibold text-slate-300">
                                                            {formatCrores(
                                                                item
                                                                    .metricsInCrores
                                                                    ?.netProfit
                                                            )}
                                                        </td>

                                                        <td
                                                            className={`py-4 text-right font-bold ${growthClass(
                                                                patQoQ
                                                            )}`}
                                                        >
                                                            {formatGrowth(
                                                                patQoQ
                                                            )}
                                                        </td>

                                                        <td
                                                            className={`py-4 text-right font-bold ${growthClass(
                                                                patYoY
                                                            )}`}
                                                        >
                                                            {formatGrowth(
                                                                patYoY
                                                            )}
                                                        </td>

                                                        <td className="py-4 text-right font-semibold text-slate-300">
                                                            {formatRupees(
                                                                item
                                                                    .metricsInCrores
                                                                    ?.eps ??
                                                                item.eps
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )}

                                        {selectedQuarterly.length ===
                                            0 && (
                                                <tr>
                                                    <td
                                                        colSpan={8}
                                                        className="py-10 text-center text-xs text-slate-500"
                                                    >
                                                        No quarterly
                                                        history for
                                                        this basis.
                                                    </td>
                                                </tr>
                                            )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/[0.06] bg-[#0b1422] p-6">
                            <h3 className="text-sm font-bold text-white">
                                Yearly Growth
                            </h3>

                            <div className="mt-5 overflow-x-auto">
                                <table className="w-full min-w-[640px] text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-white/[0.06] text-[10px] uppercase tracking-wider text-slate-500">
                                            <th className="pb-3">
                                                Year
                                            </th>
                                            <th className="pb-3 text-right">
                                                Revenue
                                            </th>
                                            <th className="pb-3 text-right">
                                                YoY
                                            </th>
                                            <th className="pb-3 text-right">
                                                PAT
                                            </th>
                                            <th className="pb-3 text-right">
                                                YoY
                                            </th>
                                            <th className="pb-3 text-right">
                                                EPS
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {selectedYearly.map(
                                            (item, index) => {
                                                const prev =
                                                    previousYear(
                                                        selectedYearly,
                                                        item
                                                    );

                                                return (
                                                    <tr
                                                        key={`${item.year}-${index}`}
                                                        className="border-b border-white/[0.04] last:border-0"
                                                    >
                                                        <td className="py-4 font-semibold text-slate-200">
                                                            FY
                                                            {
                                                                item.year
                                                            }
                                                        </td>

                                                        <td className="py-4 text-right font-semibold text-slate-300">
                                                            {formatCrores(
                                                                item
                                                                    .metricsInCrores
                                                                    ?.revenue
                                                            )}
                                                        </td>

                                                        <td
                                                            className={`py-4 text-right font-bold ${growthClass(
                                                                growth(
                                                                    item,
                                                                    prev,
                                                                    "revenue"
                                                                )
                                                            )}`}
                                                        >
                                                            {formatGrowth(
                                                                growth(
                                                                    item,
                                                                    prev,
                                                                    "revenue"
                                                                )
                                                            )}
                                                        </td>

                                                        <td className="py-4 text-right font-semibold text-slate-300">
                                                            {formatCrores(
                                                                item
                                                                    .metricsInCrores
                                                                    ?.netProfit
                                                            )}
                                                        </td>

                                                        <td
                                                            className={`py-4 text-right font-bold ${growthClass(
                                                                growth(
                                                                    item,
                                                                    prev,
                                                                    "netProfit"
                                                                )
                                                            )}`}
                                                        >
                                                            {formatGrowth(
                                                                growth(
                                                                    item,
                                                                    prev,
                                                                    "netProfit"
                                                                )
                                                            )}
                                                        </td>

                                                        <td className="py-4 text-right font-semibold text-slate-300">
                                                            {formatRupees(
                                                                item
                                                                    .metricsInCrores
                                                                    ?.eps ??
                                                                item.eps
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )}

                                        {selectedYearly.length ===
                                            0 && (
                                                <tr>
                                                    <td
                                                        colSpan={6}
                                                        className="py-10 text-center text-xs text-slate-500"
                                                    >
                                                        No yearly
                                                        history for
                                                        this basis.
                                                    </td>
                                                </tr>
                                            )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "Fundamentals" && (
                    <div className="mt-8 space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {[
                                {
                                    label: "P/E",
                                    value:
                                        fundamentals.pe === null
                                            ? "-"
                                            : fundamentals.pe.toFixed(
                                                2
                                            ),
                                },
                                {
                                    label: "P/B",
                                    value:
                                        fundamentals.pb === null
                                            ? "-"
                                            : fundamentals.pb.toFixed(
                                                2
                                            ),
                                },
                                {
                                    label: "BOOK VALUE",
                                    value: formatRupees(
                                        fundamentals.bookValue
                                    ),
                                },
                                {
                                    label: "DEBT",
                                    value: formatCrores(
                                        fundamentals.debt
                                    ),
                                },
                                {
                                    label: "MARKET CAP",
                                    value: formatCrores(
                                        fundamentals.marketCap
                                    ),
                                },
                                {
                                    label: "PROMOTER HOLDING",
                                    value: formatNumber(
                                        fundamentals.promoterHolding,
                                        "%"
                                    ),
                                },
                                {
                                    label: "ANNUAL REVENUE",
                                    value: formatCrores(
                                        latestYear
                                            ?.metricsInCrores
                                            ?.revenue
                                    ),
                                },
                                {
                                    label: "ANNUAL NET PROFIT",
                                    value: formatCrores(
                                        latestYear
                                            ?.metricsInCrores
                                            ?.netProfit
                                    ),
                                },
                                {
                                    label: "ANNUAL OPERATING PROFIT",
                                    value: formatCrores(
                                        latestYear
                                            ?.metricsInCrores
                                            ?.operatingProfit
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

                        <div className="rounded-2xl border border-white/[0.06] bg-[#0b1422] p-6">
                            <h3 className="text-sm font-bold text-white">
                                Yearly Results
                            </h3>

                            <div className="mt-5 overflow-x-auto">
                                <table className="w-full min-w-[720px] text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-white/[0.06] text-[10px] uppercase tracking-wider text-slate-500">
                                            <th className="pb-3">
                                                Year
                                            </th>
                                            <th className="pb-3 text-right">
                                                Revenue
                                            </th>
                                            <th className="pb-3 text-right">
                                                PAT
                                            </th>
                                            <th className="pb-3 text-right">
                                                Operating profit
                                            </th>
                                            <th className="pb-3 text-right">
                                                EPS
                                            </th>
                                            <th className="pb-3 text-right">
                                                P/E
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {selectedYearly.map(
                                            (item, index) => (
                                                <tr
                                                    key={`${item.year}-${index}`}
                                                    className="border-b border-white/[0.04] last:border-0"
                                                >
                                                    <td className="py-4 font-semibold text-slate-200">
                                                        FY
                                                        {
                                                            item.year
                                                        }
                                                    </td>

                                                    <td className="py-4 text-right font-semibold text-slate-300">
                                                        {formatCrores(
                                                            item
                                                                .metricsInCrores
                                                                ?.revenue
                                                        )}
                                                    </td>

                                                    <td className="py-4 text-right font-semibold text-slate-300">
                                                        {formatCrores(
                                                            item
                                                                .metricsInCrores
                                                                ?.netProfit
                                                        )}
                                                    </td>

                                                    <td className="py-4 text-right font-semibold text-slate-300">
                                                        {formatCrores(
                                                            item
                                                                .metricsInCrores
                                                                ?.operatingProfit
                                                        )}
                                                    </td>

                                                    <td className="py-4 text-right font-semibold text-slate-300">
                                                        {formatRupees(
                                                            item
                                                                .metricsInCrores
                                                                ?.eps ??
                                                            item.eps
                                                        )}
                                                    </td>

                                                    <td className="py-4 text-right font-semibold text-slate-300">
                                                        {item.pe ===
                                                            null ||
                                                        item.pe ===
                                                            undefined
                                                            ? "-"
                                                            : item.pe.toFixed(
                                                                2
                                                            )}
                                                    </td>
                                                </tr>
                                            )
                                        )}

                                        {selectedYearly.length ===
                                            0 && (
                                                <tr>
                                                    <td
                                                        colSpan={6}
                                                        className="py-10 text-center text-xs text-slate-500"
                                                    >
                                                        No yearly
                                                        results for
                                                        this basis.
                                                    </td>
                                                </tr>
                                            )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "AI Insights" && (
                    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                            <div className="rounded-2xl border border-white/[0.06] bg-[#0b1422] p-6 shadow-md">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-[#00d084]" />

                                        <div>
                                            <h3 className="text-sm font-bold tracking-wide text-white">
                                                Latest AI Analysis
                                            </h3>

                                            <p className="mt-1 text-[11px] text-slate-500">
                                                {latestAnalysis
                                                    ? periodLabel(
                                                        latestAnalysis.year,
                                                        latestAnalysis.quarter
                                                    )
                                                    : latestPeriod}
                                            </p>
                                        </div>
                                    </div>

                                    {latestAnalysis && (
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span
                                                className={`rounded-full border px-2.5 py-1 text-[10px] font-bold capitalize ${sentimentClass(
                                                    latestAnalysis.sentiment
                                                )}`}
                                            >
                                                {latestAnalysis.sentiment ??
                                                    "neutral"}
                                            </span>

                                            <span
                                                className={`rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${statusClass(
                                                    latestAnalysis.status
                                                )}`}
                                            >
                                                {latestAnalysis.status ??
                                                    "completed"}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {latestAnalysis ? (
                                    <div className="mt-6 space-y-5">
                                        {latestAnalysis.insight && (
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                                    Summary
                                                </p>

                                                <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-100">
                                                    {
                                                        latestAnalysis.insight
                                                    }
                                                </p>
                                            </div>
                                        )}

                                        {latestAnalysis.analysis && (
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                                    Analysis
                                                </p>

                                                <p className="mt-2 whitespace-pre-line text-xs leading-6 text-slate-300">
                                                    {
                                                        latestAnalysis.analysis
                                                    }
                                                </p>
                                            </div>
                                        )}

                                        {!latestAnalysis.insight &&
                                            !latestAnalysis.analysis &&
                                            latestAnalysis.status !==
                                                "completed" && (
                                                <p className="text-xs leading-relaxed text-slate-400">
                                                    The analysis
                                                    worker has not
                                                    produced content
                                                    yet. Current
                                                    status:{" "}
                                                    {latestAnalysis.status ??
                                                        "queued"}
                                                    .
                                                </p>
                                            )}

                                        {latestAnalysis.error && (
                                            <p className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-[11px] leading-relaxed text-red-300">
                                                {
                                                    latestAnalysis.error
                                                }
                                            </p>
                                        )}

                                        <div className="grid grid-cols-2 gap-4 border-t border-white/[0.06] pt-5 text-[11px] sm:grid-cols-4">
                                            <div>
                                                <p className="text-slate-500">
                                                    Model
                                                </p>

                                                <p className="mt-1 font-semibold text-slate-300">
                                                    {latestAnalysis.aiModel ??
                                                        "-"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-slate-500">
                                                    Prompt
                                                </p>

                                                <p className="mt-1 font-semibold text-slate-300">
                                                    {latestAnalysis.promptVersion ??
                                                        "-"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-slate-500">
                                                    Basis
                                                </p>

                                                <p className="mt-1 font-semibold text-slate-300">
                                                    {basisLabel(
                                                        latestAnalysis.consolidated
                                                    )}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-slate-500">
                                                    Updated
                                                </p>

                                                <p className="mt-1 font-semibold text-slate-300">
                                                    {formatDateTime(
                                                        latestAnalysis.updatedAt
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-6 space-y-3 text-xs leading-relaxed text-slate-400">
                                        <p>
                                            No AI analysis is
                                            available for this
                                            quarter yet.
                                        </p>

                                        {!analysisSupported && (
                                            <p className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-[11px] text-amber-200/80">
                                                The deployed API
                                                does not expose the
                                                analysis-history
                                                endpoint yet. Any AI
                                                fields attached to the
                                                result are still shown
                                                here when present.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="rounded-2xl border border-white/[0.06] bg-[#0b1422] p-6">
                                <h3 className="text-sm font-bold text-white">
                                    Analysis History
                                </h3>

                                <div className="mt-5 space-y-3">
                                    {analysisHistory.map(
                                        (analysis, index) => (
                                            <div
                                                key={`${analysis.year}-${analysis.quarter}-${index}`}
                                                className="rounded-xl border border-white/[0.06] bg-[#08101d] px-4 py-3"
                                            >
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[11px] font-bold text-slate-200">
                                                            {periodLabel(
                                                                analysis.year,
                                                                analysis.quarter
                                                            )}
                                                        </span>

                                                        <span className="text-[10px] font-medium text-slate-500">
                                                            {basisLabel(
                                                                analysis.consolidated
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`rounded-full border px-2 py-0.5 text-[9px] font-bold capitalize ${sentimentClass(
                                                                analysis.sentiment
                                                            )}`}
                                                        >
                                                            {analysis.sentiment ??
                                                                "neutral"}
                                                        </span>

                                                        <span
                                                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold capitalize ${statusClass(
                                                                analysis.status
                                                            )}`}
                                                        >
                                                            {analysis.status ??
                                                                "completed"}
                                                        </span>
                                                    </div>
                                                </div>

                                                {(analysis.insight ||
                                                    analysis.analysis) && (
                                                    <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-slate-400">
                                                        {analysis.insight ??
                                                            analysis.analysis}
                                                    </p>
                                                )}
                                            </div>
                                        )
                                    )}

                                    {analysisHistory.length ===
                                        0 && (
                                        <p className="rounded-xl border border-dashed border-white/[0.08] px-4 py-8 text-center text-xs text-slate-500">
                                            No analysis history
                                            available.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-2xl border border-white/[0.06] bg-[#0b1422] p-6 shadow-md">
                                <h3 className="text-sm font-bold tracking-wide text-white">
                                    Analysis Coverage
                                </h3>

                                <div className="mt-5 space-y-4 text-xs">
                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-500">
                                            Analyzed quarters
                                        </span>

                                        <span className="font-semibold text-slate-200">
                                            {analysisHistory.length}
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-500">
                                            Latest status
                                        </span>

                                        <span className="font-semibold capitalize text-slate-200">
                                            {latestAnalysis?.status ??
                                                "-"}
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-500">
                                            Model
                                        </span>

                                        <span className="max-w-[55%] truncate text-right font-semibold text-slate-200">
                                            {latestAnalysis?.aiModel ??
                                                "-"}
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-500">
                                            API support
                                        </span>

                                        <span className="font-semibold text-slate-200">
                                            {analysisSupported
                                                ? "Analysis history"
                                                : "Result fields only"}
                                        </span>
                                    </div>
                                </div>

                                <p className="mt-5 text-[10px] leading-relaxed text-slate-500">
                                    Analyses are generated by the
                                    scraper&apos;s background worker
                                    and stored per company, quarter
                                    and reporting basis.
                                </p>
                            </div>

                            <DataQualityNotice
                                record={summaryRecord}
                            />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
