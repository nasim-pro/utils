"use client";

import { BarChart3, List, TrendingUp } from "lucide-react";

export type DashboardTab = "recent" | "top" | "all";

interface StockTabsProps {
    activeTab: DashboardTab;
    onChange: (tab: DashboardTab) => void;
}

const tabs = [
    { id: "recent" as const, label: "Recent Earnings (24h)", icon: TrendingUp },
    { id: "top" as const, label: "Strong Movers", icon: BarChart3 },
    { id: "all" as const, label: "All Stocks", icon: List },
];

export default function StockTabs({ activeTab, onChange }: StockTabsProps) {
    return (
        <div className="flex items-center gap-2 overflow-x-auto py-1">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;

                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onChange(tab.id)}
                        className={`flex h-[38px] shrink-0 items-center gap-2 rounded-full px-4 text-xs font-semibold transition ${active
                                ? "bg-[#00d084] text-[#050e18] shadow-sm shadow-[#00d084]/20"
                                : "bg-[#111c2d] text-slate-400 hover:bg-[#162338] hover:text-slate-200 border border-white/[0.04]"
                            }`}
                    >
                        <Icon className="h-4 w-4" strokeWidth={active ? 2.5 : 2} />
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}