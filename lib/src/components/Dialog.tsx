import { useEffect, useState } from "react";
import clsx from "clsx";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { paperMixin } from "../styles";

export type DialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
};

export const Dialog = ({
                           open,
                           onOpenChange,
                           children,
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
                    className={`fixed inset-0 transition-opacity z-20 ease-in-out duration-200 bg-black bg-opacity-50 dark:bg-opacity-60 backdrop-blur-sm ${
                        displayed && open ? "opacity-100" : "opacity-0"
                    }`}
                    style={{
                        pointerEvents: displayed ? "auto" : "none"
                    }}
                />
                <DialogPrimitive.Content
                    {...props}
                    className={clsx(paperMixin,
                        "z-20 shadow-xl fixed top-1/2 left-1/2 transform-gpu -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-lg max-h-screen-90",
                        displayed && open ? "opacity-100" : "opacity-0"
                    )}
                >
                    {children}
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
};
