"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "stockjump:watchlist";
const CHANGE_EVENT = "stockjump:watchlist-change";
const EMPTY: string[] = [];

let cachedRaw: string | null = null;
let cachedList: string[] = EMPTY;

function normalize(list: unknown): string[] {
    if (!Array.isArray(list)) {
        return [];
    }

    const symbols = [
        ...new Set(
            list
                .filter(
                    (item): item is string =>
                        typeof item === "string" &&
                        item.trim() !== ""
                )
                .map((item) => item.trim().toUpperCase())
        ),
    ];

    return symbols.length > 0 ? symbols : EMPTY;
}

function parse(raw: string | null): string[] {
    if (!raw) {
        return EMPTY;
    }

    try {
        return normalize(JSON.parse(raw));
    } catch {
        return EMPTY;
    }
}

function getSnapshot(): string[] {
    if (typeof window === "undefined") {
        return EMPTY;
    }

    let raw: string | null = null;

    try {
        raw = window.localStorage.getItem(STORAGE_KEY);
    } catch {
        return EMPTY;
    }

    // Keep the reference stable while localStorage is unchanged; otherwise
    // useSyncExternalStore would re-render on every read.
    if (raw !== cachedRaw) {
        cachedRaw = raw;
        cachedList = parse(raw);
    }

    return cachedList;
}

function getServerSnapshot(): string[] {
    return EMPTY;
}

function subscribe(callback: () => void) {
    window.addEventListener(CHANGE_EVENT, callback);
    window.addEventListener("storage", callback);

    return () => {
        window.removeEventListener(CHANGE_EVENT, callback);
        window.removeEventListener("storage", callback);
    };
}

function writeWatchlist(symbols: string[]) {
    if (typeof window === "undefined") {
        return;
    }

    try {
        window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(symbols)
        );
    } catch {
        // Storage can be full or blocked; the current list still works.
    }
}

/**
 * Watchlist persisted in localStorage so it survives reloads and is shared
 * between the dashboard table and the stock detail page.
 */
export function useWatchlist() {
    const watchlist = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot
    );

    const toggle = useCallback((symbol: string) => {
        const ticker = symbol.trim().toUpperCase();

        if (!ticker) {
            return;
        }

        const current = getSnapshot();
        const next = current.includes(ticker)
            ? current.filter((item) => item !== ticker)
            : [...current, ticker];

        writeWatchlist(next);
        window.dispatchEvent(new Event(CHANGE_EVENT));
    }, []);

    const isWatched = useCallback(
        (symbol: string) =>
            watchlist.includes(symbol.trim().toUpperCase()),
        [watchlist]
    );

    return { watchlist, toggle, isWatched };
}
