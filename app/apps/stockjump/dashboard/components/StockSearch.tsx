"use client";

import { Search } from "lucide-react";
import { useState } from "react";

interface StockSearchProps {
    onSearch?: (value: string) => void;
}

export default function StockSearch({ onSearch }: StockSearchProps) {
    const [value, setValue] = useState("");

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onSearch?.(value.trim());
    }

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                    value={value}
                    onChange={(event) => {
                        setValue(event.target.value);
                        onSearch?.(event.target.value.trim());
                    }}
                    placeholder="Search companies, tickers..."
                    className="h-11 w-full rounded-xl border border-white/[0.06] bg-[#111b2b] pl-11 pr-4 text-xs text-white outline-none placeholder:text-slate-500 transition focus:border-[#00d084]/50 focus:ring-2 focus:ring-[#00d084]/10"
                />
            </div>
        </form>
    );
}