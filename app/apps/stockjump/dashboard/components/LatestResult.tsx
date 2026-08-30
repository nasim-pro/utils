import { ArrowUpRight, Sparkles } from "lucide-react";
import MetricGrid from "./MetricGrid";

export default function LatestResult() {
    const metrics = [
        {
            label: "Revenue",
            value: "₹125.4 Cr",
            yoy: "13.8%",
            qoq: "6.2%",
        },
        {
            label: "PAT",
            value: "₹11.6 Cr",
            yoy: "24.7%",
            qoq: "18.4%",
        },
        {
            label: "EPS",
            value: "₹0.74",
            yoy: "23.3%",
            qoq: "19.4%",
        },
        {
            label: "EBITDA",
            value: "₹18.2 Cr",
            yoy: "9.2%",
            qoq: "4.1%",
        },
    ];

    return (
        <article>
            <div className="mb-6">
                <div className="mb-4 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500" />

                    <span className="text-xs font-bold uppercase tracking-widest text-red-500">
                        New Result
                    </span>
                </div>

                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-black tracking-tight text-zinc-950">
                                TICL
                            </h1>

                            <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600">
                                +2.4%
                            </span>
                        </div>

                        <p className="mt-1 text-base text-zinc-500">
                            Tilaknagar Industries Ltd.
                        </p>
                    </div>

                    <div className="text-left sm:text-right">
                        <p className="text-3xl font-bold tracking-tight text-zinc-950">
                            ₹9.30
                        </p>

                        <p className="text-xs text-zinc-400">
                            NSE
                        </p>
                    </div>
                </div>
            </div>

            <div className="mb-3 flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold text-zinc-900">
                        Q1 FY27 Result
                    </p>

                    <p className="mt-0.5 text-xs text-zinc-400">
                        28 Aug 2026
                    </p>
                </div>
            </div>

            <MetricGrid metrics={metrics} />

            <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-zinc-900" />

                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                        AI Take
                    </p>
                </div>

                <div className="mt-5">
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        POSITIVE
                    </div>

                    <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-600">
                        Profit grew significantly faster than revenue.
                        EPS also improved both sequentially and YoY.
                        This indicates improved profitability rather than
                        growth being driven only by sales.
                    </p>
                </div>

                <div className="mt-6 border-t border-zinc-100 pt-5">
                    <p className="text-sm font-semibold text-zinc-900">
                        What to watch
                    </p>

                    <ul className="mt-3 space-y-2 text-sm text-zinc-500">
                        <li>• Debt remains elevated</li>
                        <li>• Valuation needs comparison with peers</li>
                    </ul>
                </div>

                <div className="mt-6 flex flex-col gap-4 border-t border-zinc-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        AI View:
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                            Positive
                        </span>
                    </div>

                    <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800">
                        Read Full Analysis
                        <ArrowUpRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </article>
    );
}