"use client";

import type { ResultRecord } from "../lib/api";
import {
    marginPercent,
    toNumber,
} from "../lib/format";

interface MarginPoint {
    label: string;
    operating: number | null;
    net: number | null;
}

function buildPoints(records: ResultRecord[]): MarginPoint[] {
    return [...records]
        .slice(0, 8)
        .reverse()
        .map((record) => {
            const revenue =
                record.metricsInCrores?.revenue ??
                record.revenue;
            const operatingProfit =
                record.metricsInCrores?.operatingProfit ??
                record.operatingProfit;
            const netProfit =
                record.metricsInCrores?.netProfit ??
                record.netProfit;

            return {
                label: `${record.quarter ?? "-"} ${
                    record.year
                        ? `'${String(record.year).slice(-2)}`
                        : ""
                }`,
                operating: marginPercent(
                    toNumber(operatingProfit),
                    toNumber(revenue)
                ),
                net: marginPercent(
                    toNumber(netProfit),
                    toNumber(revenue)
                ),
            };
        });
}

export default function MarginTrendChart({
    records,
}: {
    records: ResultRecord[];
}) {
    const points = buildPoints(records);
    const values = points.flatMap((point) => [
        point.operating,
        point.net,
    ]);
    const present = values.filter(
        (value): value is number => value !== null
    );

    if (points.length === 0 || present.length === 0) {
        return (
            <div className="py-16 text-center text-xs text-slate-500">
                No margin history available for this basis.
            </div>
        );
    }

    const maximum = Math.max(5, ...present);
    const minimum = Math.min(0, ...present);
    const range = maximum - minimum || 1;

    const width = 720;
    const height = 240;
    const padding = {
        top: 16,
        right: 18,
        bottom: 30,
        left: 38,
    };
    const innerWidth =
        width - padding.left - padding.right;
    const innerHeight =
        height - padding.top - padding.bottom;

    const x = (index: number) =>
        padding.left +
        (points.length === 1
            ? innerWidth / 2
            : (innerWidth / (points.length - 1)) * index);

    const y = (value: number) =>
        padding.top +
        ((maximum - value) / range) * innerHeight;

    const zeroY = y(0);
    const ticks = [minimum, (minimum + maximum) / 2, maximum];

    function linePath(key: "operating" | "net") {
        const segments: string[] = [];
        let started = false;

        points.forEach((point, index) => {
            const value = point[key];

            if (value === null) {
                started = false;
                return;
            }

            segments.push(
                `${started ? "L" : "M"} ${x(index)} ${y(value)}`
            );
            started = true;
        });

        return segments.join(" ");
    }

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label="Operating and net margin by quarter"
            className="h-56 w-full"
        >
            {ticks.map((tick) => (
                <g key={tick}>
                    <line
                        x1={padding.left}
                        x2={width - padding.right}
                        y1={y(tick)}
                        y2={y(tick)}
                        stroke="#1e293b"
                        strokeWidth="1"
                    />
                    <text
                        x={padding.left - 8}
                        y={y(tick) + 3}
                        textAnchor="end"
                        fill="#64748b"
                        fontSize="9"
                    >
                        {tick.toFixed(0)}%
                    </text>
                </g>
            ))}

            <line
                x1={padding.left}
                x2={width - padding.right}
                y1={zeroY}
                y2={zeroY}
                stroke="#334155"
                strokeWidth="1"
            />

            <path
                d={linePath("operating")}
                fill="none"
                stroke="#00d084"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
            />

            <path
                d={linePath("net")}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.75"
                strokeDasharray="4 3"
                strokeLinejoin="round"
                strokeLinecap="round"
            />

            {points.map((point, index) => (
                <g key={`${point.label}-${index}`}>
                    <text
                        x={x(index)}
                        y={height - 8}
                        textAnchor="middle"
                        fill="#64748b"
                        fontSize="9"
                    >
                        {point.label}
                    </text>

                    {point.operating !== null && (
                        <circle
                            cx={x(index)}
                            cy={y(point.operating)}
                            r="3"
                            fill="#00d084"
                        >
                            <title>
                                {point.label} operating margin:{" "}
                                {point.operating.toFixed(1)}%
                            </title>
                        </circle>
                    )}

                    {point.net !== null && (
                        <circle
                            cx={x(index)}
                            cy={y(point.net)}
                            r="2.5"
                            fill="#f59e0b"
                        >
                            <title>
                                {point.label} net margin:{" "}
                                {point.net.toFixed(1)}%
                            </title>
                        </circle>
                    )}
                </g>
            ))}
        </svg>
    );
}
