"use client";

import Link from "next/link";
import { appConfig } from "../config";

export default function Navbar() {
    return (
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-md">
            <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link
                    href={appConfig.links.home}
                    className="flex items-center gap-3"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white font-bold">
                        S
                    </div>

                    <span className="font-bold text-xl tracking-tight text-gray-900">
                        {appConfig.name}
                    </span>
                </Link>

                <div className="flex items-center gap-6 text-sm font-medium">
                    <Link
                        href={appConfig.links.home}
                        className="text-gray-700 hover:text-black transition"
                    >
                        Home
                    </Link>

                    <Link
                        href={appConfig.links.login}
                        className="text-gray-700 hover:text-black transition"
                    >
                        Log in
                    </Link>

                    <Link
                        href={appConfig.links.signup}
                        className="rounded-xl bg-black px-5 py-2.5 text-white hover:opacity-90 transition"
                    >
                        Get Started
                    </Link>
                </div>
            </nav>
        </header>
    );
}