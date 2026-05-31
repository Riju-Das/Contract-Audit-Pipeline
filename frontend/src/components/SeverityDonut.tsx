import { useEffect, useState } from 'react';

type SeverityDonutProps = {
    red: number;
    yellow: number;
    green: number;
    total: number;
    size?: number;
};

const COLORS = {
    red: '#ef4444', // Critical -> Red
    yellow: '#f59e0b', // Warning -> Yellow
    green: '#10b981', // Low -> Green
    empty: 'var(--color-surface-2)', // Background Track -> Zinc-800
};

export function SeverityDonut({
    red,
    yellow,
    green,
    total,
    size = 160,
}: SeverityDonutProps) {
    const [animated, setAnimated] = useState(false);
    const strokeWidth = 14;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const sum = red + yellow + green;

    useEffect(() => {
        const timer = setTimeout(() => setAnimated(true), 100);
        return () => clearTimeout(timer);
    }, []);

    if (sum === 0) {
        return (
            <div style={{ position: 'relative', width: size, height: size }}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={COLORS.empty}
                        strokeWidth={strokeWidth}
                    />
                </svg>
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <span style={{ fontSize: size * 0.15, fontWeight: 800, color: 'var(--color-text-soft, #5e6e8a)' }}>
                        0
                    </span>
                    <span style={{ fontSize: size * 0.07, color: 'var(--color-text-soft, #5e6e8a)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Violations
                    </span>
                </div>
            </div>
        );
    }

    const segments = [
        { count: red, color: COLORS.red, label: 'Red' },
        { count: yellow, color: COLORS.yellow, label: 'Yellow' },
        { count: green, color: COLORS.green, label: 'Green' },
    ].filter((s) => s.count > 0);

    let accumulatedOffset = 0;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    style={{ transform: 'rotate(-90deg)' }}
                >
                    {/* Background */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={COLORS.empty}
                        strokeWidth={strokeWidth}
                    />
                    {/* Segments */}
                    {segments.map((seg) => {
                        const segLen = (seg.count / sum) * circumference;
                        const offset = circumference - segLen;
                        const rotation = (accumulatedOffset / circumference) * 360;
                        accumulatedOffset += segLen;

                        return (
                            <circle
                                key={seg.label}
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="none"
                                stroke={seg.color}
                                strokeWidth={strokeWidth}
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={animated ? offset : circumference}
                                style={{
                                    transform: `rotate(${rotation}deg)`,
                                    transformOrigin: '50% 50%',
                                    transition: 'stroke-dashoffset 800ms cubic-bezier(0.4, 0, 0.2, 1)',
                                }}
                            />
                        );
                    })}
                </svg>
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <span
                        style={{
                            fontSize: size * 0.2,
                            fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)",
                            fontWeight: 800,
                            color: 'var(--color-text, #e8ecf4)',
                            lineHeight: 1,
                        }}
                    >
                        {total}
                    </span>
                    <span
                        style={{
                            fontSize: size * 0.065,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            color: 'var(--color-text-soft, #5e6e8a)',
                            fontWeight: 600,
                        }}
                    >
                        Violations
                    </span>
                </div>
            </div>
            {/* Legend */}
            <div style={{ display: 'grid', gap: 10 }}>
                {[
                    { label: 'Critical', count: red, color: COLORS.red },
                    { label: 'Warning', count: yellow, color: COLORS.yellow },
                    { label: 'Low', count: green, color: COLORS.green },
                ].map((item) => (
                    <div
                        key={item.label}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontSize: '0.82rem',
                        }}
                    >
                        <div
                            style={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                background: item.color,
                                flexShrink: 0,
                            }}
                        />
                        <span style={{ color: 'var(--color-text-muted, #a0aec4)' }}>
                            {item.label}
                        </span>
                        <span
                            style={{
                                fontWeight: 700,
                                color: 'var(--color-text, #e8ecf4)',
                                marginLeft: 'auto',
                            }}
                        >
                            {item.count}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
