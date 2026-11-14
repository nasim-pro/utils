/**
 * Deterministic earnings analysis for the result page.
 *
 * The API does not expose analyst estimates, so nothing here claims a
 * "beat" or "miss". Instead every signal is measured against the company's
 * own reported history: previous quarter, same quarter last year, trailing
 * twelve months, and the last few years.
 *
 * All monetary inputs are expected to be normalized to Crores by
 * `lib/api.ts` (`metricsInCrores`). `eps` stays in rupees per share.
 */

import type { ResultRecord } from "./api";
import {
    calculateGrowth,
    formatBps,
    formatCrores,
    formatMargin,
    formatRupees,
    marginPercent,
    percentagePointDelta,
    periodLabel,
    ratioOf,
    releaseSessionInfo,
    round,
    sortNewestFirst,
    toNumber,
    type ReleaseSessionInfo,
} from "./format";

export type MetricField =
    | "revenue"
    | "operatingProfit"
    | "profitBeforeTax"
    | "netProfit"
    | "eps";

export interface MetricTrend {
    qoq: number | null;
    yoy: number | null;
}

export interface MarginSnapshot {
    operating: number | null;
    net: number | null;
    /** Effective tax rate, only when PBT is positive. */
    taxRate: number | null;
    /** PBT above operating profit, as a percentage of operating profit. */
    otherIncomeGap: number | null;
}

export interface RankInfo {
    /** 1 = highest in the compared window. */
    rank: number;
    total: number;
    value: number;
}

export type QualityLevel = "good" | "warn" | "bad" | "info";

export interface QualityFlag {
    level: QualityLevel;
    title: string;
    detail: string;
}

export type Verdict =
    | "Strong"
    | "Improving"
    | "Mixed"
    | "Weak"
    | "Limited history"
    | "Data check needed";

export interface TtmMetrics {
    revenue: number | null;
    netProfit: number | null;
    eps: number | null;
    quarters: number;
    label: string | null;
    growth: {
        revenue: number | null;
        netProfit: number | null;
    };
}

export interface CagrMetrics {
    revenue3: number | null;
    revenue5: number | null;
    netProfit3: number | null;
    netProfit5: number | null;
}

export interface EarningsAnalysis {
    latest: ResultRecord | null;
    previousQuarter: ResultRecord | null;
    yearAgoQuarter: ResultRecord | null;
    previousYear: ResultRecord | null;

    growth: Record<MetricField, MetricTrend>;

    margins: {
        latest: MarginSnapshot;
        previousQuarter: MarginSnapshot;
        yearAgo: MarginSnapshot;
        operatingQoQ: number | null;
        operatingYoY: number | null;
        netQoQ: number | null;
        netYoY: number | null;
    };

    ttm: TtmMetrics;
    cagr: CagrMetrics;

    ranks: {
        quarters: number;
        revenue: RankInfo | null;
        netProfit: RankInfo | null;
        operatingMargin: RankInfo | null;
    };

    streaks: {
        revenue: number;
        netProfit: number;
    };

    ownTrend: {
        revenueVs4q: number | null;
        netProfitVs4q: number | null;
    };

    score: number | null;
    verdict: Verdict;
    verdictNote: string;

    drivers: string[];
    watchouts: string[];
    flags: QualityFlag[];

    unitCheck: {
        suspicious: boolean;
        reasons: string[];
    };

    release: ReleaseSessionInfo | null;

    /** True when growth/rank/TTM comparisons were withheld due to units. */
    comparisonsWithheld: boolean;
}

export function metricValue(
    record: ResultRecord | null | undefined,
    field: MetricField
): number | null {
    if (!record) {
        return null;
    }

    if (field === "eps") {
        return toNumber(
            record.metricsInCrores?.eps ?? record.eps
        );
    }

    return toNumber(
        record.metricsInCrores?.[field] ??
            record[field]
    );
}

export function findPreviousQuarter(
    series: ResultRecord[],
    record: ResultRecord | null
): ResultRecord | null {
    if (!record?.quarter || !record.year) {
        return null;
    }

    const target: Record<string, [number, string]> = {
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

export function findSameQuarterLastYear(
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

export function findPreviousYear(
    series: ResultRecord[],
    record: ResultRecord | null
): ResultRecord | null {
    if (!record?.year) {
        return null;
    }

    return (
        series.find(
            (item) => item.year === record.year! - 1
        ) ?? null
    );
}

function findYear(
    series: ResultRecord[],
    year: number
): ResultRecord | null {
    return series.find((item) => item.year === year) ?? null;
}

/**
 * A Lakhs/Crores mix shows up as an extreme jump in revenue between two
 * otherwise comparable periods. Growth and ranks are withheld when this
 * happens instead of printing a meaningless percentage.
 */
function comparableUnits(
    current: ResultRecord | null,
    previous: ResultRecord | null
): boolean {
    const ratio = ratioOf(
        metricValue(current, "revenue"),
        metricValue(previous, "revenue")
    );

    if (ratio === null) {
        return true;
    }

    return ratio <= 10 && ratio >= 0.1;
}

function trendFor(
    field: MetricField,
    latest: ResultRecord | null,
    previousQuarter: ResultRecord | null,
    yearAgo: ResultRecord | null
): MetricTrend {
    const qoq =
        latest &&
        previousQuarter &&
        comparableUnits(latest, previousQuarter)
            ? calculateGrowth(
                  metricValue(latest, field),
                  metricValue(previousQuarter, field)
              )
            : null;

    const yoy =
        latest &&
        yearAgo &&
        comparableUnits(latest, yearAgo)
            ? calculateGrowth(
                  metricValue(latest, field),
                  metricValue(yearAgo, field)
              )
            : null;

    return { qoq, yoy };
}

function marginsOf(
    record: ResultRecord | null
): MarginSnapshot {
    const revenue = metricValue(record, "revenue");
    const operatingProfit = metricValue(
        record,
        "operatingProfit"
    );
    const profitBeforeTax = metricValue(
        record,
        "profitBeforeTax"
    );
    const netProfit = metricValue(record, "netProfit");

    const taxRate =
        profitBeforeTax !== null &&
        netProfit !== null &&
        profitBeforeTax > 0
            ? marginPercent(
                  profitBeforeTax - netProfit,
                  profitBeforeTax
              )
            : null;

    const otherIncomeGap =
        profitBeforeTax !== null && operatingProfit !== null
            ? marginPercent(
                  profitBeforeTax - operatingProfit,
                  operatingProfit
              )
            : null;

    return {
        operating: marginPercent(
            operatingProfit,
            revenue
        ),
        net: marginPercent(netProfit, revenue),
        taxRate,
        otherIncomeGap,
    };
}

function sumQuarters(
    series: ResultRecord[],
    field: MetricField
): number | null {
    const quarters = series.slice(0, 4);

    if (quarters.length < 4) {
        return null;
    }

    const periods = new Set(
        quarters.map(
            (record) => `${record.year}-${record.quarter}`
        )
    );

    if (periods.size < 4) {
        return null;
    }

    const values = quarters.map((record) =>
        metricValue(record, field)
    );

    if (values.some((value) => value === null)) {
        return null;
    }

    return round(
        (values as number[]).reduce(
            (total, value) => total + value,
            0
        ),
        2
    );
}

function ttmLabel(series: ResultRecord[]): string | null {
    const quarters = series.slice(0, 4);

    if (quarters.length < 4) {
        return null;
    }

    const oldest = quarters[quarters.length - 1];
    const newest = quarters[0];

    return `TTM ${periodLabel(
        oldest.year,
        oldest.quarter
    )} → ${periodLabel(newest.year, newest.quarter)}`;
}

function cagr(
    latestValue: number | null,
    olderValue: number | null,
    years: number
): number | null {
    if (
        latestValue === null ||
        olderValue === null ||
        latestValue <= 0 ||
        olderValue <= 0 ||
        years <= 0
    ) {
        return null;
    }

    return round(
        (Math.pow(latestValue / olderValue, 1 / years) - 1) *
            100,
        1
    );
}

function rankOf(
    values: Array<number | null>,
    value: number | null
): RankInfo | null {
    if (value === null) {
        return null;
    }

    const present = values.filter(
        (item): item is number => item !== null
    );

    if (present.length < 3) {
        return null;
    }

    const rank =
        present.filter((item) => item > value + 1e-9).length +
        1;

    return { rank, total: present.length, value };
}

function positiveYoYStreak(
    series: ResultRecord[],
    field: MetricField
): number {
    let streak = 0;

    for (const record of series.slice(0, 8)) {
        const prior = findSameQuarterLastYear(series, record);

        if (!prior || !comparableUnits(record, prior)) {
            break;
        }

        const growth = calculateGrowth(
            metricValue(record, field),
            metricValue(prior, field)
        );

        if (growth === null || growth <= 0) {
            break;
        }

        streak += 1;
    }

    return streak;
}

function versusAverage(
    series: ResultRecord[],
    field: MetricField
): number | null {
    const latest = series[0] ?? null;
    const prior = series
        .slice(1, 5)
        .map((record) => metricValue(record, field))
        .filter(
            (value): value is number => value !== null
        );

    if (
        !latest ||
        prior.length < 2 ||
        !comparableUnits(latest, series[1] ?? null)
    ) {
        return null;
    }

    const average =
        prior.reduce((total, value) => total + value, 0) /
        prior.length;

    return calculateGrowth(
        metricValue(latest, field),
        average
    );
}

function detectUnitIssues(args: {
    latest: ResultRecord | null;
    series: ResultRecord[];
    yearly: ResultRecord[];
    quarterly: ResultRecord[];
    marketCap: number | null;
}): { suspicious: boolean; reasons: string[] } {
    const { latest, series, yearly, quarterly, marketCap } =
        args;
    const reasons: string[] = [];

    if (!latest) {
        return { suspicious: false, reasons };
    }

    const latestRevenue = metricValue(latest, "revenue");
    const latestYear = latest.year ?? null;

    function checkPair(
        label: string,
        other: ResultRecord | null
    ) {
        const ratio = ratioOf(
            latestRevenue,
            metricValue(other, "revenue")
        );

        if (ratio !== null && (ratio > 10 || ratio < 0.1)) {
            const factor =
                ratio >= 1
                    ? Math.round(ratio)
                    : Math.round(1 / ratio);

            reasons.push(
                `${label} revenue differs by about ${factor}×, which usually means Lakhs were compared with Crores.`
            );
        }
    }

    checkPair(
        "The previous quarter's",
        findPreviousQuarter(series, latest)
    );
    checkPair(
        "The year-ago quarter's",
        findSameQuarterLastYear(series, latest)
    );

    const annual =
        (latestYear !== null
            ? findYear(yearly, latestYear)
            : null) ??
        (latestYear !== null
            ? findYear(yearly, latestYear - 1)
            : null);

    const annualRevenue = metricValue(annual, "revenue");

    if (
        latestRevenue !== null &&
        annualRevenue !== null &&
        annualRevenue > 0 &&
        latestRevenue > annualRevenue * 2
    ) {
        reasons.push(
            "The quarter's revenue is more than twice the full-year revenue, so the two records use different units."
        );
    }

    for (
        let index = 0;
        index < Math.min(yearly.length - 1, 4);
        index += 1
    ) {
        const currentYear = yearly[index];
        const olderYear = yearly[index + 1];
        const ratio = ratioOf(
            metricValue(currentYear, "revenue"),
            metricValue(olderYear, "revenue")
        );

        if (ratio !== null && (ratio > 10 || ratio < 0.1)) {
            const factor =
                ratio >= 1
                    ? Math.round(ratio)
                    : Math.round(1 / ratio);

            reasons.push(
                `Annual revenue jumps about ${factor}× between FY${olderYear.year} and FY${currentYear.year}, which points to a unit change.`
            );
            break;
        }
    }

    if (
        marketCap !== null &&
        marketCap > 0 &&
        latestRevenue !== null &&
        latestRevenue > marketCap * 5
    ) {
        reasons.push(
            "Revenue is more than 5× the market cap, which usually means the filing is in Lakhs while the app expects Crores."
        );
    }

    const samePeriod = quarterly.filter(
        (record) =>
            record.year === latest.year &&
            record.quarter === latest.quarter
    );

    const consolidated = samePeriod.find(
        (record) => record.consolidated
    );
    const standalone = samePeriod.find(
        (record) => !record.consolidated
    );

    if (consolidated && standalone) {
        const ratio = ratioOf(
            metricValue(consolidated, "revenue"),
            metricValue(standalone, "revenue")
        );

        if (ratio !== null && (ratio > 10 || ratio < 0.1)) {
            reasons.push(
                "Consolidated and standalone revenue for the same quarter differ by ~100×, so one of them is in a different unit."
            );
        }
    }

    return {
        suspicious: reasons.length > 0,
        reasons: [...new Set(reasons)].slice(0, 3),
    };
}

function buildScore(args: {
    growth: Record<MetricField, MetricTrend>;
    operatingMarginYoY: number | null;
    ttmNetProfit: number | null;
    latestNetProfit: number | null;
    revenue: number | null;
    unitSuspicious: boolean;
}): { score: number | null; verdict: Verdict } {
    const {
        growth,
        operatingMarginYoY,
        ttmNetProfit,
        latestNetProfit,
        revenue,
        unitSuspicious,
    } = args;

    let score = 0;
    let maximum = 0;

    function add(weight: number, points: number | null) {
        if (points === null) {
            return;
        }

        maximum += weight;
        score += points;
    }

    const revenueYoY = growth.revenue.yoy;
    const patYoY = growth.netProfit.yoy;

    add(
        30,
        revenueYoY === null
            ? null
            : revenueYoY >= 15
              ? 30
              : revenueYoY >= 8
                ? 24
                : revenueYoY >= 0
                  ? 16
                  : revenueYoY >= -5
                    ? 8
                    : 0
    );

    add(
        35,
        patYoY === null
            ? null
            : patYoY >= 25
              ? 35
              : patYoY >= 15
                ? 28
                : patYoY >= 5
                  ? 20
                  : patYoY >= 0
                    ? 12
                    : patYoY >= -10
                      ? 5
                      : 0
    );

    add(
        20,
        operatingMarginYoY === null
            ? null
            : operatingMarginYoY >= 200
              ? 20
              : operatingMarginYoY >= 50
                ? 15
                : operatingMarginYoY >= 0
                  ? 10
                  : operatingMarginYoY >= -50
                    ? 5
                    : 0
    );

    add(
        10,
        revenueYoY === null || patYoY === null
            ? null
            : patYoY - revenueYoY >= 5
              ? 10
              : patYoY - revenueYoY >= 0
                ? 7
                : patYoY - revenueYoY >= -5
                  ? 3
                  : 0
    );

    add(
        5,
        ttmNetProfit !== null
            ? ttmNetProfit > 0
                ? 5
                : 0
            : latestNetProfit !== null
              ? latestNetProfit > 0
                  ? 3
                  : 0
              : null
    );

    if (maximum === 0) {
        return { score: null, verdict: "Mixed" };
    }

    let value = Math.round((score / maximum) * 100);

    if (latestNetProfit !== null && latestNetProfit < 0) {
        value = Math.min(value, 35);
    }

    if (revenue !== null && revenue <= 0) {
        value = Math.min(value, 30);
    }

    if (unitSuspicious) {
        value = Math.min(value, 20);
        return { score: value, verdict: "Data check needed" };
    }

    if (value >= 75) {
        return { score: value, verdict: "Strong" };
    }

    if (value >= 60) {
        return { score: value, verdict: "Improving" };
    }

    if (value >= 40) {
        return { score: value, verdict: "Mixed" };
    }

    return { score: value, verdict: "Weak" };
}

function verdictNote(verdict: Verdict): string {
    switch (verdict) {
        case "Strong":
            return "Growth, profitability and margins all moved in the right direction versus last year.";
        case "Improving":
            return "The quarter improved versus last year, but one signal is still soft.";
        case "Mixed":
            return "Some metrics improved while others weakened. Read the drivers below before drawing a conclusion.";
        case "Weak":
            return "Revenue, profit or margins deteriorated versus last year.";
        case "Limited history":
            return "Not enough year-on-year history to score this quarter against its own trend. The reported numbers are shown as-is.";
        default:
            return "Conflicting units across reporting periods. Numbers are shown as reported, but growth and ranks are withheld.";
    }
}

function absPercent(value: number): string {
    return `${Math.abs(value).toLocaleString("en-IN", {
        maximumFractionDigits: 1,
    })}%`;
}

export interface AnalyzeEarningsInput {
    quarterly: ResultRecord[];
    yearly: ResultRecord[];
    marketCap?: number | null;
}

export function analyzeEarnings(
    input: AnalyzeEarningsInput
): EarningsAnalysis {
    const quarterly = sortNewestFirst(input.quarterly);
    const yearly = sortNewestFirst(input.yearly);

    const latest = quarterly[0] ?? null;

    // `preferred` data can mix consolidated and standalone across periods when
    // one basis is missing for some quarters. Comparing those periods would
    // show a fake jump (e.g. consolidated revenue vs a standalone base), so
    // all trend math stays on the latest quarter's basis.
    const series = latest
        ? quarterly.filter(
              (record) =>
                  (record.consolidated === true) ===
                  (latest.consolidated === true)
          )
        : quarterly;

    const latestYear = yearly[0] ?? null;
    const yearSeries = latestYear
        ? yearly.filter(
              (record) =>
                  (record.consolidated === true) ===
                  (latestYear.consolidated === true)
          )
        : yearly;

    const previousQuarter = findPreviousQuarter(series, latest);
    const yearAgoQuarter = findSameQuarterLastYear(
        series,
        latest
    );
    const previousYear = findPreviousYear(
        yearSeries,
        latestYear
    );

    const growth: Record<MetricField, MetricTrend> = {
        revenue: trendFor(
            "revenue",
            latest,
            previousQuarter,
            yearAgoQuarter
        ),
        operatingProfit: trendFor(
            "operatingProfit",
            latest,
            previousQuarter,
            yearAgoQuarter
        ),
        profitBeforeTax: trendFor(
            "profitBeforeTax",
            latest,
            previousQuarter,
            yearAgoQuarter
        ),
        netProfit: trendFor(
            "netProfit",
            latest,
            previousQuarter,
            yearAgoQuarter
        ),
        eps: trendFor(
            "eps",
            latest,
            previousQuarter,
            yearAgoQuarter
        ),
    };

    const latestMargins = marginsOf(latest);
    const previousQuarterMargins = marginsOf(previousQuarter);
    const yearAgoMargins = marginsOf(yearAgoQuarter);

    const margins = {
        latest: latestMargins,
        previousQuarter: previousQuarterMargins,
        yearAgo: yearAgoMargins,
        operatingQoQ: percentagePointDelta(
            latestMargins.operating,
            previousQuarterMargins.operating
        ),
        operatingYoY: percentagePointDelta(
            latestMargins.operating,
            yearAgoMargins.operating
        ),
        netQoQ: percentagePointDelta(
            latestMargins.net,
            previousQuarterMargins.net
        ),
        netYoY: percentagePointDelta(
            latestMargins.net,
            yearAgoMargins.net
        ),
    };

    const ttmRevenue = sumQuarters(series, "revenue");
    const ttmNetProfit = sumQuarters(
        series,
        "netProfit"
    );
    const ttmEps = sumQuarters(series, "eps");

    const priorRevenue = sumQuarters(
        series.slice(4),
        "revenue"
    );
    const priorNetProfit = sumQuarters(
        series.slice(4),
        "netProfit"
    );

    const ttm: TtmMetrics = {
        revenue: ttmRevenue,
        netProfit: ttmNetProfit,
        eps: ttmEps,
        quarters: Math.min(series.length, 4),
        label: ttmLabel(series),
        growth: {
            revenue: calculateGrowth(
                ttmRevenue,
                priorRevenue
            ),
            netProfit: calculateGrowth(
                ttmNetProfit,
                priorNetProfit
            ),
        },
    };

    const latestYearRevenue = metricValue(
        latestYear,
        "revenue"
    );
    const latestYearPat = metricValue(
        latestYear,
        "netProfit"
    );

    const cagrMetrics: CagrMetrics = {
        revenue3:
            latestYear?.year !== undefined
                ? cagr(
                      latestYearRevenue,
                      metricValue(
                          findYear(
                              yearSeries,
                              latestYear.year - 3
                          ),
                          "revenue"
                      ),
                      3
                  )
                : null,
        revenue5:
            latestYear?.year !== undefined
                ? cagr(
                      latestYearRevenue,
                      metricValue(
                          findYear(
                              yearSeries,
                              latestYear.year - 5
                          ),
                          "revenue"
                      ),
                      5
                  )
                : null,
        netProfit3:
            latestYear?.year !== undefined
                ? cagr(
                      latestYearPat,
                      metricValue(
                          findYear(
                              yearSeries,
                              latestYear.year - 3
                          ),
                          "netProfit"
                      ),
                      3
                  )
                : null,
        netProfit5:
            latestYear?.year !== undefined
                ? cagr(
                      latestYearPat,
                      metricValue(
                          findYear(
                              yearSeries,
                              latestYear.year - 5
                          ),
                          "netProfit"
                      ),
                      5
                  )
                : null,
    };

    const window = series.slice(0, 8);

    const ranks = {
        quarters: window.length,
        revenue: rankOf(
            window.map((record) =>
                metricValue(record, "revenue")
            ),
            metricValue(latest, "revenue")
        ),
        netProfit: rankOf(
            window.map((record) =>
                metricValue(record, "netProfit")
            ),
            metricValue(latest, "netProfit")
        ),
        operatingMargin: rankOf(
            window.map((record) =>
                marginPercent(
                    metricValue(
                        record,
                        "operatingProfit"
                    ),
                    metricValue(record, "revenue")
                )
            ),
            latestMargins.operating
        ),
    };

    const streaks = {
        revenue: positiveYoYStreak(series, "revenue"),
        netProfit: positiveYoYStreak(
            series,
            "netProfit"
        ),
    };

    const ownTrend = {
        revenueVs4q: versusAverage(
            series,
            "revenue"
        ),
        netProfitVs4q: versusAverage(
            series,
            "netProfit"
        ),
    };

    const unitCheck = detectUnitIssues({
        latest,
        series,
        yearly: yearSeries,
        quarterly,
        marketCap: input.marketCap ?? null,
    });

    const scored = buildScore({
        growth,
        operatingMarginYoY: margins.operatingYoY,
        ttmNetProfit,
        latestNetProfit: metricValue(latest, "netProfit"),
        revenue: metricValue(latest, "revenue"),
        unitSuspicious: unitCheck.suspicious,
    });

    // A single quarter with no year-on-year history can still produce a score
    // from the profitability check alone. That would read as a trend verdict
    // without a trend, so require at least two comparison signals.
    const comparisonSignals = [
        growth.revenue.yoy,
        growth.netProfit.yoy,
        margins.operatingYoY,
    ].filter((value) => value !== null).length;

    const limitedHistory =
        !unitCheck.suspicious && comparisonSignals < 2;

    const score = limitedHistory ? null : scored.score;
    const verdict: Verdict = limitedHistory
        ? "Limited history"
        : scored.verdict;

    const comparisonsWithheld = unitCheck.suspicious;

    const drivers: string[] = [];
    const watchouts: string[] = [];
    const flags: QualityFlag[] = [];

    const revenue = metricValue(latest, "revenue");
    const netProfit = metricValue(latest, "netProfit");
    const eps = metricValue(latest, "eps");
    const revenueYoY = growth.revenue.yoy;
    const patYoY = growth.netProfit.yoy;

    if (!comparisonsWithheld) {
        if (revenueYoY !== null) {
            drivers.push(
                `Revenue ${
                    revenueYoY >= 0 ? "grew" : "fell"
                } ${absPercent(revenueYoY)} YoY to ${formatCrores(
                    revenue
                )}.`
            );
        }

        if (patYoY !== null) {
            drivers.push(
                `Net profit ${
                    patYoY >= 0 ? "grew" : "fell"
                } ${absPercent(patYoY)} YoY to ${formatCrores(
                    netProfit
                )}.`
            );
        }

        if (margins.operatingYoY !== null) {
            const expanded = margins.operatingYoY >= 0;

            if (expanded) {
                drivers.push(
                    `Operating margin expanded ${Math.abs(
                        margins.operatingYoY
                    ).toLocaleString("en-IN")} bps YoY to ${formatMargin(
                        latestMargins.operating
                    )}.`
                );
            } else {
                watchouts.push(
                    `Operating margin contracted ${Math.abs(
                        margins.operatingYoY
                    ).toLocaleString("en-IN")} bps YoY to ${formatMargin(
                        latestMargins.operating
                    )}.`
                );
            }
        }

        if (
            patYoY !== null &&
            revenueYoY !== null
        ) {
            const spread = round(patYoY - revenueYoY, 1);

            if (spread >= 3) {
                drivers.push(
                    "Profit grew faster than revenue — operating leverage or cost efficiency improved."
                );
            } else if (spread <= -3) {
                watchouts.push(
                    "Revenue grew faster than profit — costs or margins are under pressure."
                );
            }
        }

        if (growth.eps.yoy !== null) {
            drivers.push(
                `EPS is ${formatRupees(
                    eps
                )}, ${growth.eps.yoy >= 0 ? "up" : "down"} ${absPercent(
                    growth.eps.yoy
                )} YoY.`
            );
        }

        if (
            margins.latest.taxRate !== null &&
            margins.yearAgo.taxRate !== null &&
            margins.latest.taxRate <
                margins.yearAgo.taxRate - 5 &&
            patYoY !== null &&
            growth.profitBeforeTax.yoy !== null &&
            patYoY > growth.profitBeforeTax.yoy + 3
        ) {
            watchouts.push(
                `Effective tax rate fell to ${formatMargin(
                    margins.latest.taxRate
                )} from ${formatMargin(
                    margins.yearAgo.taxRate
                )}. Part of the profit growth may be tax-driven.`
            );
        }

        if (
            latestMargins.otherIncomeGap !== null &&
            latestMargins.otherIncomeGap > 15
        ) {
            watchouts.push(
                `Profit before tax is ${formatMargin(
                    latestMargins.otherIncomeGap
                )} above operating profit — other income or interest is a meaningful part of the result.`
            );
        }

        if (
            ownTrend.netProfitVs4q !== null &&
            Math.abs(ownTrend.netProfitVs4q) >= 15
        ) {
            const direction =
                ownTrend.netProfitVs4q > 0
                    ? "above"
                    : "below";

            drivers.push(
                `PAT is ${absPercent(
                    ownTrend.netProfitVs4q
                )} ${direction} its average of the previous four quarters.`
            );
        }

        const yearAgoRevenue = metricValue(
            yearAgoQuarter,
            "revenue"
        );
        const yearAgoPat = metricValue(
            yearAgoQuarter,
            "netProfit"
        );

        if (
            (yearAgoRevenue !== null &&
                yearAgoRevenue < 5) ||
            (yearAgoPat !== null &&
                Math.abs(yearAgoPat) < 1)
        ) {
            watchouts.push(
                "The year-ago base was near zero, so percentage growth overstates the improvement."
            );
        }

        if (
            netProfit !== null &&
            netProfit < 0
        ) {
            flags.push({
                level: "bad",
                title: "Loss-making quarter",
                detail:
                    "The company reported a net loss in this period.",
            });
        } else if (patYoY !== null && patYoY >= 25) {
            flags.push({
                level: "good",
                title: "Profit acceleration",
                detail: `Net profit grew ${absPercent(
                    patYoY
                )} year on year.`,
            });
        }

        if (
            revenueYoY !== null &&
            revenueYoY < 0
        ) {
            flags.push({
                level: "warn",
                title: "Revenue declined",
                detail: `Revenue fell ${absPercent(
                    revenueYoY
                )} year on year.`,
            });
        }

        if (
            margins.operatingYoY !== null &&
            margins.operatingYoY >= 100
        ) {
            flags.push({
                level: "good",
                title: "Margin expansion",
                detail: `Operating margin improved ${Math.abs(
                    margins.operatingYoY
                ).toLocaleString("en-IN")} bps year on year.`,
            });
        }

        if (
            ttmNetProfit !== null &&
            ttmNetProfit < 0
        ) {
            flags.push({
                level: "bad",
                title: "Negative trailing profit",
                detail:
                    "The trailing twelve months are loss-making.",
            });
        }

        if (patYoY !== null && patYoY >= 100) {
            flags.push({
                level: "info",
                title: "Very high growth",
                detail:
                    "Check the filing notes for one-offs or a low base before annualising this growth.",
            });
        }
    }

    const warnings = latest?.dataQuality?.warnings ?? [];

    if (warnings.length > 0) {
        flags.push({
            level: "info",
            title: "Parser notes",
            detail: warnings.slice(0, 2).join(" "),
        });
    }

    if (latest?.dataQuality?.operatingProfitNotApplicable) {
        flags.push({
            level: "info",
            title: "Operating profit not reported",
            detail:
                "This filing format does not report operating profit, so margin analysis is skipped.",
        });
    }

    if (unitCheck.suspicious) {
        flags.unshift({
            level: "bad",
            title: "Unit mismatch suspected",
            detail:
                "Some periods appear to be reported in Lakhs and others in Crores. Values are shown as reported, but growth, ranks and TTM are withheld.",
        });
    }

    if (limitedHistory) {
        watchouts.unshift(
            "Not enough comparable history was available to score this result against its own trend."
        );
    } else if (
        !unitCheck.suspicious &&
        drivers.length === 0 &&
        watchouts.length === 0
    ) {
        watchouts.push(
            "The reported numbers do not show an obvious red flag. Check the original filing for one-offs and notes."
        );
    }

    const emptyTrend: MetricTrend = {
        qoq: null,
        yoy: null,
    };

    const safeGrowth: Record<MetricField, MetricTrend> =
        comparisonsWithheld
            ? {
                  revenue: emptyTrend,
                  operatingProfit: emptyTrend,
                  profitBeforeTax: emptyTrend,
                  netProfit: emptyTrend,
                  eps: emptyTrend,
              }
            : growth;

    const safeMargins = comparisonsWithheld
        ? {
              ...margins,
              operatingQoQ: null,
              operatingYoY: null,
              netQoQ: null,
              netYoY: null,
          }
        : margins;

    const safeTtm: TtmMetrics = comparisonsWithheld
        ? {
              revenue: null,
              netProfit: null,
              eps: null,
              quarters: 0,
              label: null,
              growth: { revenue: null, netProfit: null },
          }
        : ttm;

    const safeCagr: CagrMetrics = comparisonsWithheld
        ? {
              revenue3: null,
              revenue5: null,
              netProfit3: null,
              netProfit5: null,
          }
        : cagrMetrics;

    const safeRanks = comparisonsWithheld
        ? {
              quarters: 0,
              revenue: null,
              netProfit: null,
              operatingMargin: null,
          }
        : ranks;

    return {
        latest,
        previousQuarter,
        yearAgoQuarter,
        previousYear,
        growth: safeGrowth,
        margins: safeMargins,
        ttm: safeTtm,
        cagr: safeCagr,
        ranks: safeRanks,
        streaks: comparisonsWithheld
            ? { revenue: 0, netProfit: 0 }
            : streaks,
        ownTrend: comparisonsWithheld
            ? {
                  revenueVs4q: null,
                  netProfitVs4q: null,
              }
            : ownTrend,
        score,
        verdict,
        verdictNote: verdictNote(verdict),
        drivers: drivers.slice(0, 4),
        watchouts: watchouts.slice(0, 4),
        flags: flags.slice(0, 6),
        unitCheck,
        release: releaseSessionInfo(
            latest?.broadcastDate ??
                latestYear?.broadcastDate ??
                null
        ),
        comparisonsWithheld,
    };
}

export interface ResultBriefInput {
    analysis: EarningsAnalysis;
    symbol: string;
    companyName: string;
}

/** Plain-text brief that can be pasted into notes or a chat. */
export function buildResultBrief({
    analysis,
    symbol,
    companyName,
}: ResultBriefInput): string {
    const {
        latest,
        growth,
        margins,
        ttm,
        verdict,
        score,
        drivers,
        watchouts,
        release,
        unitCheck,
    } = analysis;

    const lines: string[] = [];

    lines.push(`${companyName} (${symbol})`);
    lines.push(
        `${periodLabel(
            latest?.year,
            latest?.quarter
        )} result${
            release ? ` · released ${release.dateLabel}, ${release.timeLabel}` : ""
        }`
    );
    lines.push(
        `${verdict}${
            score !== null ? ` · ${score}/100` : ""
        } vs its own trend`
    );
    lines.push("");

    if (latest) {
        lines.push(
            `Revenue: ${formatCrores(
                metricValue(latest, "revenue")
            )}${
                growth.revenue.yoy !== null
                    ? ` (${absPercent(
                          growth.revenue.yoy
                      )} YoY)`
                    : ""
            }`
        );
        lines.push(
            `Net profit: ${formatCrores(
                metricValue(latest, "netProfit")
            )}${
                growth.netProfit.yoy !== null
                    ? ` (${absPercent(
                          growth.netProfit.yoy
                      )} YoY)`
                    : ""
            }`
        );
        lines.push(
            `EPS: ${formatRupees(
                metricValue(latest, "eps")
            )}`
        );

        if (margins.latest.operating !== null) {
            lines.push(
                `Operating margin: ${formatMargin(
                    margins.latest.operating
                )}${
                    margins.operatingYoY !== null
                        ? ` (${formatBps(
                              margins.operatingYoY
                          )} YoY)`
                        : ""
                }`
            );
        }

        if (ttm.revenue !== null) {
            lines.push(
                `TTM revenue: ${formatCrores(ttm.revenue)}`
            );
        }

        if (ttm.netProfit !== null) {
            lines.push(
                `TTM net profit: ${formatCrores(ttm.netProfit)}`
            );
        }
    }

    if (drivers.length > 0) {
        lines.push("");
        lines.push("What changed:");
        drivers.forEach((line) => lines.push(`- ${line}`));
    }

    if (watchouts.length > 0) {
        lines.push("");
        lines.push("What to watch:");
        watchouts.forEach((line) => lines.push(`- ${line}`));
    }

    if (unitCheck.suspicious) {
        lines.push("");
        lines.push(
            "Note: unit mismatch suspected; treat period comparisons with caution."
        );
    }

    if (latest?.sourceUrl) {
        lines.push("");
        lines.push(`Filing: ${latest.sourceUrl}`);
    }

    lines.push("");
    lines.push("Generated by StockJump · not investment advice");

    return lines.join("\n");
}
