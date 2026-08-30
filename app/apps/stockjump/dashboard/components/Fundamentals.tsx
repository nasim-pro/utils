const fundamentals = [
    {
        label: "Revenue CAGR",
        values: [
            ["3Y", "+12.4%"],
            ["5Y", "+10.8%"],
        ],
    },
    {
        label: "PAT CAGR",
        values: [
            ["3Y", "+18.2%"],
            ["5Y", "+15.1%"],
        ],
    },
    {
        label: "EPS CAGR",
        values: [
            ["3Y", "+16.7%"],
            ["5Y", "+14.3%"],
        ],
    },
];

const keyStats = [
    ["P/E", "16.98"],
    ["P/B", "0.31"],
    ["Debt", "₹68 Cr"],
    ["Promoter", "83.05%"],
];

export default function Fundamentals() {
    return (
        <section>
            <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                    Fundamentals
                </p>

                <h2 className="mt-1 text-xl font-bold tracking-tight text-zinc-950">
                    Business health
                </h2>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white">
                <div className="divide-y divide-zinc-100">
                    {fundamentals.map((item) => (
                        <div
                            key={item.label}
                            className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <p className="text-sm font-medium text-zinc-700">
                                {item.label}
                            </p>

                            <div className="flex gap-8">
                                {item.values.map(([period, value]) => (
                                    <div key={period}>
                                        <p className="text-xs text-zinc-400">
                                            {period}
                                        </p>

                                        <p className="mt-1 text-sm font-bold text-emerald-600">
                                            {value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-2 border-t border-zinc-100 sm:grid-cols-4">
                    {keyStats.map(([label, value]) => (
                        <div
                            key={label}
                            className="border-r border-zinc-100 p-5 last:border-r-0"
                        >
                            <p className="text-xs text-zinc-400">
                                {label}
                            </p>

                            <p className="mt-2 text-lg font-bold text-zinc-950">
                                {value}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}