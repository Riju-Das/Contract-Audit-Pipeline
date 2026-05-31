import { useEffect, useState } from 'react';

type RadialGaugeProps = {
    score: number;
    grade?: string;
    size?: number;
    strokeWidth?: number;
};

function getGaugeColor(score: number): string {
    if (score <= 30) return '#10b981'; // Green
    if (score <= 60) return '#f59e0b'; // Yellow
    if (score <= 80) return '#f97316'; // Orange
    return '#ef4444'; // Red
}


export function RadialGauge({
    score,
    grade,
    size = 180,
    strokeWidth = 12,
}: RadialGaugeProps) {
    const [animatedScore, setAnimatedScore] = useState(0);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const clampedScore = Math.max(0, Math.min(100, score));

    useEffect(() => {
        let start: number | null = null;
        let frame: number;

        const animate = (ts: number) => {
            if (!start) start = ts;
            const progress = Math.min((ts - start) / 1200, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setAnimatedScore(eased * clampedScore);
            if (progress < 1) frame = requestAnimationFrame(animate);
        };

        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, [clampedScore]);

    const dashOffset = circumference - (animatedScore / 100) * circumference;
    const color = getGaugeColor(clampedScore);

    return (
        <div style={{ position: 'relative', width: size, height: size }}>
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                style={{ transform: 'rotate(-90deg)' }}
            >
                <defs>
                    <filter id="gauge-glow">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                {/* Background track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="var(--color-surface-2)"
                    strokeWidth={strokeWidth}
                />
                {/* Animated progress arc */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    filter="url(#gauge-glow)"
                    style={{ transition: 'stroke-dashoffset 100ms ease' }}
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
                    gap: 2,
                }}
            >
                <span
                    style={{
                        fontSize: size * 0.22,
                        fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)",
                        fontWeight: 800,
                        color: color,
                        letterSpacing: '-0.02em',
                        lineHeight: 1,
                        fontVariantNumeric: 'tabular-nums',
                    }}
                >
                    {Math.round(animatedScore)}
                </span>
                {grade && (
                    <span
                        style={{
                            fontSize: size * 0.075,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            color: 'var(--color-text-soft, #5e6e8a)',
                            fontWeight: 600,
                        }}
                    >
                        {grade}
                    </span>
                )}
            </div>
        </div>
    );
}
