/**
 * Typed client for the StockJump backend.
 *
 * The dashboard must keep working against the currently deployed API build,
 * which may not expose `consolidated`, `metricsInCrores`, `dataQuality` or the
 * `/analysis` endpoint yet. Every response is therefore normalized here:
 * missing fields get safe fallbacks instead of crashing the UI.
 */

import { appConfig } from "../../config";
import {
    calculateGrowth,
    round,
    sortNewestFirst,
    toNumber,
} from "./format";
import {
    getStoredToken,
    type AuthSession,
    type AuthUser,
} from "./session";

export type BasisParam = "preferred" | "all" | "true" | "false";

export type MetricKey =
    | "revenue"
    | "operatingProfit"
    | "profitBeforeTax"
    | "netProfit"
    | "eps";

export interface MetricValues {
    revenue?: number | null;
    operatingProfit?: number | null;
    profitBeforeTax?: number | null;
    netProfit?: number | null;
    eps?: number | null;
    [key: string]: number | null | undefined;
}

export type MetricsSource = "api" | "unit" | "legacy";

export interface DataQuality {
    unit?: string | null;
    unitScale?: number | null;
    currency?: string | null;
    isFinancial?: boolean | null;
    operatingProfitNotApplicable?: boolean;
    missingMetrics?: string[];
    revenueSource?: string | null;
    operatingProfitSource?: string | null;
    warnings?: string[];
    [key: string]: unknown;
}

export interface ResultRecord {
    _id?: string;
    symbol: string;
    stockName?: string | null;
    year?: number;
    quarter?: string;

    consolidated?: boolean;
    reportType?: string;
    isFinancial?: boolean | null;

    quarterEndDate?: string | null;
    broadcastDate?: string | null;
    financialYearEndDate?: string | null;

    currency?: string | null;
    unit?: string | null;
    amountUnit?: string | null;
    unitScale?: number | null;
    marketCapUnit?: string | null;
    debtUnit?: string | null;
    promoterHoldingUnit?: string | null;

    debt?: number | null;
    promoterHolding?: number | null;
    pe?: number | null;
    pb?: number | null;
    marketCap?: number | null;
    currentPrice?: number | null;
    bookValue?: number | null;
    ISIN?: string | null;

    revenue?: number | null;
    operatingProfit?: number | null;
    profitBeforeTax?: number | null;
    netProfit?: number | null;
    eps?: number | null;

    revenueLabel?: string | null;
    revenueSource?: string | null;
    operatingProfitLabel?: string | null;
    operatingProfitSource?: string | null;
    dataQuality?: DataQuality | null;

    sourceUrl?: string | null;
    parserVersion?: string | null;
    nseFilingId?: string | null;

    aiSummary?: string | null;
    aiInsight?: string | null;
    aiAnalysis?: string | null;
    aiSentiment?: string | null;
    aiModel?: string | null;
    aiPromptVersion?: string | null;
    aiUpdatedAt?: string | null;

    hasAiAnalysis?: boolean;
    metricsInCrores?: MetricValues;
    metricsSource?: MetricsSource;
    /** True when the record has no unit metadata and units were inferred. */
    legacyUnits?: boolean;

    createdAt?: string | null;
    updatedAt?: string | null;
}

export interface AnalysisRecord {
    _id?: string;
    symbol?: string;
    year?: number;
    quarter?: string;
    consolidated?: boolean;
    reportType?: string;
    sourceResultId?: string;

    insight?: string | null;
    analysis?: string | null;
    sentiment?: "bullish" | "neutral" | "bearish" | string | null;
    aiModel?: string | null;
    promptVersion?: string | null;
    status?: "queued" | "pending" | "completed" | "failed" | string;
    attempts?: number;
    error?: string | null;

    createdAt?: string | null;
    updatedAt?: string | null;
}

export interface ComparisonQuality {
    normalizedUnit?: string;
    previousAvailable?: boolean;
    currentUnitAvailable?: boolean;
    previousUnitAvailable?: boolean;
    note?: string;
}

export interface MoverItem {
    symbol: string;
    stockName?: string | null;
    quarter?: string | null;
    year?: number | null;

    consolidated?: boolean;
    reportType?: string;
    basis?: string;
    isFinancial?: boolean | null;

    current: MetricValues;
    previous: MetricValues;
    growth: MetricValues;

    normalized?: {
        unit?: string;
        current?: MetricValues;
        previous?: MetricValues;
    };

    comparisonQuality?: ComparisonQuality | null;

    selectedMetric?: string;
    selectedGrowth?: number | null;

    currentPrice?: number | null;
    marketCap?: number | null;
    pe?: number | null;
    pb?: number | null;
    promoterHolding?: number | null;

    metadata?: Record<string, unknown> | null;
    legacyUnits?: boolean;
}

export interface RecentResponse {
    success: boolean;
    page: number;
    limit: number;
    count: number;
    total: number;
    hasMore: boolean;
    filters?: Record<string, unknown>;
    data: ResultRecord[];
}

export interface MoversResponse {
    success: boolean;
    page: number;
    limit: number;
    count: number;
    total: number;
    hasMore: boolean;
    filters?: Record<string, unknown>;
    comparisonQuarter?: {
        year?: number;
        quarter?: string;
    };
    data: MoverItem[];
}

export interface StockDetailData {
    symbol: string;
    stockName?: string | null;
    latestQuarter: ResultRecord | null;
    latestYear: ResultRecord | null;
    quarterly: {
        consolidated: ResultRecord | null;
        standalone: ResultRecord | null;
    };
    yearly: {
        consolidated: ResultRecord | null;
        standalone: ResultRecord | null;
    };
    analysis: AnalysisRecord | null;
    analyses: {
        consolidated: AnalysisRecord | null;
        standalone: AnalysisRecord | null;
    };
    available: {
        consolidated: boolean;
        standalone: boolean;
    };
}

export interface HistoryResponse {
    success: boolean;
    symbol?: string;
    count: number;
    filters?: Record<string, unknown>;
    data: ResultRecord[];
}

export interface AnalysisResponse {
    success: boolean;
    symbol?: string;
    count: number;
    filters?: Record<string, unknown>;
    data: AnalysisRecord[];
    supported: boolean;
}

export class ApiError extends Error {
    status?: number;

    constructor(message: string, status?: number) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

interface AuthResponse {
    success: boolean;
    token?: string;
    user?: AuthUser;
    data?: {
        user?: AuthUser;
        token?: string;
    };
}

export interface HealthResponse {
    success: boolean;
    status: "ok" | "error";
}

/** GET /health – also checks the database connection on the server. */
export async function fetchHealth(): Promise<HealthResponse> {
    return apiRequest<HealthResponse>("/health", {
        timeoutMs: 8_000,
    });
}

export interface LoginParams {
    email: string;
    password: string;
}

export interface RegisterParams extends LoginParams {
    name: string;
}

function toAuthSession(response: AuthResponse): AuthSession {
    const user = response.data?.user ?? response.user;
    const token = response.data?.token ?? response.token;

    if (
        !user ||
        !token ||
        typeof user.id !== "string" ||
        typeof user.name !== "string" ||
        typeof user.email !== "string"
    ) {
        throw new ApiError(
            "The API returned an invalid authentication response"
        );
    }

    return { user, token };
}

/** POST /api/auth/login */
export async function loginUser(
    params: LoginParams
): Promise<AuthSession> {
    const response = await apiRequest<AuthResponse>(
        "/api/auth/login",
        {
            init: {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: params.email.trim(),
                    password: params.password,
                }),
            },
        }
    );

    return toAuthSession(response);
}

/** POST /api/auth/register */
export async function registerUser(
    params: RegisterParams
): Promise<AuthSession> {
    const response = await apiRequest<AuthResponse>(
        "/api/auth/register",
        {
            init: {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: params.name.trim(),
                    email: params.email.trim(),
                    password: params.password,
                }),
            },
        }
    );

    return toAuthSession(response);
}

interface RequestOptions {
    query?: Record<string, unknown>;
    init?: RequestInit;
    timeoutMs?: number;
}

function buildQuery(
    query?: Record<string, unknown>
): string {
    if (!query) {
        return "";
    }

    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(query)) {
        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {
            continue;
        }

        if (typeof value === "boolean") {
            params.set(key, value ? "true" : "false");
            continue;
        }

        params.set(key, String(value));
    }

    const serialized = params.toString();
    return serialized ? `?${serialized}` : "";
}

async function apiRequest<T>(
    path: string,
    options: RequestOptions = {}
): Promise<T> {
    const baseUrl = appConfig.api.baseUrl.replace(
        /\/+$/,
        ""
    );
    const url = `${baseUrl}${path}${buildQuery(options.query)}`;

    const controller = new AbortController();
    const timeout = setTimeout(
        () => controller.abort(),
        options.timeoutMs ?? 20_000
    );

    const headers = new Headers(options.init?.headers);
    headers.set("Accept", "application/json");

    const token = getStoredToken();

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    try {
        const response = await fetch(url, {
            ...options.init,
            headers,
            signal: controller.signal,
        });

        const text = await response.text();

        let body: unknown = null;

        if (text) {
            try {
                body = JSON.parse(text);
            } catch {
                body = null;
            }
        }

        const message =
            body &&
                typeof body === "object" &&
                "message" in body &&
                typeof body.message === "string"
                ? body.message
                : undefined;

        if (!response.ok) {
            throw new ApiError(
                message ??
                `Request failed (${response.status})`,
                response.status
            );
        }

        if (
            body &&
            typeof body === "object" &&
            "success" in body &&
            body.success === false
        ) {
            throw new ApiError(
                message ?? "The API returned an error",
                response.status
            );
        }

        return body as T;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        if (
            error instanceof Error &&
            error.name === "AbortError"
        ) {
            throw new ApiError(
                "The API request timed out. Please try again."
            );
        }

        if (error instanceof TypeError) {
            throw new ApiError(
                `Unable to reach the StockJump API at ${baseUrl}. If you are testing locally, make sure the backend is running and allows requests from ${
                    typeof window !== "undefined"
                        ? window.location.origin
                        : "this origin"
                } (CORS).`
            );
        }

        throw new ApiError(
            error instanceof Error
                ? error.message
                : "Unable to reach the StockJump API"
        );
    } finally {
        clearTimeout(timeout);
    }
}

function inferUnitScale(
    record: Pick<ResultRecord, "unitScale" | "unit" | "amountUnit">
): number | null {
    const explicit = toNumber(record.unitScale);

    if (explicit !== null && explicit > 0) {
        return explicit;
    }

    const label = `${record.unit ?? ""} ${
        record.amountUnit ?? ""
    }`.toLowerCase();

    if (label.includes("lakh")) {
        return 1e5;
    }

    if (label.includes("crore")) {
        return 1e7;
    }

    if (label.includes("thousand")) {
        return 1e3;
    }

    if (label.includes("million")) {
        return 1e6;
    }

    return null;
}

function normalizedMetrics(
    record: ResultRecord
): {
    metrics: Required<MetricValues>;
    source: MetricsSource;
} {
    const provided = record.metricsInCrores;
    const scale = inferUnitScale(record);

    const convert = (
        field: Exclude<MetricKey, "eps">
    ): { value: number | null; source: MetricsSource } => {
        const fromApi = toNumber(provided?.[field]);

        if (fromApi !== null) {
            return { value: fromApi, source: "api" };
        }

        const raw = toNumber(record[field]);

        if (raw === null) {
            return { value: null, source: "legacy" };
        }

        if (scale !== null) {
            return {
                value: round((raw * scale) / 1e7),
                source: "unit",
            };
        }

        // Legacy scraper records have no unit metadata. The backend treats
        // them as already being in Crores, so mirror that behaviour here.
        return { value: round(raw), source: "legacy" };
    };

    const revenue = convert("revenue");
    const operatingProfit = convert("operatingProfit");
    const profitBeforeTax = convert("profitBeforeTax");
    const netProfit = convert("netProfit");

    const epsFromApi = toNumber(provided?.eps);
    const eps =
        epsFromApi !== null
            ? epsFromApi
            : toNumber(record.eps);

    const entries = [
        revenue,
        operatingProfit,
        profitBeforeTax,
        netProfit,
    ];
    const sources = entries
        .filter((entry) => entry.value !== null)
        .map((entry) => entry.source);

    const source: MetricsSource = provided
        ? "api"
        : sources.includes("legacy")
            ? "legacy"
            : sources.length > 0
                ? "unit"
                : "legacy";

    return {
        metrics: {
            revenue: revenue.value,
            operatingProfit: operatingProfit.value,
            profitBeforeTax: profitBeforeTax.value,
            netProfit: netProfit.value,
            eps,
        },
        source,
    };
}

export function isConsolidated(
    record: Pick<ResultRecord, "consolidated" | "reportType">
): boolean {
    return (
        record.consolidated === true ||
        record.reportType === "consolidated"
    );
}

export function normalizeResult(
    record: ResultRecord
): ResultRecord {
    const consolidated = isConsolidated(record);
    const { metrics, source } = normalizedMetrics(record);

    const hasUnitMetadata =
        toNumber(record.unitScale) !== null ||
        Boolean(record.unit) ||
        Boolean(record.amountUnit);

    return {
        ...record,
        consolidated,
        reportType:
            record.reportType ??
            (consolidated
                ? "consolidated"
                : "standalone"),
        hasAiAnalysis: Boolean(
            record.hasAiAnalysis ||
            record.aiInsight ||
            record.aiAnalysis ||
            record.aiSummary
        ),
        metricsInCrores: metrics,
        metricsSource: source,
        // Records without any unit metadata rely on the legacy
        // "already in Crores" assumption, which may not hold for older
        // consolidated filings. Surface that so the UI can warn users.
        legacyUnits: !hasUnitMetadata,
    };
}

function normalizeAnalysis(
    record: AnalysisRecord | null | undefined
): AnalysisRecord | null {
    if (!record) {
        return null;
    }

    const consolidated =
        record.consolidated === true ||
        record.reportType === "consolidated";

    return {
        ...record,
        consolidated,
        reportType:
            record.reportType ??
            (consolidated
                ? "consolidated"
                : "standalone"),
        status:
            record.status ??
            (record.insight || record.analysis
                ? "completed"
                : "queued"),
    };
}

/**
 * Older backend builds only return `latestQuarter`/`latestYear` on the stock
 * detail endpoint. Derive the per-basis objects so the UI can stay uniform.
 */
export function normalizeDetail(
    data: StockDetailData
): StockDetailData {
    const latestQuarter = data.latestQuarter
        ? normalizeResult(data.latestQuarter)
        : null;
    const latestYear = data.latestYear
        ? normalizeResult(data.latestYear)
        : null;

    const quarterlyConsolidated = data.quarterly?.consolidated
        ? normalizeResult(data.quarterly.consolidated)
        : latestQuarter?.consolidated
            ? latestQuarter
            : null;

    const quarterlyStandalone = data.quarterly?.standalone
        ? normalizeResult(data.quarterly.standalone)
        : latestQuarter && !latestQuarter.consolidated
            ? latestQuarter
            : null;

    const yearlyConsolidated = data.yearly?.consolidated
        ? normalizeResult(data.yearly.consolidated)
        : latestYear?.consolidated
            ? latestYear
            : null;

    const yearlyStandalone = data.yearly?.standalone
        ? normalizeResult(data.yearly.standalone)
        : latestYear && !latestYear.consolidated
            ? latestYear
            : null;

    return {
        ...data,
        symbol: data.symbol,
        stockName:
            data.stockName ??
            latestQuarter?.stockName ??
            latestYear?.stockName ??
            null,
        latestQuarter,
        latestYear,
        quarterly: {
            consolidated: quarterlyConsolidated,
            standalone: quarterlyStandalone,
        },
        yearly: {
            consolidated: yearlyConsolidated,
            standalone: yearlyStandalone,
        },
        analysis: normalizeAnalysis(data.analysis),
        analyses: {
            consolidated: normalizeAnalysis(
                data.analyses?.consolidated
            ),
            standalone: normalizeAnalysis(
                data.analyses?.standalone
            ),
        },
        available: {
            consolidated:
                data.available?.consolidated ??
                Boolean(
                    quarterlyConsolidated ??
                    yearlyConsolidated
                ),
            standalone:
                data.available?.standalone ??
                Boolean(
                    quarterlyStandalone ??
                    yearlyStandalone
                ),
        },
    };
}

export function normalizeMover(
    item: MoverItem
): MoverItem {
    const current = item.current ?? {};
    const previous = item.previous ?? {};
    const selectedMetric =
        item.selectedMetric ?? "netProfit";

    const normalized = item.normalized;
    const comparableCurrent =
        normalized?.current ?? current;
    const comparablePrevious =
        normalized?.previous ?? previous;

    const selectedGrowth =
        toNumber(item.selectedGrowth) ??
        toNumber(item.growth?.[selectedMetric]) ??
        calculateGrowth(
            comparableCurrent[selectedMetric],
            comparablePrevious[selectedMetric]
        );

    const consolidated =
        item.consolidated === true ||
        item.reportType === "consolidated";

    return {
        ...item,
        consolidated,
        reportType:
            item.reportType ??
            (consolidated
                ? "consolidated"
                : "standalone"),
        basis:
            item.basis ??
            (consolidated
                ? "consolidated"
                : "standalone"),
        current: comparableCurrent,
        previous: comparablePrevious,
        growth: item.growth ?? {},
        selectedMetric,
        selectedGrowth,
        legacyUnits:
            item.legacyUnits === true ||
            item.comparisonQuality?.currentUnitAvailable ===
                false ||
            item.comparisonQuality?.previousUnitAvailable ===
                false,
    };
}

export interface RecentParams {
    page?: number;
    limit?: number;
    days?: number;
    from?: string;
    to?: string;
    consolidated?: BasisParam;
    symbol?: string;
    year?: number;
    quarter?: string;
    isFinancial?: boolean;
}

export async function fetchRecentQuarterly(
    params: RecentParams = {}
): Promise<RecentResponse> {
    const response = await apiRequest<
        RecentResponse | ResultRecord[]
    >("/api/recent/quarterly", {
        query: {
            page: params.page ?? 1,
            limit: params.limit ?? 25,
            days: params.days,
            from: params.from,
            to: params.to,
            consolidated: params.consolidated ?? "preferred",
            symbol: params.symbol,
            year: params.year,
            quarter: params.quarter,
            isFinancial: params.isFinancial,
        },
    });

    const rawData = Array.isArray(response)
        ? response
        : response.data ?? [];

    const data = rawData.map(normalizeResult);
    const limit =
        !Array.isArray(response) && response.limit
            ? response.limit
            : params.limit ?? 25;
    const page =
        !Array.isArray(response) && response.page
            ? response.page
            : params.page ?? 1;
    const total =
        !Array.isArray(response) && response.total
            ? response.total
            : data.length;

    return {
        success: true,
        page,
        limit,
        count: data.length,
        total,
        hasMore:
            !Array.isArray(response) &&
            typeof response.hasMore === "boolean"
                ? response.hasMore
                : page * limit < total,
        filters: Array.isArray(response)
            ? undefined
            : response.filters,
        data,
    };
}

export interface MoversParams {
    year: number;
    quarter: string;
    metric?: MetricKey;
    comparison?: "yoy" | "qoq";
    sort?: "asc" | "desc";
    page?: number;
    limit?: number;
    consolidated?: BasisParam;
}

export async function fetchStrongMovers(
    params: MoversParams
): Promise<MoversResponse> {
    const response = await apiRequest<
        MoversResponse | MoverItem[]
    >("/api/stocks/strong-movers", {
        query: {
            year: params.year,
            quarter: params.quarter,
            metric: params.metric ?? "netProfit",
            comparison: params.comparison ?? "yoy",
            sort: params.sort ?? "desc",
            page: params.page ?? 1,
            limit: params.limit ?? 20,
            consolidated:
                params.consolidated ?? "preferred",
        },
    });

    const rawData = Array.isArray(response)
        ? response
        : response.data ?? [];

    const data = rawData.map(normalizeMover);
    const limit =
        !Array.isArray(response) && response.limit
            ? response.limit
            : params.limit ?? 20;
    const page =
        !Array.isArray(response) && response.page
            ? response.page
            : params.page ?? 1;
    const total =
        !Array.isArray(response) && response.total
            ? response.total
            : data.length;

    return {
        success: true,
        page,
        limit,
        count: data.length,
        total,
        hasMore:
            !Array.isArray(response) &&
            typeof response.hasMore === "boolean"
                ? response.hasMore
                : page * limit < total,
        filters: Array.isArray(response)
            ? undefined
            : response.filters,
        comparisonQuarter: Array.isArray(response)
            ? undefined
            : response.comparisonQuarter,
        data,
    };
}

export async function fetchStockDetail(
    symbol: string,
    consolidated: Exclude<BasisParam, "all"> = "preferred"
): Promise<StockDetailData> {
    const response = await apiRequest<{
        success: boolean;
        data: StockDetailData;
    }>(
        `/api/stocks/${encodeURIComponent(
            symbol.toUpperCase()
        )}`,
        { query: { consolidated } }
    );

    return normalizeDetail(response.data);
}

export async function fetchQuarterlyHistory(
    symbol: string,
    options: {
        limit?: number;
        consolidated?: Exclude<BasisParam, "preferred">;
    } = {}
): Promise<HistoryResponse> {
    const response = await apiRequest<
        HistoryResponse | ResultRecord[]
    >(
        `/api/stocks/${encodeURIComponent(
            symbol.toUpperCase()
        )}/quarterly`,
        {
            query: {
                limit: options.limit ?? 40,
                consolidated:
                    options.consolidated ?? "all",
            },
        }
    );

    const rawData = Array.isArray(response)
        ? response
        : response.data ?? [];
    const data = sortNewestFirst(
        rawData.map(normalizeResult)
    );

    return {
        success: true,
        symbol: Array.isArray(response)
            ? symbol.toUpperCase()
            : response.symbol,
        count: data.length,
        filters: Array.isArray(response)
            ? undefined
            : response.filters,
        data,
    };
}

export async function fetchYearlyHistory(
    symbol: string,
    options: {
        limit?: number;
        consolidated?: Exclude<BasisParam, "preferred">;
    } = {}
): Promise<HistoryResponse> {
    const response = await apiRequest<
        HistoryResponse | ResultRecord[]
    >(
        `/api/stocks/${encodeURIComponent(
            symbol.toUpperCase()
        )}/yearly`,
        {
            query: {
                limit: options.limit ?? 10,
                consolidated:
                    options.consolidated ?? "all",
            },
        }
    );

    const rawData = Array.isArray(response)
        ? response
        : response.data ?? [];
    const data = sortNewestFirst(
        rawData.map(normalizeResult)
    );

    return {
        success: true,
        symbol: Array.isArray(response)
            ? symbol.toUpperCase()
            : response.symbol,
        count: data.length,
        filters: Array.isArray(response)
            ? undefined
            : response.filters,
        data,
    };
}

export async function fetchAnalysisHistory(
    symbol: string,
    options: {
        limit?: number;
        consolidated?: Exclude<BasisParam, "preferred">;
    } = {}
): Promise<AnalysisResponse> {
    try {
        const response = await apiRequest<{
            success: boolean;
            symbol?: string;
            count?: number;
            filters?: Record<string, unknown>;
            data?: AnalysisRecord[];
        }>(
            `/api/stocks/${encodeURIComponent(
                symbol.toUpperCase()
            )}/analysis`,
            {
                query: {
                    limit: options.limit ?? 12,
                    consolidated:
                        options.consolidated ?? "all",
                },
            }
        );

        const data = (response.data ?? [])
            .map(normalizeAnalysis)
            .filter(
                (
                    record
                ): record is AnalysisRecord =>
                    record !== null
            );

        return {
            success: true,
            symbol: response.symbol,
            count: data.length,
            filters: response.filters,
            data,
            supported: true,
        };
    } catch (error) {
        // The deployed API may predate this endpoint. Treat it as "no
        // analysis history" instead of breaking the detail page.
        if (
            error instanceof ApiError &&
            (error.status === 404 || error.status === 405)
        ) {
            return {
                success: true,
                symbol: symbol.toUpperCase(),
                count: 0,
                data: [],
                supported: false,
            };
        }

        throw error;
    }
}

export function getCurrentFinancialPeriod(
    date = new Date()
): { year: number; quarter: string } {
    const month = date.getMonth();
    const financialYear =
        month >= 3
            ? date.getFullYear() + 1
            : date.getFullYear();

    if (month >= 3 && month <= 5) {
        return { quarter: "Q1", year: financialYear };
    }

    if (month >= 6 && month <= 8) {
        return { quarter: "Q2", year: financialYear };
    }

    if (month >= 9 && month <= 11) {
        return { quarter: "Q3", year: financialYear };
    }

    return { quarter: "Q4", year: financialYear };
}

export interface LatestPeriod {
    year: number;
    quarter: string;
    fromApi: boolean;
}

/**
 * Ask the API for the newest result period. Falls back to the current Indian
 * financial quarter if the deployed API does not return anything useful.
 */
export async function resolveLatestPeriod(): Promise<LatestPeriod> {
    try {
        const response = await fetchRecentQuarterly({
            limit: 1,
            days: 90,
        });

        const latest = response.data[0];

        if (
            latest &&
            typeof latest.year === "number" &&
            latest.quarter
        ) {
            return {
                year: latest.year,
                quarter: latest.quarter,
                fromApi: true,
            };
        }
    } catch {
        // Fall through to the local estimate.
    }

    return {
        ...getCurrentFinancialPeriod(),
        fromApi: false,
    };
}

/**
 * Pick the newest quarter for each company/period, preferring consolidated
 * data when both bases exist. Older API builds only have standalone rows, so
 * this is also a no-op for them.
 */
export function pickPreferredSeries(
    records: ResultRecord[]
): ResultRecord[] {
    const byPeriod = new Map<string, ResultRecord>();

    for (const record of records) {
        const key = `${record.year ?? ""}-${record.quarter ?? ""}`;
        const existing = byPeriod.get(key);

        if (
            !existing ||
            (record.consolidated && !existing.consolidated)
        ) {
            byPeriod.set(key, record);
        }
    }

    return sortNewestFirst([...byPeriod.values()]);
}

export function filterByBasis(
    records: ResultRecord[],
    basis: "preferred" | "consolidated" | "standalone"
): ResultRecord[] {
    if (basis === "preferred") {
        return pickPreferredSeries(records);
    }

    return sortNewestFirst(
        records.filter((record) =>
            basis === "consolidated"
                ? record.consolidated
                : !record.consolidated
        )
    );
}
