import { useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { paperMixin } from "../styles";
import { cn } from "./util/cn";

export type DialogProps = {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
    className?: string;
    fullWidth?: boolean;
    fullHeight?: boolean;
    scrollable?: boolean;
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
                           scrollable = true,
                           maxWidth = "md"
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

                <div className={"fixed inset-0 z-20"}>

                    <DialogPrimitive.Overlay
                        className={cn("fixed inset-0 transition-opacity z-20 ease-in-out duration-200 bg-black bg-opacity-50 dark:bg-opacity-60 backdrop-blur-sm ",
                            displayed && open ? "opacity-100" : "opacity-0",
                            "z-20 fixed top-0 left-0 w-full h-full flex justify-center items-center"
                        )}
                        style={{
                            pointerEvents: displayed ? "auto" : "none"
                        }}
                    />

                    <DialogPrimitive.Content
                        className={cn("h-full outline-none flex justify-center items-center z-30 opacity-100 transition-all duration-200 ease-in-out")}
                    >
                        <div
                            className={cn(paperMixin,
                                // "text-gray-900 dark:text-white",
                                // "m-8 relative overflow-y-auto flex flex-col max-h-full",
                                // maxWidth ? widthClasses[maxWidth] : undefined,
                                "z-30",
                                "relative",
                                "outline-none focus:outline-none",
                                fullWidth ? "w-11/12" : undefined,
                                fullHeight ? "h-full" : undefined,
                                "text-gray-900 dark:text-white",
                                "justify-center items-center",
                                "max-h-[90vh] shadow-xl",
                                "ease-in-out duration-200",
                                scrollable && "overflow-y-auto",
                                displayed && open ? "opacity-100" : "opacity-0",
                                maxWidth ? widthClasses[maxWidth] : undefined,
                                className
                            )}
                            style={{
                                // height: fullWidth ? undefined : "inherit",
                                // maxHeight: "calc(100% - 64px)",
                                // backgroundColor: 'rgb(18, 18, 21)',
                                // color: 'rgb(255, 255, 255)',
                                // transition: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
                                // borderRadius: '6px',
                                // boxShadow: 'rgba(0, 0, 0, 0.2) 0px 11px 15px -7px, rgba(0, 0, 0, 0.14) 0px 24px 38px 3px, rgba(0, 0, 0, 0.12) 0px 9px 46px 8px',
                                // margin: '32px',
                                // position: 'relative',
                                // overflowY: 'auto',
                                // display: 'flex',
                                // flexDirection: 'column',
                                // maxHeight: 'calc(100% - 64px)',
                                // maxWidth: '1200px',
                                // width: 'calc(100% - 64px)',
                                // backgroundImage: 'inherit'
                            }}>
                            {children}
                        </div>

                    </DialogPrimitive.Content>
                </div>

            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
};

