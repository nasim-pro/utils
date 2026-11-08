import Link from "next/link";

const apps = [
    {
        name: "StockJump",
        tagline: "Understand Indian stocks before the market moves.",
        description:
            "Quarterly earnings, financial comparisons, strong movers and AI-powered explanations in one place.",
        href: "/apps/stockjump",
        icon: "📈",
        accent: "from-emerald-400 to-green-600",
        tags: ["Earnings", "AI analysis", "Market data"],
    },
    {
        name: "DoneLog",
        tagline: "Track your completed work effortlessly.",
        description:
            "A focused Chrome extension for logging finished tasks and optionally syncing them to Google Sheets.",
        href: "/apps/done-log",
        icon: "✅",
        accent: "from-slate-700 to-slate-950",
        tags: ["Chrome extension", "Productivity", "Google Sheets"],
    },
];

const utilities = [
    {
        title: "Capture Photo",
        description: "Take photos with your device camera.",
        href: "/capture-photo",
        icon: "📷",
    },
    {
        title: "Lossless Compression",
        description: "Shrink images without visible quality loss.",
        href: "/lossless-compression",
        icon: "🗜️",
    },
    {
        title: "Lossy Compression",
        description: "Reduce image size with adjustable quality.",
        href: "/lossy-compression",
        icon: "📉",
    },
    {
        title: "Metadata Viewer",
        description: "Inspect EXIF metadata from any image.",
        href: "/metadata-viewer",
        icon: "🔍",
    },
    {
        title: "Crop Image",
        description: "Crop and download images in the browser.",
        href: "/crop-image",
        icon: "✂️",
    },
];

export default function HomePage() {
    return (
        <div className="mx-auto max-w-7xl px-6 py-14 sm:py-20">
            <section className="relative overflow-hidden rounded-[36px] border border-slate-200 bg-white px-7 py-14 shadow-sm sm:px-14 sm:py-20">
                <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sky-100 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-emerald-100 blur-3xl" />

                <div className="relative max-w-3xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Apps &amp; utilities
                    </div>

                    <h1 className="mt-7 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
                        Small apps.
                        <br />
                        Sharp utilities.
                    </h1>

                    <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                        A growing collection of products and browser tools.
                        Explore the hosted apps or jump straight into a utility
                        that gets the job done.
                    </p>

                    <div className="mt-9 flex flex-wrap gap-3">
                        <Link
                            href="#apps"
                            className="rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                        >
                            Explore apps
                        </Link>

                        <Link
                            href="#utilities"
                            className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            Browse utilities
                        </Link>
                    </div>
                </div>
            </section>

            <section id="apps" className="mt-20 scroll-mt-24">
                <div className="max-w-2xl">
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-600">
                        Apps
                    </p>
                    <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                        Hosted applications
                    </h2>
                    <p className="mt-3 text-lg leading-8 text-slate-600">
                        Full products with their own pages, accounts and
                        workflows.
                    </p>
                </div>

                <div className="mt-8 grid gap-5 md:grid-cols-2">
                    {apps.map((app) => (
                        <Link
                            key={app.href}
                            href={app.href}
                            className="group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div
                                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${app.accent} text-2xl shadow-inner`}
                                >
                                    {app.icon}
                                </div>

                                <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500">
                                    App
                                </span>
                            </div>

                            <h3 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-900">
                                {app.name}
                            </h3>

                            <p className="mt-1 font-medium text-slate-600">
                                {app.tagline}
                            </p>

                            <p className="mt-3 text-sm leading-7 text-slate-500">
                                {app.description}
                            </p>

                            <div className="mt-5 flex flex-wrap gap-2">
                                {app.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-slate-900">
                                Open {app.name}
                                <span className="transition group-hover:translate-x-1">
                                    →
                                </span>
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            <section id="utilities" className="mt-20 scroll-mt-24">
                <div className="max-w-2xl">
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-600">
                        Utilities
                    </p>
                    <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                        Browser tools &amp; helpers
                    </h2>
                    <p className="mt-3 text-lg leading-8 text-slate-600">
                        Focused tools that run locally in your browser, plus a
                        small harness for testing the APIs.
                    </p>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {utilities.map((tool) => (
                        <Link
                            key={tool.href}
                            href={tool.href}
                            className="group rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl">
                                    {tool.icon}
                                </div>

                                <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-500">
                                    →
                                </span>
                            </div>

                            <h3 className="mt-4 font-bold text-slate-900">
                                {tool.title}
                            </h3>

                            <p className="mt-1 text-sm leading-6 text-slate-500">
                                {tool.description}
                            </p>
                        </Link>
                    ))}
                </div>
            </section>

            <footer className="mt-20 border-t border-slate-200 py-8 text-center text-sm text-slate-500">
                Built and maintained by GrowUpNow.
            </footer>
        </div>
    );
}
