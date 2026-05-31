type ProgressRingProps = {
    value: number;
    size?: number;
    strokeWidth?: number;
};

function getRingColor(value: number): string {
    if (value <= 30) return '#10b981'; // Green
    if (value <= 60) return '#f59e0b'; // Yellow
    if (value <= 80) return '#f97316'; // Orange
    return '#ef4444'; // Red
}

export function ProgressRing({
    value,
    size = 32,
    strokeWidth = 3,
}: ProgressRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const clamped = Math.max(0, Math.min(100, value));
    const offset = circumference - (clamped / 100) * circumference;
    const color = getRingColor(clamped);

    return (
        <div
            style={{
                position: 'relative',
                width: size,
                height: size,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                style={{ transform: 'rotate(-90deg)', position: 'absolute' }}
            >
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="var(--color-surface-2)"
                    strokeWidth={strokeWidth}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 600ms cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
            </svg>
            <span
                style={{
                    fontSize: size * 0.28,
                    fontWeight: 700,
                    color,
                    fontVariantNumeric: 'tabular-nums',
                    lineHeight: 1,
                }}
            >
                {Math.round(clamped)}
            </span>
        </div>
    );
}
