"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Rocket } from "lucide-react";
import { appConfig } from "../../config";
import { clearAuthSession } from "../lib/session";

export default function DashboardHeader() {
    const router = useRouter();

    function handleLogout() {
        clearAuthSession();
        router.push(appConfig.links.login);
        router.refresh();
    }

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

                <div className="flex items-center gap-3">
                    <span className="hidden text-[10px] font-semibold text-slate-500 sm:inline">
                        Indian earnings, explained
                    </span>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/5 hover:text-white"
                        aria-label="Log out"
                        title="Log out"
                    >
                        <LogOut className="h-[17px] w-[17px]" />
                    </button>
                </div>
            </div>
        </header>
    );
}
