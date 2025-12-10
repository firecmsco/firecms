"use client";
import * as React from "react";
import { useLayoutEffect } from "react";
import * as ReactDOM from "react-dom";
import { cls, debounce } from "../util";

type State = {
    outerHeightStyle: number;
    overflow?: boolean | undefined;
};

function getStyleValue(value: string) {
    return parseInt(value, 10) || 0;
}

const styles: {
    shadow: React.CSSProperties;
} = {
    shadow: {
        // Visibility needed to hide the extra text area on iPads
        visibility: "hidden",
        // Remove from the content flow
        position: "absolute",
        // Ignore the scrollbar width
        overflow: "hidden",
        height: 0,
        top: 0,
        left: 0,
        // Create a new layer, increase the isolation of the computed values
        transform: "translateZ(0)"
    }
};

function isEmpty(obj: State) {
    return (
        obj === undefined ||
        obj === null ||
        Object.keys(obj).length === 0 ||
        (obj.outerHeightStyle === 0 && !obj.overflow)
    );
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
    const inputRef = React.useRef<HTMLInputElement>(null);
    const handleRef = useForkRef(ref, inputRef);
    const shadowRef = React.useRef<HTMLTextAreaElement>(null);
    const renders = React.useRef(0);
    const [state, setState] = React.useState<State>({
        outerHeightStyle: 0
    });

    const getUpdatedState = React.useCallback(() => {

        const input = inputRef.current!;
        if (typeof window === "undefined") {
            return {
                outerHeightStyle: 0
            };
        }

        const containerWindow = window;
        const computedStyle = containerWindow.getComputedStyle(input);

        // If input's width is shrunk and it's not visible, don't sync height.
        if (computedStyle.width === "0px") {
            return {
                outerHeightStyle: 0
            };
        }

        const sizeReferenceElement = sizeRef?.current ?? shadowRef.current!;
        const inputShallow = shadowRef.current!;

        sizeReferenceElement.style.width = computedStyle.width;
        inputShallow.value = input.value || props.placeholder || "x";
        if (inputShallow.value.slice(-1) === "\n") {
            // Certain fonts which overflow the line height will cause the textarea
            // to report a different scrollHeight depending on whether the last line
            // is empty. Make it non-empty to avoid this issue.
            inputShallow.value += " ";
        }

        const boxSizing = computedStyle.boxSizing;
        const padding =
            getStyleValue(computedStyle.paddingBottom) + getStyleValue(computedStyle.paddingTop);
        const border =
            getStyleValue(computedStyle.borderBottomWidth) + getStyleValue(computedStyle.borderTopWidth);
        const minHeight = getStyleValue(computedStyle.minHeight);

        // The height of the inner content
        const innerHeight = sizeReferenceElement.scrollHeight;

        // Measure height of a textarea with a single row
        inputShallow.value = "x";
        const singleRowHeight = sizeReferenceElement.scrollHeight;

        // The height of the outer content
        let outerHeight = innerHeight;

        if (minRows) {
            outerHeight = Math.max(Number(minRows) * singleRowHeight, outerHeight);
        }
        if (maxRows) {
            outerHeight = Math.min(Number(maxRows) * singleRowHeight, outerHeight);
        }
        outerHeight = Math.max(outerHeight, singleRowHeight, minHeight);

        // Take the box sizing into account for applying this value as a style.
        const outerHeightStyle = outerHeight + (!ignoreBoxSizing && boxSizing === "border-box" ? padding + border : 0);

        const overflow = Math.abs(outerHeight - innerHeight) <= 1;

        return {
            outerHeightStyle,
            overflow
        };
    }, [maxRows, minRows, props.placeholder]);

    const updateState = React.useCallback((prevState: State, newState: State) => {
        const {
            outerHeightStyle,
            overflow
        } = newState;
        // Need a large enough difference to update the height.
        // This prevents infinite rendering loop.
        if (
            renders.current < 20 &&
            ((outerHeightStyle > 0 &&
                    Math.abs((prevState.outerHeightStyle || 0) - outerHeightStyle) > 1) ||
                prevState.overflow !== overflow)
        ) {
            renders.current += 1;
            return {
                overflow,
                outerHeightStyle
            };
        }
        if (process.env.NODE_ENV !== "production") {
            if (renders.current === 20) {
                console.error(
                    [
                        "MUI: Too many re-renders. The layout is unstable.",
                        "TextareaAutosize limits the number of renders to prevent an infinite loop."
                    ].join("\n")
                );
            }
        }
        return prevState;
    }, []);

    const syncHeight = React.useCallback(() => {
        const newState = getUpdatedState();

        if (isEmpty(newState)) {
            return;
        }
        if (onResize) {
            onResize(newState);
        }

        setState((prevState) => {
            return updateState(prevState, newState);
        });
    }, [getUpdatedState, onResize, updateState]);

    const syncHeightWithFlushSync = React.useCallback(() => {
        const newState = getUpdatedState();

        if (isEmpty(newState)) {
            return;
        }

        // In React 18, state updates in a ResizeObserver's callback are happening after the paint which causes flickering
        // when doing some visual updates in it. Using flushSync ensures that the dom will be painted after the states updates happen
        // Related issue - https://github.com/facebook/react/issues/24331
        ReactDOM.flushSync(() => {
            setState((prevState) => {
                return updateState(prevState, newState);
            });
        });
    }, [getUpdatedState, updateState]);

    React.useEffect(() => {
        const handleResize = debounce(() => {
            renders.current = 0;

            // If the TextareaAutosize component is replaced by Suspense with a fallback, the last
            // ResizeObserver's handler that runs because of the change in the layout is trying to
            // access a dom node that is no longer there (as the fallback component is being shown instead).
            if (inputRef.current) {
                syncHeightWithFlushSync();
            }
        });
        let resizeObserver: ResizeObserver;

        const input = inputRef.current!;
        const containerWindow = window;
        if (typeof window === "undefined") {
            return;
        }

        containerWindow.addEventListener("resize", handleResize);

        if (typeof ResizeObserver !== "undefined") {
            resizeObserver = new ResizeObserver(handleResize);
            resizeObserver.observe(input);
        }

        return () => {
            handleResize.clear();
            containerWindow.removeEventListener("resize", handleResize);
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
        };
    }, [syncHeightWithFlushSync]);

    useLayoutEffect(() => {
        syncHeight();
    });

    React.useEffect(() => {
        renders.current = 0;
    }, [value]);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        renders.current = 0;

        if (!isControlled) {
            syncHeight();
        }

        if (onChange) {
            onChange(event);
        }
    };

    return (
        <React.Fragment>
            <textarea
                value={value}
                onChange={handleChange}
                className={props.className}
                ref={handleRef}
                onFocus={onFocus}
                onBlur={onBlur}
                // Apply the rows prop to get a "correct" first SSR paint
                rows={minRows as number}
                style={{
                    height: state.outerHeightStyle,
                    // Need a large enough difference to allow scrolling.
                    // This prevents infinite rendering loop.
                    overflow: state.overflow ? "hidden" : undefined,
                    ...style,
                }}
                onScroll={onScroll}
                {...other}
            />
            <textarea
                aria-hidden
                className={cls(props.className, props.shadowClassName)}
                readOnly
                ref={shadowRef}
                tabIndex={-1}
                style={{
                    padding: 0,
                    ...styles.shadow,
                    ...style,
                }}
            />
        </React.Fragment>
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
    /**
     * This will create a new function if the refs passed to this hook change and are all defined.
     * This means react will call the old forkRef with `null` and the new forkRef
     * with the ref. Cleanup naturally emerges from this behavior.
     */
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
