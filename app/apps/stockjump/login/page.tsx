"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { appConfig } from "../config";

interface LoginFormProps {
    onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
    const router = useRouter();

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
            const url = `${appConfig.api.baseUrl.trim()}/api/auth/login`;

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
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
                throw new Error(data.message || "Invalid email or password");
            }

            const token = data.data?.token || data.token;
            if (token) {
                localStorage.setItem("stockjump_token", token);
            }

            if (onSuccess) {
                onSuccess();
            } else {
                router.push(appConfig.links.dashboard);
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to login. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="relative rounded-[28px] border border-[#223147] bg-[#101c2d] p-6 sm:p-8 shadow-2xl text-gray-900">
            <div className="text-left">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Welcome back
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">
                    Log in to StockJump
                </h2>
                <p className="mt-1 text-xs text-gray-400">
                    Your earnings intelligence dashboard is waiting.
                </p>
            </div>

            {error && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                        Email address
                    </label>
                    <input
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        className="h-11 w-full rounded-xl border border-gray-700 bg-[#07111f] px-4 text-xs text-white outline-none transition focus:border-[#4ade80] focus:ring-2 focus:ring-[#4ade80]/20 placeholder:text-gray-600"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            autoComplete="current-password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Enter your password"
                            className="h-11 w-full rounded-xl border border-gray-700 bg-[#07111f] px-4 pr-16 text-xs text-white outline-none transition focus:border-[#4ade80] focus:ring-2 focus:ring-[#4ade80]/20 placeholder:text-gray-600"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((value) => !value)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-[11px] font-semibold text-gray-400 hover:bg-white/5 hover:text-white"
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="h-11 w-full rounded-xl bg-[#4ade80] px-5 text-xs font-bold text-[#07111f] transition hover:bg-[#86efac] disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                >
                    {loading ? "Logging in..." : "Log in"}
                </button>
            </form>

            <p className="mt-6 text-center text-xs text-gray-400">
                Don't have an account?{" "}
                <Link
                    href={appConfig.links.signup}
                    className="font-semibold text-[#4ade80] hover:underline"
                >
                    Create your account
                </Link>
            </p>
        </div>
    );
}