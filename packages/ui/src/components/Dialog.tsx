"use client";
import React, { useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { paperMixin } from "../styles";
import { cls } from "../util";

export type DialogProps = {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
    className?: string;
    containerClassName?: string;
    fullWidth?: boolean;
    fullHeight?: boolean;
    fullScreen?: boolean;
    scrollable?: boolean;
    maxWidth?: keyof typeof widthClasses;
    modal?: boolean;
    onOpenAutoFocus?: (e: Event) => void;
    onEscapeKeyDown?: (e: KeyboardEvent) => void;
    onPointerDownOutside?: (e: Event) => void;
    onInteractOutside?: (e: Event) => void;
    /**
     * If `true`, the dialog will not focus the first focusable element when opened.
     */
    disableInitialFocus?: boolean;
};

const widthClasses = {
    xs: "max-w-xs w-xs",
    sm: "max-w-sm w-sm",
    md: "max-w-md w-md",
    lg: "max-w-lg w-lg",
    xl: "max-w-xl w-xl",
    "2xl": "max-w-2xl w-2xl",
    "3xl": "max-w-3xl w-3xl",
    "4xl": "max-w-4xl w-4xl",
    "5xl": "max-w-5xl w-5xl",
    "6xl": "max-w-6xl w-6xl",
    "7xl": "max-w-7xl w-7xl",
    full: "max-w-full w-full"
};

export const Dialog = ({
                           open,
                           onOpenChange,
                           children,
                           className,
                           containerClassName,
                           fullWidth = true,
                           fullHeight,
                           fullScreen,
                           scrollable = true,
                           maxWidth = "lg",
                           modal = true,
                           onOpenAutoFocus,
                           onEscapeKeyDown,
                           onPointerDownOutside,
                           onInteractOutside,
                           disableInitialFocus = true
                       }: DialogProps) => {
    const [displayed, setDisplayed] = useState(false);

    useEffect(() => {
        if (!open) {
            const timeout = setTimeout(() => {
                setDisplayed(false);
            }, 150);
            return () => clearTimeout(timeout);
        } else {
            setDisplayed(true);
            return () => {
            };
        }
    }, [open]);

    return (
        <DialogPrimitive.Root open={displayed || open}
                              modal={modal}
                              onOpenChange={onOpenChange}>
            <DialogPrimitive.Portal>

                <div className={cls("fixed inset-0 z-30", containerClassName)}>

                    <DialogPrimitive.Overlay
                        className={cls("fixed inset-0 transition-opacity z-20 ease-in-out duration-200 bg-black dark:bg-opacity-60 bg-opacity-50 bg-black/50 dark: bg-black/60  backdrop-blur-sm ",
                            displayed && open ? "opacity-100" : "opacity-0",
                            "z-20 fixed top-0 left-0 w-full h-full flex justify-center items-center"
                        )}
                        style={{
                            pointerEvents: displayed ? "auto" : "none"
                        }}
                    />

                    <DialogPrimitive.Content
                        onEscapeKeyDown={onEscapeKeyDown}
                        onOpenAutoFocus={(e) => {
                            if (disableInitialFocus) {
                                e.preventDefault();
                            }
                            onOpenAutoFocus?.(e);
                        }}
                        onPointerDownOutside={onPointerDownOutside}
                        onInteractOutside={onInteractOutside}
                        className={cls("h-full outline-none flex justify-center items-center z-40 opacity-100 transition-all duration-200 ease-in-out")}
                    >
                        <div
                            className={cls(paperMixin,
                                "z-30",
                                "relative",
                                "outline-none focus:outline-none",
                                fullWidth && !fullScreen ? "w-11/12" : undefined,
                                fullHeight && !fullScreen ? "h-full" : undefined,
                                "text-surface-accent-900 dark:text-white",
                                "justify-center items-center",
                                fullScreen ? "h-screen w-screen" : "max-h-[90vh] shadow-xl",
                                "ease-in-out duration-200",
                                scrollable && "overflow-y-auto",
                                displayed && open ? "opacity-100" : "opacity-0",
                                maxWidth && !fullScreen ? widthClasses[maxWidth] : undefined,
                                className
                            )}>
                            {children}
                        </div>

                    </DialogPrimitive.Content>
                </div>

            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
};
