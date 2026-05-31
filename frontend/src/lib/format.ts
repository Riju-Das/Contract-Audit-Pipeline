export function formatDate(value?: string | null) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

export function formatNumber(value?: number | null) {
    if (value === null || value === undefined) return "-";
    return new Intl.NumberFormat("en-US").format(value);
}
