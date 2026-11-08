/**
 * Browser-side auth session storage for StockJump.
 *
 * The API currently returns a JWT from `/api/auth/login` and
 * `/api/auth/register`. Stock data routes are public, but keeping the token in
 * one place makes it easy to send it as `Authorization: Bearer <token>` once
 * protected routes are enabled.
 */

export interface AuthUser {
    id: string;
    name: string;
    email: string;
}

export interface AuthSession {
    user: AuthUser;
    token: string;
}

const TOKEN_KEY = "stockjump_token";
const USER_KEY = "stockjump_user";

function isBrowser(): boolean {
    return typeof window !== "undefined";
}

export function getStoredToken(): string | null {
    if (!isBrowser()) {
        return null;
    }

    return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
    if (!isBrowser()) {
        return null;
    }

    const raw = window.localStorage.getItem(USER_KEY);

    if (!raw) {
        return null;
    }

    try {
        const parsed = JSON.parse(raw) as Partial<AuthUser>;

        if (
            typeof parsed.id !== "string" ||
            typeof parsed.name !== "string" ||
            typeof parsed.email !== "string"
        ) {
            return null;
        }

        return {
            id: parsed.id,
            name: parsed.name,
            email: parsed.email,
        };
    } catch {
        return null;
    }
}

export function storeAuthSession(session: AuthSession): void {
    if (!isBrowser()) {
        return;
    }

    window.localStorage.setItem(TOKEN_KEY, session.token);
    window.localStorage.setItem(
        USER_KEY,
        JSON.stringify(session.user)
    );
}

export function clearAuthSession(): void {
    if (!isBrowser()) {
        return;
    }

    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
}
