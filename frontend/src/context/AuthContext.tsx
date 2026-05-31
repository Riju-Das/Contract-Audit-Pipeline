import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { requestJson, requestRaw } from "../lib/api";
import type { AuthResponse, SignupResponse } from "../types/api";

// ── LocalStorage persistence ──
const LS_KEY = 'cap_auth';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

type PersistedAuth = {
    accessToken: string;
    user: UserSummary;
    expiresAt: number; // epoch ms
};

function readPersistedAuth(): PersistedAuth | null {
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw) return null;
        const parsed: PersistedAuth = JSON.parse(raw);
        if (Date.now() > parsed.expiresAt) {
            localStorage.removeItem(LS_KEY);
            return null;
        }
        return parsed;
    } catch {
        return null;
    }
}

function writePersistedAuth(token: string, user: UserSummary) {
    const payload: PersistedAuth = {
        accessToken: token,
        user,
        expiresAt: Date.now() + ONE_DAY_MS,
    };
    localStorage.setItem(LS_KEY, JSON.stringify(payload));
}

function clearPersistedAuth() {
    localStorage.removeItem(LS_KEY);
}

export type UserSummary = {
    userId: number;
    username: string;
    fullname: string;
};

type AuthContextValue = {
    user: UserSummary | null;
    isReady: boolean;
    login: (username: string, password: string) => Promise<void>;
    signup: (payload: {
        username: string;
        password: string;
        fullname: string;
        email: string;
    }) => Promise<SignupResponse>;
    logout: () => Promise<void>;
    apiFetch: (path: string, init?: RequestInit) => Promise<Response>;
    apiFetchJson: <T>(path: string, init?: RequestInit) => Promise<T>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // Seed state from localStorage so the page doesn't flicker on reload
    const persisted = readPersistedAuth();
    const [accessToken, setAccessToken] = useState<string | null>(persisted?.accessToken ?? null);
    const [user, setUser]               = useState<UserSummary | null>(persisted?.user ?? null);
    const [isReady, setIsReady]         = useState(false);

    const applyAuth = useCallback((data: AuthResponse) => {
        const u: UserSummary = {
            userId: data.userId,
            username: data.username,
            fullname: data.fullname,
        };
        setAccessToken(data.accessToken);
        setUser(u);
        writePersistedAuth(data.accessToken, u); // persist for 1 day
    }, []);

    const clearAuth = useCallback(() => {
        setAccessToken(null);
        setUser(null);
        clearPersistedAuth();
    }, []);

    const refresh = useCallback(async () => {
        const data = await requestJson<AuthResponse>("/api/v1/auth/refresh", {
            method: "POST",
        });
        applyAuth(data);
        return data.accessToken;
    }, [applyAuth]);

    useEffect(() => {
        let isMounted = true;
        const bootstrap = async () => {
            // If we already have a valid stored token, skip the refresh call
            if (accessToken && user) {
                if (isMounted) setIsReady(true);
                return;
            }
            try {
                await refresh();
            } catch {
                if (isMounted) clearAuth();
            } finally {
                if (isMounted) setIsReady(true);
            }
        };

        bootstrap();

        return () => {
            isMounted = false;
        };
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const login = useCallback(
        async (username: string, password: string) => {
            const data = await requestJson<AuthResponse>("/api/v1/auth/login", {
                method: "POST",
                body: JSON.stringify({ username, password }),
            });
            applyAuth(data);
        },
        [applyAuth]
    );

    const signup = useCallback(
        async (payload: { username: string; password: string; fullname: string; email: string }) => {
            return await requestJson<SignupResponse>("/api/v1/auth/signup", {
                method: "POST",
                body: JSON.stringify(payload),
            });
        },
        []
    );

    const logout = useCallback(async () => {
        try {
            await requestRaw("/api/v1/auth/logout", { method: "POST" });
        } catch {
            // Ignore logout errors to avoid blocking client-side sign-out.
        } finally {
            clearAuth();
        }
    }, [clearAuth]);

    const apiFetch = useCallback(
        async (path: string, init: RequestInit = {}) => {
            let token = accessToken;

            if (!token) {
                try {
                    token = await refresh();
                } catch {
                    clearAuth();
                    throw new Error("Session expired. Please sign in again.");
                }
            }

            const headers = new Headers(init.headers || {});
            headers.set("Authorization", `Bearer ${token}`);

            try {
                return await requestRaw(path, { ...init, headers });
            } catch (error: any) {
                if (error?.status === 401 || error?.status === 403) {
                    try {
                        const newToken = await refresh();
                        headers.set("Authorization", `Bearer ${newToken}`);
                        return await requestRaw(path, { ...init, headers });
                    } catch {
                        clearAuth();
                        throw new Error("Session expired. Please sign in again.");
                    }
                }
                throw error;
            }
        },
        [accessToken, refresh, clearAuth]
    );

    const apiFetchJson = useCallback(
        async <T,>(path: string, init: RequestInit = {}) => {
            const response = await apiFetch(path, init);
            if (response.status === 204) {
                return null as T;
            }
            return (await response.json()) as T;
        },
        [apiFetch]
    );

    const value = useMemo<AuthContextValue>(
        () => ({ user, isReady, login, signup, logout, apiFetch, apiFetchJson }),
        [user, isReady, login, signup, logout, apiFetch, apiFetchJson]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}
