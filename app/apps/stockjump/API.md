# StockJump API integration

The dashboard talks to the StockJump backend through the typed client in
[`dashboard/lib/api.ts`](./dashboard/lib/api.ts). Auth storage lives in
[`dashboard/lib/session.ts`](./dashboard/lib/session.ts).

The canonical TypeScript response types are exported from `lib/api.ts`
(`ResultRecord`, `AnalysisRecord`, `MoverItem`, `StockDetailData`, ...). Keep
those in sync with the backend reference below instead of re-declaring response
shapes inside components.

## Base URL

The base URL is configured once in [`config.ts`](./config.ts):

```ts
baseUrl:
    process.env.NEXT_PUBLIC_STOCKJUMP_API_URL?.trim() ||
    "https://gwjjlwmzsi6jzvalhbssaqhfju0pofzk.lambda-url.ap-south-1.on.aws"
```

Set `NEXT_PUBLIC_STOCKJUMP_API_URL` to point at a local backend when needed:

```bash
NEXT_PUBLIC_STOCKJUMP_API_URL=http://localhost:2026 npm run dev
```

For a persistent local setup, put the same line in `.env.local` (gitignored) and
restart `npm run dev`. Fresh production builds fall back to the Lambda URL.

## Endpoints used by the UI

| Method | Path | Used by |
| --- | --- | --- |
| GET | `/health` | API smoke test (not rendered) |
| POST | `/api/auth/register` | Sign-up page |
| POST | `/api/auth/login` | Login page |
| GET | `/api/recent/quarterly` | Recent Earnings + All Stocks tabs |
| GET | `/api/stocks/strong-movers` | Strong Movers tab |
| GET | `/api/stocks/:symbol` | Stock detail header/latest result |
| GET | `/api/stocks/:symbol/quarterly` | Stock detail financials/growth |
| GET | `/api/stocks/:symbol/yearly` | Stock detail yearly tables |
| GET | `/api/stocks/:symbol/analysis` | Stock detail AI Insights |

Data routes are currently public. When auth is enabled on the backend, the
client already sends `Authorization: Bearer <token>` from local storage.

## Query conventions

`consolidated` is a string, not a boolean:

| Value | Meaning |
| --- | --- |
| `preferred` | Consolidated when available, otherwise standalone |
| `all` / `any` / `both` | Both bases |
| `true` / `1` / `yes` | Consolidated only |
| `false` / `0` / `no` | Standalone only |

- `/api/stocks/:symbol` accepts `preferred`, `true`, `false` (not `all`).
- `/api/stocks/:symbol/quarterly`, `/yearly`, `/analysis` accept `all`, `true`,
  `false` (not `preferred`).

Pagination uses `?page=1&limit=20`; `recent`, `strong-movers`, `quarterly` and
`analysis` defaults to 20 (max 100), `yearly` defaults to 10 (max 50).

## Response envelopes

List endpoints return:

```json
{
  "success": true,
  "page": 1,
  "limit": 20,
  "count": 2,
  "total": 18,
  "hasMore": true,
  "data": []
}
```

History endpoints return `{ success, symbol, count, filters, data }` without
`total`/`hasMore`. Errors use:

```json
{ "success": false, "message": "..." }
```

Unknown routes return Express's HTML 404 page, so the client always parses the
body defensively before using it.

## Units

Raw `revenue`, `operatingProfit`, `profitBeforeTax` and `netProfit` values may
be reported in Lakhs or Crores. Always render `metricsInCrores`:

```json
{
  "metricsInCrores": {
    "revenue": 5812.07,
    "operatingProfit": 142.81,
    "profitBeforeTax": 169.27,
    "netProfit": 159.1,
    "eps": 4.85
  }
}
```

`eps` is not scaled. Records without unit metadata are assumed to already be in
Crores by the backend; the UI marks those rows with an asterisk and shows a
legacy-unit warning.

## Important UI rules

1. `year` is the financial-year label, not the calendar year. Q2 ending Sep
   2026 is `year: 2027`.
2. `quarter` is `"Q1" | "Q2" | "Q3" | "Q4"`.
3. Growth is computed from normalized Crores values. `strong-movers` can return
   extreme growth when the previous value is near zero; `formatGrowth` clamps
   the display at 9,999.9%+.
4. In `preferred` mode, `recent` returns one row per symbol + year + quarter.
   With `all`, the same symbol can appear twice (standalone + consolidated).
5. `pe`, `pb`, `marketCap`, `currentPrice` and `promoterHolding` are frequently
   `null` for recent filings.
6. The recent feed defaults to the last day; pass `days=90` (or `from`/`to`) to
   widen it.
7. The API has no symbol search/autocomplete endpoint. Search on the dashboard
   filters the currently loaded page locally.
8. CORS is enforced by the deployed Lambda URL. Allowed origins currently
   include the production site and `http://localhost:3000`; adjust the Function
   URL CORS settings if you use another local port.
