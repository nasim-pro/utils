interface Metric {
    label: string;
    value: string;
    yoy?: string;
    qoq?: string;
}

interface MetricGridProps {
    metrics: Metric[];
}

export default function MetricGrid({
    metrics,
}: MetricGridProps) {
    return (
        <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-zinc-200 bg-white md:grid-cols-4">
            {metrics.map((metric, index) => (
                <div
                    key={metric.label}
                    className={`p-5 ${index > 0
                            ? "border-l border-zinc-200"
                            : ""
                        } ${index === 2
                            ? "max-md:border-l-0 max-md:border-t"
                            : ""
                        } ${index === 3
                            ? "max-md:border-t"
                            : ""
                        }`}
                >
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                        {metric.label}
                    </p>

                    <p className="mt-2 text-xl font-bold tracking-tight text-zinc-950">
                        {metric.value}
                    </p>

                    <div className="mt-3 space-y-1 text-xs">
                        {metric.yoy && (
                            <p className="text-emerald-600">
                                ↑ {metric.yoy} YoY
                            </p>
                        )}

                        {metric.qoq && (
                            <p className="text-emerald-600">
                                ↑ {metric.qoq} QoQ
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}