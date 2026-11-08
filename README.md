# GrowUpNow — Apps & Utilities

A static Next.js site that hosts small apps and browser utilities under one
domain.

## Pages

| Path | What it is |
| --- | --- |
| `/` | Landing page listing every hosted app and utility |
| `/apps/stockjump` | StockJump — Indian earnings and financial analysis |
| `/apps/done-log` | DoneLog — completed-task tracker / Chrome extension |
| `/tools` | Image utilities |
| `/capture-photo` | Capture a photo from the device camera |
| `/crop-image` | Crop and download an image |
| `/lossless-compression` | Compress images without visible quality loss |
| `/lossy-compression` | Compress images with configurable quality |
| `/metadata-viewer` | Inspect image EXIF metadata |

## Local development

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Testing StockJump against a local API

The base URL lives in
[`app/apps/stockjump/config.ts`](./app/apps/stockjump/config.ts). It reads:

```ts
process.env.NEXT_PUBLIC_STOCKJUMP_API_URL?.trim() ||
    "https://gwjjlwmzsi6jzvalhbssaqhfju0pofzk.lambda-url.ap-south-1.on.aws"
```

So the deployed site uses the Lambda URL by default. To point local development
at your local backend, create `.env.local` (it is gitignored) with:

```bash
NEXT_PUBLIC_STOCKJUMP_API_URL=http://localhost:2026
```

Then run:

```bash
npm run dev
```

Restart the dev server after changing the env file. You can copy
[`.env.example`](./.env.example) as a starting point. Nothing changes in the
build/deploy setup, so pushing still produces a site that uses the Lambda URL.

## Build

```bash
npm run build
```

The site uses `output: "export"` and deploys the generated `out/` directory to
GitHub Pages.
