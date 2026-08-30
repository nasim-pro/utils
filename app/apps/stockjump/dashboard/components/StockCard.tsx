import Link from "next/link";

interface StockCardProps {
    symbol: string;
    companyName: string;
    description?: string;
    href: string;
    tag?: string;
}

export default function StockCard({
    symbol,
    companyName,
    description,
    href,
    tag = "Stock",
}: StockCardProps) {
    return (
        <Link
            href={href}
            className="group block rounded-2xl border border-gray-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-lg"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-sm font-bold text-white">
                        {symbol.slice(0, 2)}
                    </div>

                    <div className="min-w-0">
                        <h3 className="truncate font-semibold text-gray-900">
                            {companyName}
                        </h3>

                        <p className="mt-0.5 text-sm font-medium text-gray-500">
                            {symbol}
                        </p>
                    </div>
                </div>

                <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                    {tag}
                </span>
            </div>

            {description && (
                <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-500">
                    {description}
                </p>
            )}

            <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-xs text-gray-400">
                    View research
                </span>

                <span className="text-sm font-medium text-gray-900 transition-transform group-hover:translate-x-1">
                    →
                </span>
            </div>
        </Link>
    );
}