"use client";
import React, { useEffect, useState, createContext, useContext } from "react";
import { cls } from "../util";
import { defaultBorderMixin } from "../styles";
import * as DialogPrimitive from "@radix-ui/react-dialog";

// Context to provide portal container to child components
const SheetPortalContext = createContext<HTMLElement | null>(null);

export const useSheetPortalContainer = () => useContext(SheetPortalContext);

interface SheetProps {
    children: React.ReactNode;
    open: boolean;
    title?: string;
    modal?: boolean;
    includeBackgroundOverlay?: boolean;
    side?: "top" | "bottom" | "left" | "right";
    darkBackground?: boolean;
    transparent?: boolean;
    onOpenChange?: (open: boolean) => void;
    className?: string;
    style?: React.CSSProperties;
    overlayClassName?: string;
    overlayStyle?: React.CSSProperties;
}

export const Sheet: React.FC<SheetProps> = ({
                                                children,
                                                side = "right",
                                                title,
                                                modal = true,
                                                includeBackgroundOverlay = true,
                                                open,
                                                onOpenChange,
                                                transparent,
                                                className,
                                                style,
                                                overlayClassName,
                                                overlayStyle,
                                                ...props
                                            }) => {
    const [displayed, setDisplayed] = useState(false);
    const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDisplayed(open);
        }, 1);
        return () => clearTimeout(timeout);
    }, [open]);

    const transformValue: Record<string, string> = {
        top: "-translate-y-full",
        bottom: "translate-y-full",
        left: "-translate-x-full",
        right: "translate-x-full"
    };

    const borderClass: Record<string, string> = {
        top: "border-b",
        bottom: "border-t",
        left: "border-r",
        right: "border-l"
    };

    return (
        <DialogPrimitive.Root open={displayed || open}
                              modal={modal}
                              onOpenChange={onOpenChange}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Title autoFocus tabIndex={0}>
                    {title ?? "Sheet"}
                </DialogPrimitive.Title>
                {includeBackgroundOverlay && <DialogPrimitive.Overlay
                    className={cls(
                        "outline-hidden",
                        "fixed inset-0 transition-opacity z-20 ease-in-out duration-100 backdrop-blur-xs",
                        "bg-black/50",
                        "dark:bg-surface-900/60",
                        displayed && open ? "opacity-100" : "opacity-0",
                        overlayClassName
                    )}
                    style={{
                        pointerEvents: displayed ? "auto" : "none",
                        ...overlayStyle
                    }}
                />}
                <DialogPrimitive.Content
                    {...props}
                    onFocusCapture={(event) => event.preventDefault()}
                    className={cls(
                        "outline-hidden",
                        borderClass[side],
                        defaultBorderMixin,
                        "transform-gpu",
                        "will-change-transform",
                        "text-surface-accent-900 dark:text-white",
                        "fixed transform z-20 transition-all ease-in-out",
                        !displayed ? "duration-150" : "duration-100",
                        "outline-hidden focus:outline-hidden",
                        transparent ? "" : "shadow-md bg-white dark:bg-surface-950",
                        side === "top" || side === "bottom" ? "w-full" : "h-full",
                        side === "left" || side === "top" ? "left-0 top-0" : "right-0 bottom-0",
                        displayed && open ? "opacity-100" : "opacity-50",
                        !displayed || !open ? transformValue[side] : "",
                        className
                    )}
                    style={style}
                >
                    <SheetPortalContext.Provider value={portalContainer}>
                        {children}
                    </SheetPortalContext.Provider>
                    {/* Portal container for child components */}
                    <div
                        ref={setPortalContainer}
                        className="fixed inset-0 pointer-events-none z-50"
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                    />
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
};
