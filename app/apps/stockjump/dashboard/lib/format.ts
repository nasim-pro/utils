/**
 * Shared formatting helpers for the StockJump dashboard.
 *
 * All monetary result values are expected to be in Crores. The API normalizes
 * them into `metricsInCrores`; the browser only falls back to raw values for
 * older API builds.
 */

export function toNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}

export function round(value: number, digits = 2): number {
    return Number(value.toFixed(digits));
}

export function formatCrores(value?: number | null): string {
    const number = toNumber(value);

    if (number === null) {
        return "-";
    }

    const digits =
        number !== 0 && Math.abs(number) < 0.01 ? 4 : 2;

    return `${currencyPrefix(number)}${Math.abs(
        number
    ).toLocaleString("en-IN", {
        maximumFractionDigits: digits,
    })} Cr`;
}

export function formatRupees(value?: number | null): string {
    const number = toNumber(value);

    if (number === null) {
        return "-";
    }

    return `${currencyPrefix(number)}${Math.abs(
        number
    ).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}`;
}

function currencyPrefix(value: number): string {
    return value < 0 ? "-₹" : "₹";
}

export function formatPercent(
    value?: number | null,
    digits = 1
): string {
    const number = toNumber(value);

    if (number === null) {
        return "-";
    }

    return `${number.toLocaleString("en-IN", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    })}%`;
}

/** Margin-style percentage without forcing trailing decimals. */
export function formatMargin(value?: number | null): string {
    const number = toNumber(value);

    if (number === null) {
        return "-";
    }

    return `${number.toLocaleString("en-IN", {
        maximumFractionDigits: 1,
    })}%`;
}

export function formatBps(value?: number | null): string {
    const number = toNumber(value);

    if (number === null) {
        return "-";
    }

    const sign = number > 0 ? "+" : number < 0 ? "-" : "";

    return `${sign}${Math.abs(number).toLocaleString("en-IN", {
        maximumFractionDigits: 0,
    })} bps`;
}

/**
 * Margin as a percentage of the base. Returns null when the base is zero or
 * missing so the UI can show "-" instead of Infinity.
 */
export function marginPercent(
    part?: number | null,
    whole?: number | null
): number | null {
    const numerator = toNumber(part);
    const denominator = toNumber(whole);

    if (
        numerator === null ||
        denominator === null ||
        denominator === 0
    ) {
        return null;
    }

    return round((numerator / Math.abs(denominator)) * 100);
}

/** Difference between two percentages, expressed in basis points. */
export function percentagePointDelta(
    current?: number | null,
    previous?: number | null
): number | null {
    const currentNumber = toNumber(current);
    const previousNumber = toNumber(previous);

    if (currentNumber === null || previousNumber === null) {
        return null;
    }

    return round((currentNumber - previousNumber) * 100, 0);
}

/** Raw ratio used to spot unit mismatches (e.g. Lakhs vs Crores = 100x). */
export function ratioOf(
    current?: number | null,
    previous?: number | null
): number | null {
    const currentNumber = toNumber(current);
    const previousNumber = toNumber(previous);

    if (
        currentNumber === null ||
        previousNumber === null ||
        previousNumber === 0
    ) {
        return null;
    }

    return Math.abs(currentNumber / previousNumber);
}

export type MarketSession =
    | "pre-market"
    | "market-hours"
    | "after-hours";

export interface ReleaseSessionInfo {
    session: MarketSession;
    shortLabel: string;
    timeLabel: string;
    dateLabel: string;
    isAfterHours: boolean;
    isWeekend: boolean;
    /** Minutes after midnight in IST. */
    minutesOfDay: number;
}

/**
 * Earnings releases are usually judged by when they hit the wire in IST:
 * after 3:30 PM means the market reacts the next trading day. Holidays are
 * not modelled, so weekends are the only non-trading days we can detect.
 */
export function releaseSessionInfo(
    dateString?: string | null
): ReleaseSessionInfo | null {
    if (!dateString) {
        return null;
    }

    const timestamp = new Date(dateString).getTime();

    if (Number.isNaN(timestamp)) {
        return null;
    }

    // India has no DST; shift to IST and format in UTC.
    const ist = new Date(timestamp + 5.5 * 60 * 60 * 1000);
    const hours = ist.getUTCHours();
    const minutes = ist.getUTCMinutes();
    const minutesOfDay = hours * 60 + minutes;
    const day = ist.getUTCDay();
    const isWeekend = day === 0 || day === 6;

    let session: MarketSession;

    if (minutesOfDay < 9 * 60 + 15) {
        session = "pre-market";
    } else if (minutesOfDay <= 15 * 60 + 30) {
        session = "market-hours";
    } else {
        session = "after-hours";
    }

    const shortLabel =
        session === "pre-market"
            ? "Pre-open"
            : session === "market-hours"
                ? "Market hours"
                : "After hours";

    const timeLabel =
        new Intl.DateTimeFormat("en-IN", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
            timeZone: "UTC",
        }).format(ist) + " IST";

    const dateLabel = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    }).format(ist);

    return {
        session,
        shortLabel,
        timeLabel,
        dateLabel,
        isAfterHours: session === "after-hours" || isWeekend,
        isWeekend,
        minutesOfDay,
    };
}

export function formatNumber(
    value?: number | null,
    suffix = ""
): string {
    const number = toNumber(value);

    if (number === null) {
        return "-";
    }

    return `${number.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}${suffix}`;
}

export function formatDate(dateString?: string | null): string {
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

export function formatDateTime(dateString?: string | null): string {
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
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

export function calculateGrowth(
    current?: number | null,
    previous?: number | null
): number | null {
    const currentNumber = toNumber(current);
    const previousNumber = toNumber(previous);

    if (
        currentNumber === null ||
        previousNumber === null ||
        previousNumber === 0
    ) {
        return null;
    }

    const growth =
        ((currentNumber - previousNumber) /
            Math.abs(previousNumber)) *
        100;

    return Number.isFinite(growth) ? round(growth) : null;
}

export function formatGrowth(value?: number | null): string {
    const number = toNumber(value);

    if (number === null) {
        return "-";
    }

    if (number === 0) {
        return "→ 0.0%";
    }

    const arrow = number > 0 ? "↑ +" : "↓ -";
    const absolute = Math.abs(number);

    // Growth can explode when the previous value is close to zero (the API
    // can return values in the millions of percent). Keep tables readable
    // instead of printing an unbounded number.
    if (absolute >= 10_000) {
        return `${arrow}9,999.9%+`;
    }

    return `${arrow}${absolute.toLocaleString("en-IN", {
        maximumFractionDigits: 1,
    })}%`;
}

export function growthClass(value?: number | null): string {
    const number = toNumber(value);

    if (number === null) {
        return "text-slate-500";
    }

    if (number > 0) {
        return "text-[#00d084]";
    }

    if (number < 0) {
        return "text-red-400";
    }

    return "text-slate-400";
}

export const QUARTER_ORDER: Record<string, number> = {
    Q1: 1,
    Q2: 2,
    Q3: 3,
    Q4: 4,
};

export function quarterRank(
    quarter?: string | null
): number {
    return QUARTER_ORDER[quarter ?? ""] ?? 0;
}

export function periodRank(
    year?: number | null,
    quarter?: string | null
): number {
    return (year ?? 0) * 10 + quarterRank(quarter);
}

export function sortNewestFirst<
    T extends {
        year?: number | null;
        quarter?: string | null;
        broadcastDate?: string | null;
    }
>(records: T[]): T[] {
    return [...records].sort((a, b) => {
        const period =
            periodRank(b.year, b.quarter) -
            periodRank(a.year, a.quarter);

        if (period !== 0) {
            return period;
        }

        const dateA = a.broadcastDate
            ? new Date(a.broadcastDate).getTime()
            : 0;
        const dateB = b.broadcastDate
            ? new Date(b.broadcastDate).getTime()
            : 0;

        return dateB - dateA;
    });
}

export function periodLabel(
    year?: number | null,
    quarter?: string | null
): string {
    if (!quarter && !year) {
        return "-";
    }

    const parts: string[] = [];

    if (quarter) {
        parts.push(quarter);
    }

    if (year) {
        parts.push(`FY${year}`);
    }

    return parts.join(" ");
}

export const METRIC_LABELS: Record<string, string> = {
    revenue: "Revenue",
    operatingProfit: "Operating profit",
    profitBeforeTax: "Profit before tax",
    netProfit: "Net profit",
    eps: "EPS",
};

export function metricLabel(metric?: string | null): string {
    if (!metric) {
        return "Metric";
    }

    return METRIC_LABELS[metric] ?? metric;
}
