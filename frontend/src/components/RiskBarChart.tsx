import { useEffect, useState } from 'react';

type RiskBarChartProps = {
    data: { label: string; value: number }[];
};

function getBarColor(value: number): string {
    if (value <= 30) return '#10b981'; // Green
    if (value <= 60) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
}

function getTextColor(value: number): string {
    if (value <= 30) return '#10b981';
    if (value <= 60) return '#f59e0b';
    return '#ef4444';
}

export function RiskBarChart({ data }: RiskBarChartProps) {
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setAnimated(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div style={{ display: 'grid', gap: 16 }}>
            {data.map((item, index) => {
                const clamped = Math.max(0, Math.min(100, item.value));
                return (
                    <div key={item.label} style={{ display: 'grid', gap: 6 }}>
                        <div
                             style={{
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'space-between',
                             }}
                        >
                            <span
                                style={{
                                    fontSize: '0.78rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                    color: 'var(--color-text-soft, #5e6e8a)',
                                    fontWeight: 500,
                                }}
                            >
                                {item.label}
                            </span>
                            <span
                                style={{
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    color: getTextColor(clamped),
                                    fontVariantNumeric: 'tabular-nums',
                                }}
                            >
                                {clamped}
                            </span>
                        </div>
                        <div
                            style={{
                                height: 8,
                                background: 'var(--color-surface-2, #27272a)',
                                borderRadius: 9999,
                                overflow: 'hidden',
                                position: 'relative',
                            }}
                        >
                            <div
                                style={{
                                    height: '100%',
                                    width: animated ? `${clamped}%` : '0%',
                                    background: getBarColor(clamped),
                                    borderRadius: 9999,
                                    transition: `width 800ms cubic-bezier(0.4, 0, 0.2, 1) ${index * 100}ms`,
                                    position: 'relative',
                                }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
