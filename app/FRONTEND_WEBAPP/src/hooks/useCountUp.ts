import { useEffect, useRef, useState } from "react";

export function useCountUp(target: number, durationMs = 800, delayMs = 0): number {
    const [value, setValue] = useState(0);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const startTime = performance.now();

            const tick = (now: number) => {
                const progress = Math.min((now - startTime) / durationMs, 1);
                // Cubic ease out
                const ease = 1 - Math.pow(1 - progress, 3);
                setValue(Math.round(ease * target));

                if (progress < 1) {
                    rafRef.current = requestAnimationFrame(tick);
                }
            };

            rafRef.current = requestAnimationFrame(tick);
        }, delayMs);

        return () => {
            clearTimeout(timeoutId);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [target, durationMs, delayMs]);

    return value;
}
