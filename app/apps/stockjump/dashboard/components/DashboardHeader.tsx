"use client";

import Link from "next/link";
import { Bell, Rocket } from "lucide-react";

interface DashboardHeaderProps {
    onProfileClick?: () => void;
}

export default function DashboardHeader({
    onProfileClick,
}: DashboardHeaderProps) {
    return (
        <header className="h-[58px] border-b border-white/[0.06] bg-[#070d18]">
            <div className="flex h-full items-center justify-between px-5">
                <Link
                    href="/apps/stockjump/dashboard"
                    className="flex items-center gap-2.5"
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#00d084] text-[#06111d]">
                        <Rocket className="h-[17px] w-[17px]" strokeWidth={2.5} />
                    </div>

                    <span className="text-[17px] font-bold tracking-tight text-white">
                        Stock
                        <span className="text-[#00d084]">Jump</span>
                    </span>
                </Link>

                <div className="flex items-center gap-5">
                    <button
                        type="button"
                        className="relative flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/5 hover:text-white"
                        aria-label="Notifications"
                    >
                        <Bell className="h-[18px] w-[18px]" />

                        <span className="absolute right-[5px] top-[4px] h-1.5 w-1.5 rounded-full bg-[#00d084]" />
                    </button>

                    <button
                        type="button"
                        onClick={onProfileClick}
                        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-300 via-purple-400 to-orange-200 text-xs font-bold text-white ring-2 ring-white/10"
                        aria-label="Profile"
                    >
                        <span>👨🏻</span>
                    </button>
                </div>
            </div>
        </header>
    );
}