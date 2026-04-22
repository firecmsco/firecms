"use client";
import * as React from "react";
import { useLayoutEffect } from "react";
import { debounce } from "../util";

type State = {
    outerHeightStyle: number;
    overflow?: boolean | undefined;
};

function getStyleValue(value: string) {
    return parseInt(value, 10) || 0;
}

export const TextareaAutosize = React.forwardRef(function TextareaAutosize(
    props: TextareaAutosizeProps,
    ref: React.ForwardedRef<Element>
) {
    const {
        onChange,
        onScroll,
        onResize,
        maxRows,
        minRows = 1,
        style,
        value,
        onFocus,
        onBlur,
        sizeRef,
        ignoreBoxSizing,
        ...other
    } = props;

    const { current: isControlled } = React.useRef(value != null);
    const inputRef = React.useRef<HTMLTextAreaElement>(null);
    const handleRef = useForkRef(ref, inputRef);

    const syncHeight = React.useCallback(() => {
        const el = inputRef.current;
        if (!el || typeof window === "undefined") return;
        if (el.offsetWidth === 0) return;

        const cs = window.getComputedStyle(el);
        const paddingY =
            getStyleValue(cs.paddingTop) + getStyleValue(cs.paddingBottom);
        const borderY =
            getStyleValue(cs.borderTopWidth) + getStyleValue(cs.borderBottomWidth);
        const boxSizing = cs.boxSizing;

        // ── measure by temporarily collapsing the real element ──
        const prevHeight = el.style.height;
        const prevOverflow = el.style.overflowY;
        el.style.overflowY = "hidden";
        el.style.height = "0px";

        // scrollHeight = content + padding (always, regardless of box-sizing)
        const scrollH = el.scrollHeight;

        // Measure single-row height for minRows / maxRows
        const prevValue = el.value;
        el.value = "x";
        const singleRowScrollH = el.scrollHeight;
        el.value = prevValue;

        // Restore immediately — all of this happens before paint (useLayoutEffect)
        el.style.height = prevHeight;
        el.style.overflowY = prevOverflow;

        const lineHeight = singleRowScrollH - paddingY;

        let targetHeight = scrollH; // includes padding

        if (minRows) {
            targetHeight = Math.max(
                Number(minRows) * lineHeight + paddingY,
                targetHeight
            );
        }

        const unclampedHeight = targetHeight;

        if (maxRows) {
            targetHeight = Math.min(
                Number(maxRows) * lineHeight + paddingY,
                targetHeight
            );
        }

        // For border-box, height CSS prop = content + padding + border.
        // scrollHeight already includes padding, so only add border.
        const extra =
            !ignoreBoxSizing && boxSizing === "border-box" ? borderY : 0;
        const finalHeight = Math.ceil(targetHeight + extra);

        const shouldScroll =
            Math.abs(unclampedHeight - targetHeight) > 1;

        el.style.height = `${finalHeight}px`;
        el.style.overflowY = shouldScroll ? "auto" : "hidden";

        if (onResize) {
            onResize({ outerHeightStyle: finalHeight, overflow: !shouldScroll });
        }
    }, [maxRows, minRows, ignoreBoxSizing, onResize]);

    // ── sync on every layout ──
    useLayoutEffect(() => {
        syncHeight();
    });

    // ── sync on window resize / element resize ──
    React.useEffect(() => {
        const handleResize = debounce(() => {
            if (inputRef.current) {
                syncHeight();
            }
        });

        const input = inputRef.current!;
        if (typeof window === "undefined") return;

        window.addEventListener("resize", handleResize);

        let resizeObserver: ResizeObserver | undefined;
        if (typeof ResizeObserver !== "undefined") {
            resizeObserver = new ResizeObserver(handleResize);
            resizeObserver.observe(input);
        }

        return () => {
            handleResize.clear();
            window.removeEventListener("resize", handleResize);
            resizeObserver?.disconnect();
        };
    }, [syncHeight]);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!isControlled) {
            syncHeight();
        }
        if (onChange) {
            onChange(event);
        }
    };

    return (
        <textarea
            value={value}
            onChange={handleChange}
            className={props.className}
            ref={handleRef}
            onFocus={onFocus}
            onBlur={onBlur}
            rows={minRows as number}
            style={{
                ...style,
            }}
            onScroll={onScroll}
            {...other}
        />
    );
}) as React.FC<TextareaAutosizeProps & { ref?: React.ForwardedRef<Element> }>;

export type TextareaAutosizeProps = Omit<React.InputHTMLAttributes<HTMLTextAreaElement>, "onResize"> & {

    className?: string;

    shadowClassName?: string;

    /**
     * Maximum number of rows to display.
     */
    maxRows?: number | string;
    /**
     * Minimum number of rows to display.
     * @default 1
     */
    minRows?: number | string;
    /**
     * @ignore
     */
    onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
    /**
     * @ignore
     */
    placeholder?: string;
    /**
     * @ignore
     */
    style?: object;
    /**
     * @ignore
     */
    value?: string[] | number | string;

    sizeRef?: React.RefObject<HTMLDivElement>;

    onScroll?: (event: React.UIEvent<HTMLTextAreaElement>) => void;

    onResize?: (state: State) => void;

    autoFocus?: boolean;

    ignoreBoxSizing?: boolean;
}

function useForkRef<Instance>(
    ...refs: Array<React.Ref<Instance> | undefined>
): React.RefCallback<Instance> | null {
    return React.useMemo(() => {
        if (refs.every((ref) => ref == null)) {
            return null;
        }

        return (instance) => {
            refs.forEach((ref) => {
                setRef(ref, instance);
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, refs);
}

function setRef<T>(
    ref: React.MutableRefObject<T | null> | ((instance: T | null) => void) | null | undefined,
    value: T | null,
): void {
    if (typeof ref === "function") {
        ref(value);
    } else if (ref) {
        ref.current = value;
    }
}
