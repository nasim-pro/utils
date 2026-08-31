import StockDetailClient from "./StockDetailClient";


export async function generateStaticParams() {
    return [
        { symbol: "reliance" },
        { symbol: "hdfcbank" },
        { symbol: "infy" },
        { symbol: "tcs" },
        { symbol: "wipro" },
        { symbol: "bajfinance" },
        { symbol: "maruti" },
        { symbol: "icicibank" },
        { symbol: "bhartiartl" },
        { symbol: "lt" },
        { symbol: "tatamotors" },
    ];
}

interface PageProps {
    params: Promise<{ symbol: string }>;
}

export default async function Page({ params }: PageProps) {
    const resolvedParams = await params;
    return <StockDetailClient symbol={resolvedParams.symbol} />;
}