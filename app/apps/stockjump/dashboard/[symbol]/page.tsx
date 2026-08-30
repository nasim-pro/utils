"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { appConfig } from "../../config";

export default function StockPage() {
    const params = useParams();
    const router = useRouter();

    const symbol = String(params.symbol).toUpperCase();

    const [data, setData] = useState<unknown>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadStock() {
            const token = localStorage.getItem("stockjump_token");

            if (!token) {
                router.replace(appConfig.links.login);
                return;
            }

            try {
                const response = await fetch(
                    `${appConfig.api.baseUrl}/api/stocks/${symbol}/quarterly`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message || "Unable to load stock data"
                    );
                }

                setData(result);
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Unable to load stock data"
                );
            } finally {
                setLoading(false);
            }
        }

        loadStock();
    }, [symbol, router]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-12">
                Loading {symbol}...
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">

            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500">
                        Stock
                    </p>

                    <h1 className="mt-1 text-4xl font-bold">
                        {symbol}
                    </h1>
                </div>
            </div>

            <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-8">

                <h2 className="text-xl font-semibold">
                    Quarterly Results
                </h2>

                <pre className="mt-6 overflow-auto rounded-2xl bg-gray-950 p-6 text-sm text-white">
                    {JSON.stringify(data, null, 2)}
                </pre>

            </div>

        </div>
    );
}