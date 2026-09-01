"use client";

import Link from "next/link";
import { appConfig } from "./config";
import LoginForm from "./login/page";

export default function StockJumpHomePage() {
    return (
        <div className="bg-[#07111f] text-white">
            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(74,222,128,0.10),transparent_35%)]" />

                <div className="relative max-w-7xl mx-auto px-6 pt-8 pb-24">
                    {/* Hero Navigation */}
                    <div className="flex items-center justify-between">
                        <Link
                            href={appConfig.links.home}
                            className="flex items-center gap-3"
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#102236] border border-[#223147] text-[#4ade80] text-xl">
                                ↗
                            </div>

                            <span className="text-xl font-extrabold tracking-tight">
                                Stock<span className="text-[#4ade80]">Jump</span>
                            </span>
                        </Link>

                        <div className="flex items-center gap-4">
                            <Link
                                href={appConfig.links.signup}
                                className="rounded-xl bg-[#4ade80] px-5 py-2.5 text-sm font-bold text-[#07111f] hover:bg-[#86efac] transition"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center pt-16 lg:pt-20">
                        {/* Left */}
                        <div>
                            <div className="inline-flex items-center rounded-full border border-[#27613d] bg-[#10291c] px-4 py-2 text-sm font-semibold text-[#4ade80]">
                                <span className="mr-2 h-2 w-2 rounded-full bg-[#4ade80]" />
                                Indian Stock Market Intelligence
                            </div>

                            <h1 className="mt-7 text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.03]">
                                Never Miss a{" "}
                                <span className="text-[#4ade80]">
                                    Quarterly Earnings
                                </span>{" "}
                                Again.
                            </h1>

                            <p className="mt-7 max-w-2xl text-lg md:text-xl leading-8 text-[#cbd5e1]">
                                Get notified when companies publish earnings.
                                Understand what changed with AI-powered
                                explanations, financial comparisons, and
                                actionable insights — without reading hundreds
                                of pages.
                            </p>

                            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#94a3b8]">
                                <span>✓ NSE earnings data</span>
                                <span>✓ AI-powered analysis</span>
                                <span>✓ Historical comparison</span>
                            </div>
                        </div>

                        {/* Right: Embedded Login Form Card */}
                        <div className="relative">
                            <div className="absolute -inset-4 rounded-[32px] bg-[#4ade80]/5 blur-2xl" />
                            <LoginForm />
                        </div>
                    </div>
                </div>
            </section>

            {/* Problem */}
            <section className="border-y border-[#18283b] bg-[#0d1728] py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="text-sm font-semibold uppercase tracking-wider text-[#4ade80]">
                            The Problem
                        </div>

                        <h2 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight">
                            Investors Waste Hours Every Earnings Season
                        </h2>

                        <p className="mt-5 text-lg leading-8 text-[#94a3b8]">
                            Important information is scattered across
                            announcements, filings, financial websites, and
                            long reports.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-14">
                        <ProblemCard
                            icon="😓"
                            title="Miss Earnings Releases"
                            description="Quarterly results are easy to miss unless you're constantly checking multiple sources."
                        />

                        <ProblemCard
                            icon="📄"
                            title="Reports Are Too Long"
                            description="Financial reports are packed with numbers, tables, and accounting terminology."
                        />

                        <ProblemCard
                            icon="🧠"
                            title="Hard to Know What Matters"
                            description="Revenue increased — but was that actually good? Margins improved — but why?"
                        />

                        <ProblemCard
                            icon="⏰"
                            title="Too Much Time"
                            description="Investors can spend 30 minutes or more understanding a single earnings release."
                        />
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="text-sm font-semibold uppercase tracking-wider text-[#4ade80]">
                            What StockJump Does
                        </div>

                        <h2 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight">
                            From Earnings Release to Understanding
                        </h2>

                        <p className="mt-5 text-lg leading-8 text-[#94a3b8]">
                            StockJump turns raw financial information into
                            something you can understand quickly.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-14">
                        <FeatureCard
                            icon="⚡"
                            title="Instant Earnings Alerts"
                            description="Know when a company publishes new quarterly results instead of repeatedly checking for updates."
                        />

                        <FeatureCard
                            icon="🤖"
                            title="AI Earnings Explanation"
                            description="Get a plain-English explanation of what changed, what improved, and what deserves attention."
                        />

                        <FeatureCard
                            icon="📊"
                            title="Compare Quarters"
                            description="Compare revenue, profit, EPS, margins and other financial metrics against previous periods."
                        />

                        <FeatureCard
                            icon="📈"
                            title="Historical Performance"
                            description="Look beyond one quarter and understand how a company's financial performance has evolved."
                        />

                        <FeatureCard
                            icon="⭐"
                            title="Watch Companies"
                            description="Follow the companies that matter to you and focus your attention on relevant earnings events."
                        />

                        <FeatureCard
                            icon="🧾"
                            title="Key Positives & Risks"
                            description="Quickly identify important positive and negative signals buried inside financial results."
                        />
                    </div>
                </div>
            </section>

            {/* Product Explanation */}
            <section className="bg-[#0d1728] border-y border-[#18283b] py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="text-sm font-semibold uppercase tracking-wider text-[#4ade80]">
                                Built for Research
                            </div>

                            <h2 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight">
                                Stop collecting numbers.
                                <br />
                                Start understanding them.
                            </h2>

                            <p className="mt-6 text-lg leading-8 text-[#94a3b8]">
                                StockJump is designed around the questions
                                investors actually ask after an earnings
                                release.
                            </p>

                            <div className="mt-8 space-y-4">
                                <Question text="Did revenue growth accelerate?" />
                                <Question text="Is profit growing faster than revenue?" />
                                <Question text="Are margins improving?" />
                                <Question text="How does this quarter compare with last year?" />
                                <Question text="What changed that actually matters?" />
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-[#223147] bg-[#101c2d] p-6 md:p-8">
                            <p className="text-sm text-[#64748b]">
                                TCS — Financial Snapshot
                            </p>

                            <div className="mt-6 grid grid-cols-2 gap-4">
                                <MiniMetric
                                    label="Revenue"
                                    value="₹1,285 Cr"
                                    change="+18.0%"
                                />

                                <MiniMetric
                                    label="Net Profit"
                                    value="₹128 Cr"
                                    change="+26.0%"
                                />

                                <MiniMetric
                                    label="EPS"
                                    value="₹12.42"
                                    change="+21.4%"
                                />

                                <MiniMetric
                                    label="Margin"
                                    value="24.8%"
                                    change="+1.8%"
                                />
                            </div>

                            <div className="mt-5 rounded-2xl border border-[#26374d] bg-[#0b1727] p-5">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-white">
                                        Quarter-over-Quarter
                                    </span>

                                    <span className="text-sm text-[#4ade80]">
                                        Improving
                                    </span>
                                </div>

                                <div className="mt-5 h-28 flex items-end gap-2">
                                    {[35, 48, 43, 58, 64, 72, 82, 94].map(
                                        (height, index) => (
                                            <div
                                                key={index}
                                                className="flex-1 rounded-t-md bg-[#4ade80]/70"
                                                style={{
                                                    height: `${height}%`,
                                                }}
                                            />
                                        )
                                    )}
                                </div>

                                <div className="mt-3 flex justify-between text-xs text-[#64748b]">
                                    <span>Q1</span>
                                    <span>Q2</span>
                                    <span>Q3</span>
                                    <span>Q4</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center">
                        <div className="text-sm font-semibold uppercase tracking-wider text-[#4ade80]">
                            Simple Workflow
                        </div>

                        <h2 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight">
                            Three Steps. Less Noise.
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mt-14">
                        <Step
                            number="01"
                            title="Company Releases Results"
                            description="StockJump detects the new earnings information."
                        />

                        <Step
                            number="02"
                            title="StockJump Analyses It"
                            description="Financial metrics are extracted, compared, and summarized."
                        />

                        <Step
                            number="03"
                            title="You Understand It"
                            description="Get the important changes and AI explanation without digging through everything yourself."
                        />
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 pb-24">
                <div className="max-w-6xl mx-auto overflow-hidden rounded-[36px] bg-gradient-to-br from-[#22c55e] to-[#16a34a] p-10 md:p-16 text-center text-[#07111f]">
                    <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                        Spend Less Time Reading.
                        <br />
                        Spend More Time Understanding.
                    </h2>

                    <p className="mt-5 max-w-2xl mx-auto text-lg leading-8 text-[#06351b]">
                        Create your StockJump account and start exploring
                        company earnings and financial data.
                    </p>

                    <div className="mt-9 flex flex-wrap justify-center gap-4">
                        <Link
                            href={appConfig.links.signup}
                            className="rounded-xl bg-[#07111f] px-7 py-4 font-bold text-white hover:bg-[#101c2d] transition"
                        >
                            Create Free Account →
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-[#18283b] py-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-5">
                    <div className="font-bold text-lg">
                        Stock<span className="text-[#4ade80]">Jump</span>
                    </div>

                    <p className="text-sm text-[#64748b]">
                        © 2026 StockJump. Built for smarter stock research.
                    </p>

                    <div className="flex gap-5 text-sm text-[#94a3b8]">
                        <Link
                            href={appConfig.links.privacy}
                            className="hover:text-white"
                        >
                            Privacy
                        </Link>

                        <Link
                            href={appConfig.links.terms}
                            className="hover:text-white"
                        >
                            Terms
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function ProblemCard({
    icon,
    title,
    description,
}: {
    icon: string;
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-[22px] border border-[#223147] bg-[#101c2d] p-6">
            <div className="text-3xl">{icon}</div>

            <h3 className="mt-5 text-lg font-bold">{title}</h3>

            <p className="mt-3 text-sm leading-7 text-[#94a3b8]">
                {description}
            </p>
        </div>
    );
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: string;
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-[24px] border border-[#223147] bg-[#101c2d] p-7 transition hover:-translate-y-1 hover:border-[#31543d]">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#163524] text-2xl">
                {icon}
            </div>

            <h3 className="mt-6 text-xl font-bold">{title}</h3>

            <p className="mt-3 leading-7 text-[#94a3b8]">{description}</p>
        </div>
    );
}

function Question({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#163524] text-sm text-[#4ade80]">
                ✓
            </span>

            <span className="text-[#cbd5e1]">{text}</span>
        </div>
    );
}

function MiniMetric({
    label,
    value,
    change,
}: {
    label: string;
    value: string;
    change: string;
}) {
    return (
        <div className="rounded-2xl border border-[#26374d] bg-[#0b1727] p-5">
            <p className="text-xs text-[#64748b]">{label}</p>

            <p className="mt-2 text-xl font-bold">{value}</p>

            <p className="mt-1 text-sm font-semibold text-[#4ade80]">{change}</p>
        </div>
    );
}

function Step({
    number,
    title,
    description,
}: {
    number: string;
    title: string;
    description: string;
}) {
    return (
        <div className="relative rounded-[24px] border border-[#223147] bg-[#101c2d] p-7">
            <span className="text-sm font-bold text-[#4ade80]">{number}</span>

            <h3 className="mt-5 text-xl font-bold">{title}</h3>

            <p className="mt-3 leading-7 text-[#94a3b8]">{description}</p>
        </div>
    );
}