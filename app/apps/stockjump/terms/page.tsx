"use client";

import Link from "next/link";
import { appConfig } from "../config";

export default function Terms() {
    return (
        <main className="min-h-screen bg-[#080f1c] text-slate-300">
            {/* Header */}
            <header className="border-b border-white/[0.06] bg-[#070d18]">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
                    <Link
                        href={appConfig.links.home}
                        className="flex items-center gap-2.5"
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

                    <Link
                        href={appConfig.links.home}
                        className="text-sm text-slate-500 transition hover:text-white"
                    >
                        Back to StockJump
                    </Link>
                </div>
            </header>

            {/* Content */}
            <div className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
                <div className="mb-10">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#00d084]">
                        Legal
                    </p>

                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Terms and Conditions
                    </h1>

                    <p className="mt-3 text-sm text-slate-500">
                        Last updated: August 31, 2026
                    </p>
                </div>

                <div className="space-y-10 text-sm leading-7">
                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            1. Acceptance of Terms
                        </h2>

                        <p className="mt-3">
                            These Terms and Conditions ("Terms") govern your
                            access to and use of StockJump, including the
                            StockJump website, applications, dashboards,
                            financial data, research tools, analytics,
                            notifications, AI-generated insights and related
                            services (collectively, the "Service").
                        </p>

                        <p className="mt-3">
                            By creating an account, accessing or using the
                            Service, you agree to be bound by these Terms. If
                            you do not agree with these Terms, you must not
                            access or use StockJump.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            2. Description of the Service
                        </h2>

                        <p className="mt-3">
                            StockJump provides financial information,
                            historical and current market-related data,
                            company earnings information, financial metrics,
                            analytical tools, comparisons, rankings, scores,
                            charts, summaries and other research-oriented
                            information relating to publicly listed companies
                            and securities.
                        </p>

                        <p className="mt-3">
                            The Service is intended to help users research and
                            understand publicly available financial
                            information. StockJump is not a stock exchange,
                            broker, dealer, portfolio manager, investment
                            adviser, bank, financial institution or custodian
                            unless expressly stated otherwise.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            3. Not Investment Advice
                        </h2>

                        <div className="mt-4 rounded-xl border border-[#00d084]/20 bg-[#00d084]/[0.05] p-5">
                            <p className="font-medium leading-7 text-slate-200">
                                StockJump provides information and analytical
                                content for research and educational purposes.
                                The information provided through the Service
                                should not be treated as personalized
                                investment advice, financial advice, legal
                                advice, tax advice or a recommendation to buy,
                                sell or hold any security.
                            </p>
                        </div>

                        <p className="mt-4">
                            Nothing on StockJump should be interpreted as a
                            promise, guarantee or assurance regarding the
                            future performance or price of any security,
                            company or investment.
                        </p>

                        <p className="mt-3">
                            You are solely responsible for evaluating any
                            investment decision and should consider your own
                            financial circumstances, objectives, risk
                            tolerance and investment horizon. Where
                            appropriate, you should consult a qualified
                            financial professional before making investment
                            decisions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            4. Stock Scores, Rankings and AI Insights
                        </h2>

                        <p className="mt-3">
                            StockJump may provide scores, rankings,
                            classifications, sentiment indicators,
                            comparisons, summaries and AI-generated insights
                            relating to companies or securities.
                        </p>

                        <p className="mt-3">
                            These outputs are analytical tools and are not
                            guarantees of future performance or indications of
                            what a user should buy, sell or hold.
                        </p>

                        <p className="mt-3">
                            AI-generated content may contain errors,
                            omissions, outdated information, incorrect
                            interpretations or other inaccuracies. AI outputs
                            should be independently verified before being
                            relied upon.
                        </p>

                        <p className="mt-3">
                            StockJump does not guarantee that any score,
                            ranking, sentiment classification, analysis or
                            AI-generated insight is accurate, complete,
                            timely or suitable for any particular user.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            5. Financial and Market Data
                        </h2>

                        <p className="mt-3">
                            StockJump may obtain financial, corporate,
                            earnings, market and other information from
                            publicly available sources, exchanges, company
                            filings, data providers and other third-party
                            sources.
                        </p>

                        <p className="mt-3">
                            While we attempt to provide useful and reliable
                            information, we do not guarantee that any data is
                            accurate, complete, current, uninterrupted or free
                            from errors.
                        </p>

                        <p className="mt-3">
                            Financial figures, earnings results, prices,
                            ratios, corporate information and other data may
                            change or be revised after publication.
                        </p>

                        <p className="mt-3">
                            You should verify material information against
                            official company filings, stock exchange
                            disclosures and other authoritative sources before
                            relying upon it.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            6. No Guarantee of Investment Results
                        </h2>

                        <p className="mt-3">
                            Past performance is not indicative of future
                            results. Historical returns, earnings growth,
                            financial ratios, scores, rankings and other
                            historical information do not guarantee future
                            performance.
                        </p>

                        <p className="mt-3">
                            StockJump makes no representation or guarantee that
                            use of the Service will result in profits, prevent
                            losses or improve investment performance.
                        </p>

                        <p className="mt-3">
                            Investments in securities are subject to market
                            risks, including the possible loss of some or all
                            of the invested capital.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            7. User Responsibility
                        </h2>

                        <p className="mt-3">
                            You are responsible for your own investment,
                            trading and financial decisions.
                        </p>

                        <p className="mt-3">
                            You must independently evaluate any information
                            obtained through StockJump and determine whether
                            it is appropriate for your circumstances.
                        </p>

                        <p className="mt-3">
                            You must not rely solely on StockJump, its scores,
                            rankings, AI-generated content, financial
                            information or other Service outputs when making
                            investment decisions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            8. Account Registration
                        </h2>

                        <p className="mt-3">
                            Certain features may require you to create an
                            account. You agree to provide accurate and
                            reasonably current information when registering.
                        </p>

                        <p className="mt-3">
                            You are responsible for maintaining the
                            confidentiality of your account credentials and
                            for activities performed through your account.
                        </p>

                        <p className="mt-3">
                            You must notify StockJump promptly if you believe
                            that your account or credentials have been
                            compromised.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            9. Acceptable Use
                        </h2>

                        <p className="mt-3">
                            You agree not to misuse the Service, including by:
                        </p>

                        <ul className="mt-3 list-disc space-y-2 pl-6">
                            <li>
                                attempting to gain unauthorized access to the
                                Service or another user's account;
                            </li>
                            <li>
                                interfering with or disrupting the Service;
                            </li>
                            <li>
                                using automated systems to scrape or collect
                                information without authorization;
                            </li>
                            <li>
                                reproducing, reselling or commercially
                                exploiting StockJump content without
                                permission;
                            </li>
                            <li>
                                using the Service for unlawful purposes; or
                            </li>
                            <li>
                                attempting to circumvent security,
                                authentication or usage restrictions.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            10. Intellectual Property
                        </h2>

                        <p className="mt-3">
                            Unless otherwise stated, the StockJump name,
                            branding, software, interface, original
                            illustrations, designs, compilations, scoring
                            methodologies and other original materials
                            provided by StockJump are owned by or licensed to
                            StockJump and are protected by applicable
                            intellectual property laws.
                        </p>

                        <p className="mt-3">
                            These Terms do not transfer ownership of StockJump
                            intellectual property to you.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            11. Third-Party Information and Services
                        </h2>

                        <p className="mt-3">
                            StockJump may contain links to or information
                            obtained from third-party websites, data providers,
                            exchanges, companies and other services.
                        </p>

                        <p className="mt-3">
                            StockJump does not control third-party websites or
                            services and is not responsible for their
                            availability, accuracy, content, policies or
                            practices.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            12. Availability of the Service
                        </h2>

                        <p className="mt-3">
                            We may modify, suspend or discontinue any part of
                            the Service at any time, including features,
                            datasets, analytical tools or notifications.
                        </p>

                        <p className="mt-3">
                            We do not guarantee that the Service will always be
                            available, uninterrupted, secure or error-free.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            13. Limitation of Liability
                        </h2>

                        <p className="mt-3">
                            To the maximum extent permitted by applicable law,
                            StockJump and its owners, operators, employees,
                            contractors and service providers shall not be
                            liable for losses or damages arising from reliance
                            on information, analysis, scores, rankings,
                            financial data, AI-generated content or other
                            materials provided through the Service.
                        </p>

                        <p className="mt-3">
                            This includes, to the extent permitted by law,
                            investment losses, loss of profits, loss of
                            opportunity, business interruption, data loss and
                            indirect or consequential losses.
                        </p>

                        <p className="mt-3">
                            Nothing in these Terms excludes or limits liability
                            that cannot legally be excluded or limited under
                            applicable law.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            14. Indemnification
                        </h2>

                        <p className="mt-3">
                            To the extent permitted by applicable law, you
                            agree to indemnify and hold harmless StockJump and
                            its owners, operators, employees and service
                            providers from claims, liabilities, losses,
                            damages and expenses arising from your misuse of
                            the Service, violation of these Terms or violation
                            of applicable law or third-party rights.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            15. Privacy
                        </h2>

                        <p className="mt-3">
                            Your use of StockJump is also governed by our
                            Privacy Policy, which explains how we collect, use
                            and protect personal information.
                        </p>

                        <p className="mt-3">
                            <Link
                                href={appConfig.links.privacy}
                                className="font-medium text-[#00d084] hover:underline"
                            >
                                Read our Privacy Policy
                            </Link>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            16. Changes to These Terms
                        </h2>

                        <p className="mt-3">
                            We may update these Terms from time to time. The
                            updated version will be posted on this page with a
                            revised "Last updated" date.
                        </p>

                        <p className="mt-3">
                            Your continued use of StockJump after changes to
                            these Terms become effective constitutes acceptance
                            of the revised Terms, to the extent permitted by
                            applicable law.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            17. Governing Law
                        </h2>

                        <p className="mt-3">
                            These Terms shall be governed by and interpreted in
                            accordance with the laws of India, subject to
                            applicable law.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            18. Contact
                        </h2>

                        <p className="mt-3">
                            If you have questions regarding these Terms,
                            please contact StockJump through the official
                            contact details provided on the Service.
                        </p>
                    </section>

                    {/* Final notice */}
                    <section className="border-t border-white/[0.06] pt-8">
                        <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-5">
                            <p className="text-xs leading-6 text-slate-400">
                                <strong className="text-slate-300">
                                    Important:
                                </strong>{" "}
                                StockJump is an information and analytical
                                platform. Nothing on the Service should be
                                interpreted as a guarantee of returns or as
                                personalized investment advice. Users should
                                independently verify information and consider
                                their own circumstances before making financial
                                decisions.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}