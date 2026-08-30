"use client";

import {
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const data = [
    { quarter: "Q1 FY26", revenue: 110, pat: 8 },
    { quarter: "Q2 FY26", revenue: 116, pat: 9 },
    { quarter: "Q3 FY26", revenue: 119, pat: 9.5 },
    { quarter: "Q4 FY26", revenue: 121, pat: 10 },
    { quarter: "Q1 FY27", revenue: 125.4, pat: 11.6 },
];

export default function FinancialTrend() {
    return (
        <section>
            <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                    Financial Trend
                </p>

                <h2 className="mt-1 text-xl font-bold tracking-tight text-zinc-950">
                    Revenue & profitability
                </h2>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
                <div className="mb-5 flex gap-2">
                    <button className="rounded-lg bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-white">
                        Quarterly
                    </button>

                    <button className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100">
                        Yearly
                    </button>
                </div>

                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <XAxis
                                dataKey="quarter"
                                tick={{ fontSize: 11 }}
                            />

                            <YAxis
                                tick={{ fontSize: 11 }}
                            />

                            <Tooltip />

                            <Line
                                type="monotone"
                                dataKey="revenue"
                                strokeWidth={2}
                                dot={false}
                            />

                            <Line
                                type="monotone"
                                dataKey="pat"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </section>
    );
}