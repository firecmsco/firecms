import React, { useEffect } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cls } from "../util";

interface SheetProps {
    children: React.ReactNode;
    open: boolean;
    side?: "top" | "bottom" | "left" | "right";
    transparent?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export const Sheet: React.FC<SheetProps> = ({
                                                children,
                                                side = "right",
                                                open,
                                                onOpenChange,
                                                transparent,
                                                ...props
                                            }) => {

    const [displayed, setDisplayed] = React.useState(false);

    useEffect(() => {
        if (!open) {
            const timeout = setTimeout(() => {
                setDisplayed(false);
            }, 250);
            return () => clearTimeout(timeout);
        } else {
            setDisplayed(true);
            return () => {
            };
        }
    }, [open]);

    const transformValue: Record<string, string> = {
        top: "-translate-y-full",
        bottom: "translate-y-full",
        left: "-translate-x-full",
        right: "translate-x-full"
    };

    return (

        <DialogPrimitive.Root open={displayed || open}
                              onOpenChange={onOpenChange}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay
                    className={cls(
                        "fixed inset-0 transition-opacity z-20 ease-in-out duration-200  backdrop-blur-sm",
                        "bg-white bg-opacity-80",
                        "dark:bg-gray-900 dark:bg-opacity-60",
                        displayed && open ? "opacity-100" : "opacity-0"
                    )}
                    style={{
                        pointerEvents: displayed ? "auto" : "none",
                    }}
                />
                <DialogPrimitive.Content
                    {...props}
                    className={cls(
                        "transform-gpu",
                        "will-change-transform",
                        "text-slate-900 dark:text-white",
                        "fixed transform z-20 transition-all duration-[240ms] ease-in-out",
                        "outline-none focus:outline-none",
                        transparent ? "" : "shadow-md bg-white dark:bg-gray-950",
                        side === "top" || side === "bottom" ? "w-full" : "h-full",
                        side === "left" || side === "top" ? "left-0 top-0" : "right-0 bottom-0",
                        displayed && open ? "opacity-100" : "opacity-0",
                        !displayed || !open ? transformValue[side] : "")
                    }
                >
                    {children}
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
};
