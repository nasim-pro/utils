"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { appConfig } from "../config";

import StockSearch from "./components/StockSearch";
import RecentStocks from "./components/RecentStocks";

export default function DashboardPage() {
    const router = useRouter();
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const storedToken = localStorage.getItem("stockjump_token");

        if (!storedToken) {
            router.replace(appConfig.links.login);
            return;
        }

        setAuthenticated(true);
    }, [router]);

    function logout() {
        localStorage.removeItem("stockjump_token");
        router.replace(appConfig.links.login);
    }

    if (!authenticated) {
        return (
            <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50">
                <p className="text-sm text-gray-500">
                    Loading...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-xs font-bold text-white">
                            SJ
                        </div>

                        <div>
                            <p className="text-sm font-bold text-gray-900">
                                StockJump
                            </p>

                            <p className="hidden text-xs text-gray-500 sm:block">
                                Indian Stock Research
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                    >
                        Log out
                    </button>
                </div>
            </header>

            {/* Main */}
            <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-10">
                {/* Intro */}
                <div className="mb-8">
                    <p className="text-sm font-medium text-gray-500">
                        Dashboard
                    </p>

                    <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Research smarter.
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                        Explore financial data, quarterly results and
                        company information for Indian stocks.
                    </p>
                </div>

                {/* Search */}
                <StockSearch />

                {/* Recent stocks */}
                <div className="mt-10">
                    <RecentStocks />
                </div>

                {/* Coming soon */}
                <section className="mt-10">
                    <div className="mb-5">
                        <p className="text-sm font-medium text-gray-500">
                            More tools
                        </p>

                        <h2 className="mt-1 text-xl font-bold tracking-tight text-gray-900">
                            Coming soon
                        </h2>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-gray-200 bg-white p-6">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-sm">
                                ↗
                            </div>

                            <h3 className="mt-4 font-semibold text-gray-900">
                                More companies
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                Search and explore more NSE-listed
                                companies from one place.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-6">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-sm">
                                ◫
                            </div>

                            <h3 className="mt-4 font-semibold text-gray-900">
                                Financial datasets
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                Additional financial and company datasets
                                will be added as StockJump grows.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}