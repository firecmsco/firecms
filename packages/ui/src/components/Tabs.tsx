import React, { createContext, useContext, useRef, useState, useEffect } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cls } from "../util";
import { defaultBorderMixin } from "../styles";

export type TabVariant = "standard" | "boxy" | "pill";

const TabsContext = createContext<{ variant: TabVariant }>({ variant: "standard" });
import { IconButton } from "./IconButton";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons";

export type TabsProps = {
    value: string,
    children: React.ReactNode,
    innerClassName?: string,
    className?: string,
    variant?: TabVariant,
    onValueChange: (value: string) => void
};

export function Tabs({
    value,
    onValueChange,
    className,
    innerClassName,
    variant = "standard",
    children
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

    return <TabsContext.Provider value={{ variant }}>
        <TabsPrimitive.Root
            value={value}
            onValueChange={onValueChange}
            className={cls("relative flex flex-row items-center min-w-0 w-full", className)}
        >
            {isScrollable && (
                <button
                    type="button"
                    disabled={!showLeftScroll}
                    onClick={() => scroll("left")}
                    className={cls(
                        "absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center rounded-md transition-all h-8 w-6",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-400",
                        !showLeftScroll ? "pointer-events-none opacity-0" : "text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-800",
                        "bg-surface-50 dark:bg-surface-900 border shadow-sm", defaultBorderMixin
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
                    variant === "standard" && "inline-flex h-10 items-center justify-start rounded-md bg-surface-50 p-1 text-surface-600 dark:bg-surface-900 dark:text-surface-400 gap-2 border",
                    variant === "standard" && defaultBorderMixin,
                    variant === "boxy" && "flex items-center h-full",
                    variant === "pill" && "flex items-center gap-0.5",
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
                        "absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center rounded-md transition-all h-8 w-6",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-400",
                        !showRightScroll ? "pointer-events-none opacity-0" : "text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-800",
                        "bg-surface-50 dark:bg-surface-900 border shadow-sm", defaultBorderMixin
                    )}
                >
                    <ChevronRightIcon size="small" />
                </button>
            )}
        </TabsPrimitive.Root>
    </TabsContext.Provider>;
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
    const { variant } = useContext(TabsContext);

    return (
        <TabsPrimitive.Trigger
            value={value}
            disabled={disabled}
            className={cls(
                "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-white transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-400 focus-visible:ring-offset-2",
                "disabled:pointer-events-none disabled:opacity-50",
                variant === "standard" && "rounded-sm px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-surface-900 dark:data-[state=active]:bg-surface-950 dark:data-[state=active]:text-surface-50",
                variant === "boxy" && cls(
                    "flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 border-r border-surface-200 dark:border-surface-800 cursor-pointer text-[12px] font-medium transition-colors group relative",
                    "data-[state=active]:bg-surface-50 dark:data-[state=active]:bg-surface-800",
                    "data-[state=active]:text-text-primary dark:data-[state=active]:text-text-primary-dark",
                    "data-[state=active]:border-b-2 data-[state=active]:border-b-primary",
                    "text-text-secondary dark:text-text-secondary-dark hover:bg-surface-100 dark:hover:bg-surface-800"
                ),
                variant === "pill" && cls(
                    "px-2 py-0.5 rounded text-[10px] font-medium transition-colors",
                    "data-[state=active]:bg-primary/10 data-[state=active]:text-primary dark:data-[state=active]:bg-primary/20 dark:data-[state=active]:text-blue-400",
                    "text-text-disabled dark:text-text-disabled-dark hover:text-text-secondary dark:hover:text-text-secondary-dark"
                ),
                className,
                variant === "standard" && innerClassName
            )}
        >
            {children}
        </TabsPrimitive.Trigger>
    );
}
