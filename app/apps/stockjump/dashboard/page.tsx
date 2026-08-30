"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { appConfig } from "../config";

import DashboardHeader from "./components/DashboardHeader";
import StockSearch from "./components/StockSearch";
import LatestResult from "./components/LatestResult";
import FinancialTrend from "./components/FinancialTrend";
import Fundamentals from "./components/Fundamentals";

export default function DashboardPage() {
    const router = useRouter();
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const storedToken =
            localStorage.getItem("stockjump_token");

        if (!storedToken) {
            router.replace(appConfig.links.login);
            return;
        }

        setAuthenticated(true);
    }, [router]);

    if (!authenticated) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50">
                <p className="text-sm text-zinc-400">
                    Loading...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-950">
            <DashboardHeader />

            <main className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
                <StockSearch />

                <LatestResult />

                <div className="my-12 border-t border-zinc-200" />

                <FinancialTrend />

                <div className="my-12 border-t border-zinc-200" />

                <Fundamentals />
            </main>
        </div>
    );
}