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
        <main className="min-h-screen bg-[#080f1c] px-4 py-6 sm:px-6 sm:py-10">
            <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0b1422] shadow-[0_25px_80px_rgba(0,0,0,0.35)] lg:grid-cols-2">

                {/* Left side */}
                <div className="relative hidden overflow-hidden border-r border-white/[0.06] bg-[#070d18] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-12">

                    {/* Subtle background glow */}
                    <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[#00d084]/[0.07] blur-3xl" />

                    <div className="relative">
                        {/* Logo */}
                        <Link
                            href={appConfig.links.home}
                            className="inline-flex items-center gap-2.5"
                        >
                            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#00d084] text-sm font-bold text-[#06111d]">
                                S
                            </span>

                            <span className="text-lg font-bold tracking-tight">
                                Stock
                                <span className="text-[#00d084]">
                                    Jump
                                </span>
                            </span>
                        </Link>

                        <div className="mt-28 max-w-md">
                            <div className="mb-5 inline-flex rounded-full border border-[#00d084]/20 bg-[#00d084]/[0.06] px-4 py-2 text-xs font-medium text-[#00d084]">
                                Built for earnings-driven investors
                            </div>

                            <h2 className="text-4xl font-bold leading-[1.12] tracking-tight text-white">
                                Know what happened.
                                <br />
                                <span className="text-[#00d084]">
                                    Know why it matters.
                                </span>
                            </h2>

                            <p className="mt-6 text-sm leading-7 text-slate-400">
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
                                        className="flex items-center gap-3 text-sm text-slate-300"
                                    >
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#00d084]/10 text-xs font-bold text-[#00d084]">
                                            ✓
                                        </span>

                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <p className="relative text-xs text-slate-600">
                        NSE earnings intelligence, simplified.
                    </p>
                </div>

                {/* Form */}
                <div className="bg-[#0b1422] p-7 sm:p-10 lg:p-14 xl:p-16">
                    <div className="mx-auto max-w-md">

                        {/* Mobile logo */}
                        <Link
                            href={appConfig.links.home}
                            className="flex items-center gap-2.5 lg:hidden"
                        >
                            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#00d084] text-sm font-bold text-[#06111d]">
                                S
                            </span>

                            <span className="text-lg font-bold tracking-tight text-white">
                                Stock
                                <span className="text-[#00d084]">
                                    Jump
                                </span>
                            </span>
                        </Link>

                        <div className="mt-10 lg:mt-0">
                            <p className="text-xs font-semibold uppercase tracking-wider text-[#00d084]">
                                Get started
                            </p>

                            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                Create your account
                            </h1>

                            <p className="mt-3 text-sm leading-6 text-slate-400">
                                Start tracking the Indian companies that
                                matter to you.
                            </p>
                        </div>

                        {error && (
                            <div className="mt-8 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            className="mt-8 space-y-5"
                        >
                            {/* Name */}
                            <div>
                                <label className="text-xs font-semibold text-slate-300">
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
                                    className="mt-2 h-12 w-full rounded-xl border border-white/[0.08] bg-[#141d2c] px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-[#00d084]/50 focus:ring-4 focus:ring-[#00d084]/[0.08]"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="text-xs font-semibold text-slate-300">
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
                                    className="mt-2 h-12 w-full rounded-xl border border-white/[0.08] bg-[#141d2c] px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-[#00d084]/50 focus:ring-4 focus:ring-[#00d084]/[0.08]"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="text-xs font-semibold text-slate-300">
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
                                        className="h-12 w-full rounded-xl border border-white/[0.08] bg-[#141d2c] px-4 pr-16 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-[#00d084]/50 focus:ring-4 focus:ring-[#00d084]/[0.08]"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                (value) => !value
                                            )
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 transition hover:bg-white/[0.05] hover:text-slate-200"
                                    >
                                        {showPassword
                                            ? "Hide"
                                            : "Show"}
                                    </button>
                                </div>

                                <p className="mt-2 text-xs text-slate-600">
                                    Use at least 8 characters.
                                </p>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="h-12 w-full rounded-xl bg-[#00d084] px-5 text-sm font-semibold text-[#06111d] transition hover:bg-[#00bd78] focus:outline-none focus:ring-4 focus:ring-[#00d084]/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading
                                    ? "Creating account..."
                                    : "Create account"}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-sm text-slate-500">
                            Already have an account?{" "}
                            <Link
                                href={appConfig.links.login}
                                className="font-semibold text-[#00d084] transition hover:text-[#19e39a]"
                            >
                                Log in
                            </Link>
                        </p>

                        <p className="mt-6 text-center text-xs leading-5 text-slate-600">
                            By creating an account, you agree to StockJump's{" "}
                            <Link
                                href={appConfig.links.terms}
                                className="underline decoration-slate-700 underline-offset-2 transition hover:text-slate-400"
                            >
                                Terms
                            </Link>{" "}
                            and{" "}
                            <Link
                                href={appConfig.links.privacy}
                                className="underline decoration-slate-700 underline-offset-2 transition hover:text-slate-400"
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