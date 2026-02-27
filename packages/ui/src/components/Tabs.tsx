import React, { createContext, useContext, useRef, useState, useEffect } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cls } from "../util";
import { defaultBorderMixin } from "../styles";

export type TabVariant = "standard" | "underline" | "invisible";

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
                    variant === "underline" && "inline-flex text-sm font-medium text-center text-surface-accent-800 dark:text-white items-end",
                    variant === "invisible" && "inline-flex h-10 items-center justify-start gap-2",
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
                variant === "underline" && cls(
                    "border-b-2 border-transparent data-[state=active]:border-secondary",
                    disabled
                        ? "text-surface-accent-400 dark:text-surface-accent-500"
                        : "text-surface-accent-700 dark:text-surface-accent-300 data-[state=active]:text-surface-accent-900 data-[state=active]:dark:text-white hover:text-surface-accent-800 dark:hover:text-surface-accent-200"
                ),
                variant === "invisible" && "rounded-sm px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-surface-900 dark:data-[state=active]:bg-surface-950 dark:data-[state=active]:text-surface-50",
                className,
                variant !== "underline" && innerClassName
            )}
        >
            {variant === "underline" ? (
                <div className={cls("line-clamp-1 inline-block p-2 px-4 rounded hover:bg-surface-accent-200 hover:bg-opacity-75 dark:hover:bg-surface-accent-800", innerClassName)}>
                    {children}
                </div>
            ) : (
                children
            )}
        </TabsPrimitive.Trigger>
    );
}
