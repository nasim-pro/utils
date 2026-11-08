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
