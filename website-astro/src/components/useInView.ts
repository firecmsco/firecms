import { useEffect, useRef, useState } from "react";

/**
 * True while the element is on screen.
 *
 * The homepage showcase mounts four self-playing demos. Without this they all
 * animate at once and starve each other's timers — the MCP transcript was
 * running roughly seven times slower than intended. Each demo now idles until
 * the reader can actually see it.
 */
export function useInView<T extends HTMLElement>(rootMargin = "200px") {
    const ref = useRef<T | null>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        if (typeof IntersectionObserver === "undefined") {
            setInView(true);
            return;
        }

        let reported = false;
        const io = new IntersectionObserver(
            entries => {
                reported = true;
                setInView(entries.some(e => e.isIntersecting));
            },
            { rootMargin }
        );
        io.observe(el);

        // Fail open. Some embedded renderers construct an IntersectionObserver
        // happily and then never deliver a callback; a demo that waits forever
        // in that case is worse than one that plays when it is off screen.
        const fallback = setTimeout(() => {
            if (!reported) setInView(true);
        }, 1500);

        return () => {
            clearTimeout(fallback);
            io.disconnect();
        };
    }, [rootMargin]);

    return { ref, inView };
}
