export type ApiError = {
    message: string;
    status: number;
};

const API_BASE = import.meta.env.VITE_API_BASE;

if (!API_BASE) {
    throw new Error("VITE_API_BASE is required. Set it in frontend/.env.");
}

function buildUrl(path: string) {
    return `${API_BASE}${path}`;
}

async function buildError(response: Response): Promise<ApiError> {
    let message = response.statusText || "Request failed";
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        try {
            const data = await response.json();
            if (typeof data?.detail === "string") {
                message = data.detail;
            } else if (typeof data?.message === "string") {
                message = data.message;
            }
        } catch {
            // ignore
        }
    } else {
        try {
            const text = await response.text();
            if (text) message = text;
        } catch {
            // ignore
        }
    }

    return { message, status: response.status };
}

export async function requestRaw(path: string, init: RequestInit = {}) {
    const response = await fetch(buildUrl(path), {
        credentials: "include",
        ...init,
    });

    if (!response.ok) {
        throw await buildError(response);
    }

    return response;
}

export async function requestJson<T>(path: string, init: RequestInit = {}) {
    const headers = new Headers(init.headers || {});
    if (!(init.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(buildUrl(path), {
        credentials: "include",
        ...init,
        headers,
    });

    if (!response.ok) {
        throw await buildError(response);
    }

    if (response.status === 204) {
        return null as T;
    }

    return (await response.json()) as T;
}
