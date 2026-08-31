// export type StockSentiment = "Beat" | "In-Line" | "Miss";

// export interface Stock {
//     symbol: string;
//     companyName: string;
//     sector: string;
//     revenue: string;
//     pat: string;
//     eps: string;
//     patGrowth: number;
//     sentiment: StockSentiment;
// }

export type StockSentiment = "Beat" | "In-Line" | "Miss";

export interface Stock {
    symbol: string;
    companyName: string;
    sector: string;
    revenue: string;
    pat: string;
    eps: string;
    patGrowth: number;
    sentiment: StockSentiment;
    rank?: number;
    score?: number;
    trendType?: "bullish" | "neutral" | "bearish";
}