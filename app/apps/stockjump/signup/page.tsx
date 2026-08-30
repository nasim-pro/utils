"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { appConfig } from "../config";

export default function SignupPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setLoading(true);
        setError("");

        try {
            const url = `${appConfig.api.baseUrl.trim()}/api/auth/register`;

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    password,
                }),
            });

            let data: any;

            try {
                data = await response.json();
            } catch {
                throw new Error("Invalid response from server");
            }

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to create account"
                );
            }

            router.push(appConfig.links.login);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to create account. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-[calc(100vh-64px)] bg-[#f7f8fa] px-6 py-16">
            <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-gray-200 bg-white shadow-[0_20px_70px_rgba(0,0,0,0.08)] lg:grid-cols-2">

                {/* Left side */}
                <div className="hidden bg-black p-12 text-white lg:flex lg:flex-col lg:justify-between">
                    <div>
                        <Link
                            href={appConfig.links.home}
                            className="inline-flex items-center gap-2 text-lg font-bold"
                        >
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black">
                                S
                            </span>
                            StockJump
                        </Link>

                        <div className="mt-24 max-w-md">
                            <div className="mb-5 inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white/70">
                                Built for earnings-driven investors
                            </div>

                            <h2 className="text-4xl font-bold leading-tight">
                                Know what happened.
                                <br />
                                Know why it matters.
                            </h2>

                            <p className="mt-6 text-base leading-7 text-white/60">
                                Follow the companies you care about and let
                                StockJump bring important earnings results,
                                analytics and AI insights directly to you.
                            </p>

                            <div className="mt-10 space-y-4">
                                {[
                                    "Quarterly earnings notifications",
                                    "Watchlist and custom alerts",
                                    "Financial analytics and AI insights",
                                ].map((item) => (
                                    <div
                                        key={item}
                                        className="flex items-center gap-3 text-sm text-white/80"
                                    >
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs">
                                            ✓
                                        </span>
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-white/40">
                        NSE earnings intelligence, simplified.
                    </p>
                </div>

                {/* Form */}
                <div className="p-8 sm:p-12 lg:p-16">
                    <div className="mx-auto max-w-md">
                        <Link
                            href={appConfig.links.home}
                            className="flex items-center gap-2 text-lg font-bold text-gray-900 lg:hidden"
                        >
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white">
                                S
                            </span>
                            StockJump
                        </Link>

                        <div className="mt-10 lg:mt-0">
                            <p className="text-sm font-semibold text-gray-500">
                                Get started
                            </p>

                            <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-950">
                                Create your account
                            </h1>

                            <p className="mt-3 text-gray-500">
                                Start tracking the Indian companies that
                                matter to you.
                            </p>
                        </div>

                        {error && (
                            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            className="mt-8 space-y-5"
                        >
                            <div>
                                <label className="text-sm font-semibold text-gray-800">
                                    Name
                                </label>

                                <input
                                    type="text"
                                    required
                                    autoComplete="name"
                                    value={name}
                                    onChange={(event) =>
                                        setName(event.target.value)
                                    }
                                    placeholder="Your name"
                                    className="mt-2 h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-black focus:ring-4 focus:ring-black/5"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-gray-800">
                                    Email address
                                </label>

                                <input
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    placeholder="you@example.com"
                                    className="mt-2 h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-black focus:ring-4 focus:ring-black/5"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-gray-800">
                                    Password
                                </label>

                                <div className="relative mt-2">
                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        required
                                        minLength={8}
                                        autoComplete="new-password"
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(event.target.value)
                                        }
                                        placeholder="At least 8 characters"
                                        className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 pr-16 text-sm text-gray-900 outline-none transition focus:border-black focus:ring-4 focus:ring-black/5"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((value) => !value)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>

                                <p className="mt-2 text-xs text-gray-400">
                                    Use at least 8 characters.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="h-12 w-full rounded-xl bg-black px-5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading
                                    ? "Creating account..."
                                    : "Create account"}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-sm text-gray-500">
                            Already have an account?{" "}
                            <Link
                                href={appConfig.links.login}
                                className="font-semibold text-gray-950 hover:underline"
                            >
                                Log in
                            </Link>
                        </p>

                        <p className="mt-6 text-center text-xs leading-5 text-gray-400">
                            By creating an account, you agree to StockJump's{" "}
                            <Link
                                href={appConfig.links.terms}
                                className="underline hover:text-gray-600"
                            >
                                Terms
                            </Link>{" "}
                            and{" "}
                            <Link
                                href={appConfig.links.privacy}
                                className="underline hover:text-gray-600"
                            >
                                Privacy Policy
                            </Link>
                            .
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}

