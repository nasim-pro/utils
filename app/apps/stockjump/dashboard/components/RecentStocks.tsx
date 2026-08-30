import StockCard from "./StockCard";

const recentStocks = [
    {
        symbol: "TCS",
        companyName: "Tata Consultancy Services",
        description: "Quarterly results and financial research.",
        href: "/apps/stockjump/dashboard/tcs",
        tag: "NSE",
    },
];

export default function RecentStocks() {
    return (
        <section>
            <div className="mb-5 flex items-end justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">
                        Your research
                    </p>

                    <h2 className="mt-1 text-xl font-bold tracking-tight text-gray-900">
                        Recent stocks
                    </h2>
                </div>
            </div>

            {recentStocks.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {recentStocks.map((stock) => (
                        <StockCard
                            key={stock.symbol}
                            {...stock}
                        />
                    ))}
                </div>
            ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
                    <p className="font-medium text-gray-900">
                        No stocks researched yet
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                        Search for a company above to get started.
                    </p>
                </div>
            )}
        </section>
    );
}