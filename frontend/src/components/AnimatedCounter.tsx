import { useEffect, useRef, useState } from 'react';

type AnimatedCounterProps = {
    value: number;
    duration?: number;
    suffix?: string;
    prefix?: string;
    decimals?: number;
};

export function AnimatedCounter({
    value,
    duration = 1200,
    suffix = '',
    prefix = '',
    decimals = 0,
}: AnimatedCounterProps) {
    const [display, setDisplay] = useState(0);
    const startTime = useRef<number | null>(null);
    const frameRef = useRef<number>(0);

    useEffect(() => {
        startTime.current = null;

        const animate = (timestamp: number) => {
            if (!startTime.current) startTime.current = timestamp;
            const elapsed = timestamp - startTime.current;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(eased * value);

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            }
        };

        frameRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameRef.current);
    }, [value, duration]);

    const formatted = decimals > 0
        ? display.toFixed(decimals)
        : Math.round(display).toString();

    return (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
            {prefix}{formatted}{suffix}
        </span>
    );
}
