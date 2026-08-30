"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { appConfig } from "../config";

export default function DashboardPage() {
    const router = useRouter();

    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("stockjump_token");

        if (!storedToken) {
            router.replace(appConfig.links.login);
            return;
        }

        setToken(storedToken);
    }, [router]);

    function logout() {
        localStorage.removeItem("stockjump_token");
        router.replace(appConfig.links.login);
    }

    if (!token) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
                <p className="text-gray-500">
                    Loading...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50">

            <div className="border-b bg-white">
                <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Dashboard
                        </h1>

                        <p className="text-sm text-gray-500 mt-1">
                            Research Indian companies and stocks.
                        </p>
                    </div>

                    <button
                        onClick={logout}
                        className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
                    >
                        Log out
                    </button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-10">

                <div className="rounded-3xl border border-gray-200 bg-white p-8">
                    <h2 className="text-xl font-semibold">
                        Search a company
                    </h2>

                    <p className="mt-2 text-gray-600">
                        Search for a stock to view its available financial
                        data.
                    </p>

                    <div className="mt-6 flex gap-3">
                        <input
                            type="text"
                            placeholder="Enter symbol e.g. TCS"
                            className="flex-1 rounded-xl border border-gray-300 px-4 py-3"
                        />

                        <button
                            className="rounded-xl bg-black px-6 py-3 text-white font-medium"
                        >
                            Search
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mt-8">

                    <Link
                        href="/apps/stockjump/dashboard/tcs"
                        className="rounded-3xl border border-gray-200 bg-white p-6 hover:shadow-md transition"
                    >
                        <p className="text-sm text-gray-500">
                            Example
                        </p>

                        <h3 className="mt-2 text-2xl font-bold">
                            TCS
                        </h3>

                        <p className="mt-3 text-gray-600">
                            View quarterly results
                        </p>
                    </Link>

                    <div className="rounded-3xl border border-gray-200 bg-white p-6">
                        <p className="text-sm text-gray-500">
                            Coming soon
                        </p>

                        <h3 className="mt-2 text-2xl font-bold">
                            More Stocks
                        </h3>

                        <p className="mt-3 text-gray-600">
                            Search and explore more companies.
                        </p>
                    </div>

                    <div className="rounded-3xl border border-gray-200 bg-white p-6">
                        <p className="text-sm text-gray-500">
                            Data
                        </p>

                        <h3 className="mt-2 text-2xl font-bold">
                            Financials
                        </h3>

                        <p className="mt-3 text-gray-600">
                            More financial datasets coming soon.
                        </p>
                    </div>

                </div>

            </main>
        </div>
    );
}