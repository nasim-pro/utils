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
         * Backend used by StockJump.
         *
         * Deployed builds use the Lambda URL below. For local testing, create
         * `.env.local` and set:
         *
         *   NEXT_PUBLIC_STOCKJUMP_API_URL=http://localhost:2026
         *
         * then restart `npm run dev`.
         */
        baseUrl:
            process.env.NEXT_PUBLIC_STOCKJUMP_API_URL?.trim() ||
            "https://gwjjlwmzsi6jzvalhbssaqhfju0pofzk.lambda-url.ap-south-1.on.aws",
    },
};