"use client";

import Link from "next/link";
import { appConfig } from "../config";

export default function PrivacyPolicy() {
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
                {/* Title */}
                <div className="mb-10">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#00d084]">
                        Legal
                    </p>

                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Privacy Policy
                    </h1>

                    <p className="mt-3 text-sm text-slate-500">
                        Last updated: August 31, 2026
                    </p>
                </div>

                <div className="space-y-10 text-sm leading-7">
                    {/* 1 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            1. Introduction
                        </h2>

                        <p className="mt-3">
                            This Privacy Policy explains how StockJump
                            ("StockJump", "we", "us" or "our") collects,
                            uses, stores and protects information when you
                            access or use the StockJump website, application,
                            account, dashboard and related services
                            (collectively, the "Service").
                        </p>

                        <p className="mt-3">
                            We respect your privacy and aim to collect only
                            information that is reasonably necessary to provide,
                            maintain and improve the Service.
                        </p>

                        <p className="mt-3">
                            By using StockJump, you acknowledge the practices
                            described in this Privacy Policy.
                        </p>
                    </section>

                    {/* 2 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            2. Information We Collect
                        </h2>

                        <p className="mt-3">
                            Depending on how you use StockJump, we may collect
                            the following categories of information.
                        </p>

                        <h3 className="mt-6 font-semibold text-slate-200">
                            Account information
                        </h3>

                        <p className="mt-2">
                            When you create an account, we may collect
                            information such as:
                        </p>

                        <ul className="mt-3 list-disc space-y-2 pl-6">
                            <li>Your name</li>
                            <li>Your email address</li>
                            <li>Your account credentials</li>
                        </ul>

                        <h3 className="mt-6 font-semibold text-slate-200">
                            Usage information
                        </h3>

                        <p className="mt-2">
                            We may collect information about how you interact
                            with the Service, such as pages or features
                            accessed, searches performed, preferences and
                            interactions with the application.
                        </p>

                        <h3 className="mt-6 font-semibold text-slate-200">
                            Technical information
                        </h3>

                        <p className="mt-2">
                            When you access StockJump, certain technical
                            information may be automatically provided by your
                            browser or device, such as IP address, browser
                            type, operating system, device information and
                            general connection information.
                        </p>
                    </section>

                    {/* 3 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            3. Information We Do Not Need
                        </h2>

                        <p className="mt-3">
                            StockJump does not require you to provide sensitive
                            financial information such as your bank account
                            number, debit or credit card PIN, brokerage account
                            password or trading credentials in order to use the
                            core Service.
                        </p>

                        <p className="mt-3">
                            You should never provide brokerage passwords,
                            banking passwords, OTPs or other confidential
                            authentication information to StockJump.
                        </p>
                    </section>

                    {/* 4 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            4. How We Use Information
                        </h2>

                        <p className="mt-3">
                            We may use collected information for purposes
                            including:
                        </p>

                        <ul className="mt-3 list-disc space-y-2 pl-6">
                            <li>
                                creating and managing your StockJump account;
                            </li>

                            <li>
                                providing access to StockJump features and
                                services;
                            </li>

                            <li>
                                authenticating users and maintaining account
                                security;
                            </li>

                            <li>
                                responding to support requests and
                                communications;
                            </li>

                            <li>
                                understanding how users interact with the
                                Service;
                            </li>

                            <li>
                                detecting, preventing and investigating fraud,
                                abuse and security incidents;
                            </li>

                            <li>
                                maintaining and improving the performance,
                                reliability and functionality of the Service;
                            </li>

                            <li>
                                developing new features and products; and
                            </li>

                            <li>
                                complying with applicable legal obligations.
                            </li>
                        </ul>
                    </section>

                    {/* 5 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            5. Financial and Stock-Related Searches
                        </h2>

                        <p className="mt-3">
                            StockJump provides financial research and stock
                            analysis tools. Searches or interactions with
                            financial information may be processed to provide
                            the requested features and improve the Service.
                        </p>

                        <p className="mt-3">
                            StockJump does not require access to your brokerage
                            account or trading account to provide its core
                            financial research features.
                        </p>
                    </section>

                    {/* 6 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            6. Cookies and Similar Technologies
                        </h2>

                        <p className="mt-3">
                            StockJump may use cookies, local storage and
                            similar technologies that are necessary to operate
                            the Service.
                        </p>

                        <p className="mt-3">
                            These technologies may be used to maintain
                            authentication sessions, remember preferences,
                            improve security and provide functionality
                            requested by users.
                        </p>

                        <p className="mt-3">
                            Your browser or device may allow you to control or
                            restrict certain cookies and storage technologies.
                            Some functionality may not work correctly if
                            required technologies are disabled.
                        </p>
                    </section>

                    {/* 7 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            7. Local Storage
                        </h2>

                        <p className="mt-3">
                            StockJump may use browser local storage or similar
                            client-side storage mechanisms to maintain certain
                            application state, preferences or authentication
                            information.
                        </p>

                        <p className="mt-3">
                            Information stored locally in your browser is
                            controlled by your browser and device. You can
                            generally clear this information through your
                            browser settings.
                        </p>
                    </section>

                    {/* 8 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            8. How We Share Information
                        </h2>

                        <p className="mt-3">
                            We do not sell your personal information as a
                            product.
                        </p>

                        <p className="mt-3">
                            We may share limited information with service
                            providers that help us operate StockJump, such as
                            hosting, database, authentication, infrastructure,
                            email, security or other technology providers.
                        </p>

                        <p className="mt-3">
                            Such providers may process information only as
                            necessary to provide services to us and subject to
                            appropriate contractual or legal obligations where
                            applicable.
                        </p>

                        <p className="mt-3">
                            We may also disclose information when reasonably
                            necessary to comply with applicable law, legal
                            process, court orders, regulatory requirements or
                            to protect the rights, safety and security of
                            StockJump, our users or others.
                        </p>
                    </section>

                    {/* 9 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            9. Data Security
                        </h2>

                        <p className="mt-3">
                            We use reasonable technical and organizational
                            measures designed to protect information against
                            unauthorized access, loss, misuse, alteration or
                            disclosure.
                        </p>

                        <p className="mt-3">
                            However, no internet transmission, computer system
                            or storage method can be guaranteed to be
                            completely secure. Accordingly, we cannot guarantee
                            absolute security of your information.
                        </p>
                    </section>

                    {/* 10 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            10. Passwords and Account Security
                        </h2>

                        <p className="mt-3">
                            You are responsible for maintaining the
                            confidentiality of your account credentials.
                        </p>

                        <p className="mt-3">
                            You should use a strong password and should not
                            share your password with other people.
                        </p>

                        <p className="mt-3">
                            If you believe that your account has been accessed
                            without authorization, you should contact us as
                            soon as reasonably possible.
                        </p>
                    </section>

                    {/* 11 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            11. Data Retention
                        </h2>

                        <p className="mt-3">
                            We retain personal information for as long as
                            reasonably necessary to provide the Service,
                            maintain your account, comply with legal
                            obligations, resolve disputes, enforce agreements
                            and protect our legitimate interests.
                        </p>

                        <p className="mt-3">
                            When personal information is no longer reasonably
                            required for these purposes, we may delete or
                            anonymize it, subject to applicable law.
                        </p>
                    </section>

                    {/* 12 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            12. Account Deletion
                        </h2>

                        <p className="mt-3">
                            You may request deletion of your StockJump account
                            and associated personal information by contacting
                            us through the contact details provided by the
                            Service.
                        </p>

                        <p className="mt-3">
                            Certain information may need to be retained where
                            required by law, necessary to resolve disputes,
                            prevent fraud or abuse, enforce agreements or
                            otherwise permitted by applicable law.
                        </p>
                    </section>

                    {/* 13 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            13. Third-Party Services
                        </h2>

                        <p className="mt-3">
                            StockJump may use third-party services to operate
                            infrastructure, authentication, analytics,
                            communications, security, payments or other
                            functionality.
                        </p>

                        <p className="mt-3">
                            Those third parties may process information
                            according to their own privacy policies and terms.
                            We encourage you to review the privacy policies of
                            third-party services where appropriate.
                        </p>
                    </section>

                    {/* 14 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            14. Financial Data and Third-Party Sources
                        </h2>

                        <p className="mt-3">
                            StockJump may display information obtained from
                            publicly available sources, companies, stock
                            exchanges, financial data providers and other
                            third parties.
                        </p>

                        <p className="mt-3">
                            Such information may contain errors, omissions,
                            delays or subsequent revisions.
                        </p>

                        <p className="mt-3">
                            StockJump's handling of financial and market data
                            does not change the way personal information is
                            handled under this Privacy Policy.
                        </p>
                    </section>

                    {/* 15 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            15. Children's Privacy
                        </h2>

                        <p className="mt-3">
                            StockJump is not intended to be used by children
                            who are not legally permitted to use the Service.
                        </p>

                        <p className="mt-3">
                            We do not knowingly collect personal information
                            from children in violation of applicable law.
                            If you believe that a child has provided personal
                            information to us, please contact us so that we can
                            take appropriate action.
                        </p>
                    </section>

                    {/* 16 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            16. International Users
                        </h2>

                        <p className="mt-3">
                            StockJump may be accessed from locations outside
                            India. Depending on where you are located,
                            information may be processed or stored in India or
                            other countries where StockJump or its service
                            providers operate.
                        </p>

                        <p className="mt-3">
                            By using the Service, you acknowledge that
                            information may be processed across jurisdictions,
                            subject to applicable legal requirements.
                        </p>
                    </section>

                    {/* 17 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            17. Your Privacy Choices and Rights
                        </h2>

                        <p className="mt-3">
                            Depending on applicable law, you may have rights
                            relating to your personal information, including
                            rights to request access, correction, deletion or
                            other forms of control over your information.
                        </p>

                        <p className="mt-3">
                            To make a privacy-related request, contact
                            StockJump using the official contact information
                            provided through the Service.
                        </p>
                    </section>

                    {/* 18 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            18. Changes to This Privacy Policy
                        </h2>

                        <p className="mt-3">
                            We may update this Privacy Policy from time to
                            time to reflect changes to the Service, technology,
                            legal requirements or our privacy practices.
                        </p>

                        <p className="mt-3">
                            When we make changes, we will update the "Last
                            updated" date shown at the beginning of this
                            policy.
                        </p>

                        <p className="mt-3">
                            Your continued use of StockJump after an updated
                            Privacy Policy becomes effective constitutes
                            acknowledgement of the updated policy, to the
                            extent permitted by applicable law.
                        </p>
                    </section>

                    {/* 19 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            19. Contact Us
                        </h2>

                        <p className="mt-3">
                            If you have questions, concerns or requests
                            regarding this Privacy Policy or the handling of
                            your personal information, please contact
                            StockJump through the official contact details
                            provided on the Service.
                        </p>
                    </section>

                    {/* Final notice */}
                    <section className="border-t border-white/[0.06] pt-8">
                        <div className="rounded-xl border border-[#00d084]/20 bg-[#00d084]/[0.04] p-5">
                            <p className="text-xs leading-6 text-slate-400">
                                <strong className="text-slate-300">
                                    Privacy at StockJump:
                                </strong>{" "}
                                We aim to collect and use personal information
                                only where reasonably necessary to provide and
                                improve the Service, maintain security, and
                                comply with applicable obligations.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}