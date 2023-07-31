import { useEffect, useState } from "react";
import clsx from "clsx";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { paperMixin } from "../styles";

export type DialogProps = {
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
    className?: string;
    fullWidth?: boolean;
    fullHeight?: boolean;
    maxWidth?: keyof typeof widthClasses;
};

const widthClasses = {
    xs: "max-w-xs min-w-xs w-xs",
    sm: "max-w-sm min-w-sm w-sm",
    md: "max-w-md min-w-md w-md",
    lg: "max-w-lg min-w-lg w-lg",
    xl: "max-w-xl min-w-xl w-xl",
    "2xl": "max-w-2xl min-w-2xl w-2xl",
    "3xl": "max-w-3xl min-w-3xl w-3xl",
    "4xl": "max-w-4xl min-w-4xl w-4xl",
    "5xl": "max-w-5xl min-w-5xl w-5xl",
    "6xl": "max-w-6xl min-w-6xl w-6xl",
    "7xl": "max-w-7xl min-w-7xl w-7xl",
    full: "max-w-full min-w-full w-full"
};

export const Dialog = ({
                           open,
                           onOpenChange,
                           children,
                           className,
                           fullWidth = true,
                           fullHeight,
                           maxWidth = "md",
                           ...props
                       }: DialogProps) => {
    const [displayed, setDisplayed] = useState(false);

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

    return (
        <DialogPrimitive.Root open={displayed || open}
                              onOpenChange={onOpenChange}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay
                    className={clsx("fixed inset-0 transition-opacity z-20 ease-in-out duration-200 bg-black bg-opacity-50 dark:bg-opacity-60 backdrop-blur-sm ",
                        displayed && open ? "opacity-100" : "opacity-0",
                        "z-20 fixed top-0 left-0 w-full h-full flex justify-center items-center"
                    )}
                    style={{
                        pointerEvents: displayed ? "auto" : "none"
                    }}
                >
                    <DialogPrimitive.Content
                        {...props}
                        className={clsx(paperMixin,
                            "z-20",
                            "relative",
                            // "overflow-auto",
                            "outline-none focus:outline-none",
                            fullWidth ? "w-11/12" : undefined,
                            fullHeight ? "h-full" : undefined,
                            "text-gray-900 dark:text-white",
                            "justify-center items-center",
                            "max-h-[90vh] shadow-xl",
                            "ease-in-out duration-200",
                            displayed && open ? "opacity-100" : "opacity-0",
                            maxWidth ? widthClasses[maxWidth] : undefined,
                            className
                        )}
                        style={{
                            // height: fullWidth ? undefined : "inherit",
                            // maxHeight: "calc(100% - 64px)",
                            overflowY: "auto"
                        }}
                    >
                        {children}

                    </DialogPrimitive.Content>
                </DialogPrimitive.Overlay>

            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
};

