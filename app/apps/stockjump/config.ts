export const appConfig = {
    name: "StockJump",

    tagline: "Understand Indian stocks before the market moves.",

    description:
        "StockJump brings company results, financial data, market analytics, and AI-powered insights together in one simple place.",

    links: {
        home: "/apps/stockjump",
        login: "/apps/stockjump",
        signup: "/apps/stockjump/signup",
        dashboard: "/apps/stockjump/dashboard",
        privacy: "/apps/stockjump/privacy-policy",
        terms: "/apps/stockjump/terms",
    },

    api: {
        /**
         * Defaults to the deployed API. Point this at a local/other backend by
         * setting NEXT_PUBLIC_STOCKJUMP_API_URL (for example
         * http://localhost:2026) before `npm run dev` / `npm run build`.
         */
        baseUrl:
            process.env.NEXT_PUBLIC_STOCKJUMP_API_URL?.trim() ||
            "https://gwjjlwmzsi6jzvalhbssaqhfju0pofzk.lambda-url.ap-south-1.on.aws",
    },
};