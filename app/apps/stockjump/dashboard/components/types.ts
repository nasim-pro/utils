/**
 * View models used by the dashboard table components.
 *
 * Monetary fields are already normalized to Crores by `lib/api.ts`; the table
 * never receives raw backend units.
 */

export type StockSentiment =
    | "Beat"
    | "Miss"
    | "In-Line";

export type ReportBasis =
    | "consolidated"
    | "standalone";

export interface Stock {
    id: string;

    symbol: string;
    stockName?: string | null;
    companyName?: string | null;

    year?: number;
    quarter?: string;
    broadcastDate?: string | null;

    consolidated?: boolean;
    reportType?: string;
    isFinancial?: boolean | null;

    /** Normalized to Crores. */
    revenue?: number | null;
    netProfit?: number | null;
    operatingProfit?: number | null;
    profitBeforeTax?: number | null;
    eps?: number | null;

    /** Used by the strong-movers view. */
    currentValue?: number | null;
    previousValue?: number | null;
    growth?: number | null;
    metricLabel?: string;
    comparisonNote?: string | null;

    currentPrice?: number | null;
    marketCap?: number | null;
    pe?: number | null;
    pb?: number | null;
    promoterHolding?: number | null;

    /** True when the deployed API did not return normalized units. */
    legacyUnits?: boolean;

    sector?: string;
    sentiment?: StockSentiment;
    trendType?: "bullish" | "bearish" | "neutral";
}
