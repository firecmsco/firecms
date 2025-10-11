"use client";
import React, { useEffect, useState } from "react";
import { cls } from "../util";
import { defaultBorderMixin } from "../styles";
import * as DialogPrimitive from "@radix-ui/react-dialog";

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
                        "outline-none",
                        "fixed inset-0 transition-opacity z-20 ease-in-out duration-100 backdrop-blur-sm",
                        "bg-black bg-opacity-50 dark:bg-opacity-60",
                        "bg-black/50 dark:bg-surface-900/60",
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
                        "outline-none",
                        borderClass[side],
                        defaultBorderMixin,
                        "transform-gpu",
                        "will-change-transform",
                        "text-text-primary dark:text-text-primary-dark",
                        "fixed transform z-20 transition-all ease-in-out",
                        !displayed ? "duration-150" : "duration-100",
                        "outline-none focus:outline-none",
                        transparent ? "" : "shadow-md bg-surface dark:bg-surface-dark",
                        side === "top" || side === "bottom" ? "w-full" : "h-full",
                        side === "left" || side === "top" ? "left-0 top-0" : "right-0 bottom-0",
                        displayed && open ? "opacity-100" : "opacity-50",
                        !displayed || !open ? transformValue[side] : "",
                        className
                    )}
                    style={style}
                >
                    {children}
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
};
