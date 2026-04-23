import React, { createContext, useContext, useRef, useState, useEffect } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cls } from "../util";
import { defaultBorderMixin } from "../styles";
import { IconButton } from "./IconButton";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons";

type TabsMode = "primary" | "secondary";
const TabsModeContext = createContext<TabsMode>("primary");

export type TabsProps = {
    value: string,
    children: React.ReactNode,
    innerClassName?: string,
    className?: string,
    onValueChange: (value: string) => void,
    /**
     * "primary" renders the default pill-style tabs.
     * "secondary" renders underline-style tabs suitable for inner/nested panels.
     */
    mode?: TabsMode
};

export function Tabs({
    value,
    onValueChange,
    className,
    innerClassName,
    children,
    mode = "primary"
}: TabsProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftScroll, setShowLeftScroll] = useState(false);
    const [showRightScroll, setShowRightScroll] = useState(false);
    const [isScrollable, setIsScrollable] = useState(false);

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowLeftScroll(scrollLeft > 0);
            setShowRightScroll(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
            setIsScrollable(scrollWidth > clientWidth);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener("resize", checkScroll);

        let observer: ResizeObserver;
        if (scrollContainerRef.current) {
            observer = new ResizeObserver(checkScroll);
            observer.observe(scrollContainerRef.current);
            if (scrollContainerRef.current.firstElementChild) {
                observer.observe(scrollContainerRef.current.firstElementChild);
            }
        }

        return () => {
            window.removeEventListener("resize", checkScroll);
            observer?.disconnect();
        };
    }, [children]);

    const scroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollAmount = Math.max(container.clientWidth / 2, 200);
            const targetScroll = container.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount);

            container.scrollTo({
                left: targetScroll,
                behavior: "smooth"
            });
            // checkScroll will be called by onScroll event
        }
    };

    return <TabsModeContext.Provider value={mode}>
        <TabsPrimitive.Root value={value} onValueChange={onValueChange} className={cls("flex flex-row items-center min-w-0", className)}>
        {isScrollable && (
            <button
                type="button"
                disabled={!showLeftScroll}
                onClick={() => scroll("left")}
                className={cls(
                    "flex-shrink-0 z-10 flex items-center justify-center rounded-md px-0.5 py-1.5 transition-all h-10 w-6",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-400",
                    "disabled:pointer-events-none disabled:opacity-0",
                    "text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-800",
                    mode === "primary" && "mr-1 bg-surface-50 dark:bg-surface-900 border",
                    mode === "primary" && defaultBorderMixin,
                    mode === "secondary" && "mr-1"
                )}
            >
                <ChevronLeftIcon size="small" />
            </button>
        )}
        <div
            ref={scrollContainerRef}
            className="flex-1 overflow-x-auto no-scrollbar min-w-0"
            onScroll={checkScroll}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
            <TabsPrimitive.List className={cls(
                mode === "primary" && "border",
                mode === "primary" && defaultBorderMixin,
                mode === "primary" && "gap-2 inline-flex h-10 items-center justify-center rounded-md bg-surface-50 p-1 text-surface-600 dark:bg-surface-900 dark:text-surface-400",
                mode === "secondary" && "gap-1 inline-flex h-9 items-center text-surface-500 dark:text-surface-400",
                innerClassName)
            }>
                {children}
            </TabsPrimitive.List>
        </div>
        {isScrollable && (
            <button
                type="button"
                disabled={!showRightScroll}
                onClick={() => scroll("right")}
                className={cls(
                    "flex-shrink-0 z-10 flex items-center justify-center rounded-md px-0.5 py-1.5 transition-all h-10 w-6",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-400",
                    "disabled:pointer-events-none disabled:opacity-0",
                    "text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-800",
                    mode === "primary" && "ml-1 bg-surface-50 dark:bg-surface-900 border",
                    mode === "primary" && defaultBorderMixin,
                    mode === "secondary" && "ml-1"
                )}
            >
                <ChevronRightIcon size="small" />
            </button>
        )}
    </TabsPrimitive.Root>
    </TabsModeContext.Provider>
}

export type TabProps = {
    value: string,
    className?: string,
    innerClassName?: string,
    children: React.ReactNode,
    disabled?: boolean
};

export function Tab({
    value,
    className,
    innerClassName,
    children,
    disabled
}: TabProps) {
    const mode = useContext(TabsModeContext);

    const primaryClasses = cls(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-400 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "data-[state=active]:bg-white data-[state=active]:text-surface-900 dark:data-[state=active]:bg-surface-950 dark:data-[state=active]:text-surface-50",
    );

    const secondaryClasses = cls(
        "inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium transition-all",
        "border-b-2 border-transparent -mb-px",
        "focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-50",
        "hover:text-surface-700 dark:hover:text-surface-300",
        "data-[state=active]:border-b-primary data-[state=active]:text-primary dark:data-[state=active]:border-b-primary dark:data-[state=active]:text-primary-dark",
    );

    return <TabsPrimitive.Trigger value={value}
        disabled={disabled}
        className={cls(
            mode === "secondary" ? secondaryClasses : primaryClasses,
            className,
            innerClassName)}>
        {children}
    </TabsPrimitive.Trigger>;
}
