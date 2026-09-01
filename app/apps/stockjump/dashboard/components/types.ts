
export type StockSentiment = "Beat" | "Miss" | "In-Line";

export interface Stock {
    _id?: string;
    symbol: string;
    stockName?: string;
    companyName?: string;

    year: number;
    quarter: string;

    broadcastDate?: string;

    revenue?: number;
    netProfit?: number;
    operatingProfit?: number;
    profitBeforeTax?: number;

    currentPrice?: number;
    marketCap?: number;
    bookValue?: number;
    debt?: number;
    promoterHolding?: number;
    patGrowth?: number;
    pat?: string;
    eps?: string;
    sector?: string;
    sentiment?: StockSentiment;

    trendType?: "bullish" | "bearish" | "neutral";
}

