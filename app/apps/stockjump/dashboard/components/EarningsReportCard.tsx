"use client";

import { useState } from "react";
import {
    AlertTriangle,
    CheckCircle2,
    ClipboardCheck,
    Copy,
    ExternalLink,
    FileText,
    Info,
    ShieldAlert,
    TrendingDown,
    TrendingUp,
} from "lucide-react";
import {
    buildResultBrief,
    metricValue,
    type EarningsAnalysis,
    type QualityFlag,
} from "../lib/analysis";
import {
    formatBps,
    formatCrores,
    formatGrowth,
    formatMargin,
    formatRupees,
    growthClass,
    periodLabel,
} from "../lib/format";

interface EarningsReportCardProps {
    analysis: EarningsAnalysis;
    symbol: string;
    companyName: string;
    basisLabel: string;
}

const VERDICT_STYLES: Record<
    EarningsAnalysis["verdict"],
    {
        ring: string;
        text: string;
        chip: string;
        stroke: string;
    }
> = {
    Strong: {
        ring: "border-[#00d084]/30 bg-[#00d084]/10",
        text: "text-[#00d084]",
        chip: "bg-[#00d084]/10 text-[#00d084]",
        stroke: "#00d084",
    },
    Improving: {
        ring: "border-teal-400/30 bg-teal-400/10",
        text: "text-teal-300",
        chip: "bg-teal-400/10 text-teal-300",
        stroke: "#2dd4bf",
    },
    Mixed: {
        ring: "border-amber-400/30 bg-amber-400/10",
        text: "text-amber-300",
        chip: "bg-amber-400/10 text-amber-300",
        stroke: "#fbbf24",
    },
    Weak: {
        ring: "border-red-400/30 bg-red-400/10",
        text: "text-red-300",
        chip: "bg-red-400/10 text-red-300",
        stroke: "#f87171",
    },
    "Limited history": {
        ring: "border-white/[0.08] bg-white/[0.03]",
        text: "text-slate-300",
        chip: "bg-white/[0.05] text-slate-300",
        stroke: "#64748b",
    },
    "Data check needed": {
        ring: "border-amber-400/30 bg-amber-400/10",
        text: "text-amber-300",
        chip: "bg-amber-400/10 text-amber-300",
        stroke: "#fbbf24",
    },
};

const FLAG_STYLES: Record<
    QualityFlag["level"],
    { icon: typeof CheckCircle2; className: string }
> = {
    good: {
        icon: CheckCircle2,
        className: "border-[#00d084]/20 bg-[#00d084]/5 text-[#00d084]",
    },
    warn: {
        icon: AlertTriangle,
        className: "border-amber-400/20 bg-amber-400/5 text-amber-300",
    },
    bad: {
        icon: ShieldAlert,
        className: "border-red-400/20 bg-red-400/5 text-red-300",
    },
    info: {
        icon: Info,
        className: "border-white/[0.08] bg-white/[0.02] text-slate-300",
    },
};

function ScoreRing({
    score,
    verdict,
}: {
    score: number | null;
    verdict: EarningsAnalysis["verdict"];
}) {
    const style = VERDICT_STYLES[verdict];
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const ratio = score === null ? 0 : Math.max(0, Math.min(1, score / 100));

    return (
        <div
            className={`relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border ${style.ring}`}
            title={
                score === null
                    ? "Not enough comparable data to score"
                    : `${score} out of 100 against this company's own history`
            }
        >
            <svg
                viewBox="0 0 80 80"
                className="absolute inset-0 h-full w-full -rotate-90"
                aria-hidden="true"
            >
                <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="5"
                />
                <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    fill="none"
                    stroke={style.stroke}
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={`${circumference * ratio} ${
                        circumference
                    }`}
                />
            </svg>

            <div className="relative text-center">
                <p className={`text-xl font-extrabold leading-none ${style.text}`}>
                    {score ?? "–"}
                </p>
                <p className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-slate-500">
                    /100
                </p>
            </div>
        </div>
    );
}

function MetricTile({
    label,
    value,
    qoq,
    yoy,
    prefix,
    marginBps,
}: {
    label: string;
    value: string;
    qoq?: number | null;
    yoy?: number | null;
    prefix?: string;
    marginBps?: number | null;
}) {
    return (
        <div className="rounded-2xl border border-white/[0.06] bg-[#08101d] p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {label}
            </p>

            <p className="mt-2 text-lg font-extrabold tracking-tight text-white">
                {value}
            </p>

            <div className="mt-1 space-y-0.5 text-[10px] font-semibold">
                {qoq !== null && qoq !== undefined && (
                    <p className={growthClass(qoq)}>
                        {formatGrowth(qoq)} QoQ
                    </p>
                )}

                {yoy !== null && yoy !== undefined && (
                    <p className={growthClass(yoy)}>
                        {formatGrowth(yoy)} YoY
                    </p>
                )}

                {marginBps !== null && marginBps !== undefined && (
                    <p className={growthClass(marginBps)}>
                        {formatBps(marginBps)} margin YoY
                    </p>
                )}

                {prefix && (
                    <p className="text-slate-500">{prefix}</p>
                )}
            </div>
        </div>
    );
}

export default function EarningsReportCard({
    analysis,
    symbol,
    companyName,
    basisLabel,
}: EarningsReportCardProps) {
    const [copied, setCopied] = useState(false);
    const { latest, growth, margins, ttm, ranks, streaks, ownTrend } =
        analysis;
    const style = VERDICT_STYLES[analysis.verdict];

    async function copyBrief() {
        const brief = buildResultBrief({
            analysis,
            symbol,
            companyName,
        });

        try {
            await navigator.clipboard.writeText(brief);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard permission can be blocked; fall back to selection.
            window.prompt("Copy the result brief", brief);
        }
    }

    const rankText = (
        rank: { rank: number; total: number } | null,
        noun: string
    ) => {
        if (!rank) {
            return "-";
        }

        if (rank.rank === 1) {
            return `#1 of ${rank.total} ${noun}`;
        }

        return `#${rank.rank} of ${rank.total} ${noun}`;
    };

    return (
        <section className="overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#0b1422] shadow-md">
            <div className="flex flex-col gap-5 border-b border-white/[0.06] p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#00d084]">
                            Earnings report card
                        </p>

                        <span className="rounded-full border border-white/[0.06] bg-[#111b2b] px-2 py-0.5 text-[9px] font-bold text-slate-400">
                            {basisLabel}
                        </span>

                        {analysis.release && (
                            <span
                                className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${
                                    analysis.release.isAfterHours
                                        ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
                                        : "border-white/[0.08] bg-[#111b2b] text-slate-400"
                                }`}
                                title={
                                    analysis.release.isAfterHours
                                        ? "Released outside market hours — the market reacts on the next trading day."
                                        : "Released during market hours."
                                }
                            >
                                {analysis.release.shortLabel}
                            </span>
                        )}
                    </div>

                    <h2 className="mt-2 text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                        {periodLabel(
                            latest?.year,
                            latest?.quarter
                        )}{" "}
                        result
                        {analysis.verdict === "Limited history"
                            ? ""
                            : ", read against its own history"}
                    </h2>

                    <p className="mt-1.5 max-w-2xl text-[11px] leading-relaxed text-slate-500">
                        {analysis.verdict === "Limited history"
                            ? "No analyst estimates are used. Not enough year-on-year history is available to score this quarter, so only the comparisons the data supports are shown."
                            : "No analyst estimates are used. Every signal below compares this quarter with the company's previous quarter, the same quarter last year, and its trailing twelve months."}
                    </p>

                    {latest?.broadcastDate && (
                        <p className="mt-2 text-[10px] font-medium text-slate-500">
                            Released{" "}
                            {analysis.release?.dateLabel ?? "-"}
                            {analysis.release
                                ? ` at ${analysis.release.timeLabel}`
                                : ""}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-4 self-start">
                    <ScoreRing
                        score={analysis.score}
                        verdict={analysis.verdict}
                    />

                    <div>
                        <span
                            className={`rounded-full px-3 py-1 text-[11px] font-bold ${style.chip}`}
                        >
                            {analysis.verdict}
                        </span>

                        <p className="mt-2 max-w-[230px] text-[10px] leading-relaxed text-slate-400">
                            {analysis.verdictNote}
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
                {analysis.unitCheck.suspicious && (
                    <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4">
                        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-red-300">
                            <ShieldAlert className="h-3.5 w-3.5" />
                            Unit mismatch suspected
                        </p>

                        <ul className="mt-2 space-y-1 text-[11px] leading-relaxed text-red-100/70">
                            {analysis.unitCheck.reasons.map(
                                (reason) => (
                                    <li key={reason}>• {reason}</li>
                                )
                            )}
                        </ul>

                        <p className="mt-2 text-[10px] leading-relaxed text-red-100/50">
                            Values are shown as reported. Growth,
                            ranks and TTM are withheld because
                            comparing different units would produce
                            false conclusions.
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <MetricTile
                        label="Revenue"
                        value={formatCrores(
                            metricValue(latest, "revenue")
                        )}
                        qoq={growth.revenue.qoq}
                        yoy={growth.revenue.yoy}
                    />

                    <MetricTile
                        label="Net profit"
                        value={formatCrores(
                            metricValue(latest, "netProfit")
                        )}
                        qoq={growth.netProfit.qoq}
                        yoy={growth.netProfit.yoy}
                    />

                    <MetricTile
                        label="EPS"
                        value={formatRupees(
                            metricValue(latest, "eps")
                        )}
                        qoq={growth.eps.qoq}
                        yoy={growth.eps.yoy}
                    />

                    <MetricTile
                        label="Operating margin"
                        value={formatMargin(
                            margins.latest.operating
                        )}
                        marginBps={margins.operatingYoY}
                        prefix={
                            margins.latest.net !== null
                                ? `Net margin ${formatMargin(
                                      margins.latest.net
                                  )}`
                                : undefined
                        }
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-white/[0.06] bg-[#08101d] p-4 sm:p-5">
                        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#00d084]">
                            <TrendingUp className="h-3.5 w-3.5" />
                            What changed
                        </p>

                        {analysis.drivers.length > 0 ? (
                            <ul className="mt-3 space-y-2.5">
                                {analysis.drivers.map((line) => (
                                    <li
                                        key={line}
                                        className="flex gap-2 text-[11px] leading-relaxed text-slate-300"
                                    >
                                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#00d084]/70" />
                                        <span>{line}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
                                {analysis.comparisonsWithheld
                                    ? "Period changes are hidden because the reported values appear to use different units."
                                    : "Not enough comparable periods to describe a change."}
                            </p>
                        )}
                    </div>

                    <div className="rounded-2xl border border-white/[0.06] bg-[#08101d] p-4 sm:p-5">
                        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                            <TrendingDown className="h-3.5 w-3.5" />
                            What to watch
                        </p>

                        {analysis.watchouts.length > 0 ? (
                            <ul className="mt-3 space-y-2.5">
                                {analysis.watchouts.map((line) => (
                                    <li
                                        key={line}
                                        className="flex gap-2 text-[11px] leading-relaxed text-slate-300"
                                    >
                                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400/70" />
                                        <span>{line}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
                                {analysis.comparisonsWithheld
                                    ? "Comparisons are withheld until the unit mismatch is resolved. Check the original filing for the reported unit."
                                    : "No specific red flag in the reported numbers. Check the filing notes for one-offs."}
                            </p>
                        )}
                    </div>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-[#08101d] p-4 sm:p-5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Versus its own record
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                        <div>
                            <p className="text-[10px] text-slate-500">
                                PAT rank
                            </p>
                            <p className="mt-1 text-xs font-bold text-slate-200">
                                {rankText(
                                    ranks.netProfit,
                                    "quarters"
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-[10px] text-slate-500">
                                Revenue rank
                            </p>
                            <p className="mt-1 text-xs font-bold text-slate-200">
                                {rankText(
                                    ranks.revenue,
                                    "quarters"
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-[10px] text-slate-500">
                                Margin rank
                            </p>
                            <p className="mt-1 text-xs font-bold text-slate-200">
                                {rankText(
                                    ranks.operatingMargin,
                                    "quarters"
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-[10px] text-slate-500">
                                Profit vs 4Q avg
                            </p>
                            <p
                                className={`mt-1 text-xs font-bold ${
                                    ownTrend.netProfitVs4q ===
                                    null
                                        ? "text-slate-400"
                                        : growthClass(
                                              ownTrend.netProfitVs4q
                                          )
                                }`}
                            >
                                {ownTrend.netProfitVs4q === null
                                    ? "-"
                                    : formatGrowth(
                                          ownTrend.netProfitVs4q
                                      )}
                            </p>
                        </div>

                        <div>
                            <p className="text-[10px] text-slate-500">
                                Positive YoY run
                            </p>
                            <p className="mt-1 text-xs font-bold text-slate-200">
                                {streaks.revenue > 0
                                    ? `${streaks.revenue} qtr${
                                          streaks.revenue > 1
                                              ? "s"
                                              : ""
                                      } revenue`
                                    : "-"}
                                {streaks.netProfit > 0
                                    ? ` · ${streaks.netProfit} qtr${
                                          streaks.netProfit > 1
                                              ? "s"
                                              : ""
                                      } PAT`
                                    : ""}
                            </p>
                        </div>

                        <div>
                            <p className="text-[10px] text-slate-500">
                                TTM net profit
                            </p>
                            <p className="mt-1 text-xs font-bold text-slate-200">
                                {formatCrores(ttm.netProfit)}
                            </p>
                        </div>
                    </div>

                    {ttm.label && (
                        <p className="mt-3 text-[10px] text-slate-500">
                            {ttm.label} · TTM revenue{" "}
                            {formatCrores(ttm.revenue)}
                            {ttm.growth.netProfit !== null
                                ? ` · profit ${formatGrowth(
                                      ttm.growth.netProfit
                                  )} vs prior TTM`
                                : ""}
                        </p>
                    )}
                </div>

                {analysis.flags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {analysis.flags.map((flag) => {
                            const FlagIcon =
                                FLAG_STYLES[flag.level].icon;

                            return (
                                <span
                                    key={`${flag.title}-${flag.detail}`}
                                    title={flag.detail}
                                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold ${
                                        FLAG_STYLES[flag.level]
                                            .className
                                    }`}
                                >
                                    <FlagIcon className="h-3 w-3" />
                                    {flag.title}
                                </span>
                            );
                        })}
                    </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
                    <div className="flex flex-wrap items-center gap-3 text-[10px] font-medium text-slate-500">
                        {latest?.sourceUrl && (
                            <a
                                href={latest.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#111b2b] px-2.5 py-1.5 text-slate-300 transition hover:text-white"
                            >
                                <FileText className="h-3 w-3" />
                                Original NSE filing
                                <ExternalLink className="h-3 w-3 opacity-60" />
                            </a>
                        )}

                        {latest?.parserVersion && (
                            <span className="inline-flex items-center gap-1.5">
                                <Info className="h-3 w-3" />
                                Parser {latest.parserVersion}
                            </span>
                        )}

                        {latest?.updatedAt && (
                            <span>
                                Updated{" "}
                                {new Date(
                                    latest.updatedAt
                                ).toLocaleDateString("en-GB")}
                            </span>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={copyBrief}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#00d084]/20 bg-[#00d084]/10 px-3 py-2 text-[11px] font-bold text-[#00d084] transition hover:bg-[#00d084]/20"
                    >
                        {copied ? (
                            <ClipboardCheck className="h-3.5 w-3.5" />
                        ) : (
                            <Copy className="h-3.5 w-3.5" />
                        )}
                        {copied
                            ? "Copied"
                            : "Copy result brief"}
                    </button>
                </div>
            </div>
        </section>
    );
}
