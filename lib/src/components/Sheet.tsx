import React, { useEffect } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

interface SheetProps {
    children: React.ReactNode;
    open: boolean;
    side?: "top" | "bottom" | "left" | "right";
    onOpenChange?: (open: boolean) => void;
}

export const Sheet: React.FC<SheetProps> = ({
                                                children,
                                                side = "right",
                                                open,
                                                onOpenChange,
                                                ...props
                                            }) => {

    const [displayed, setDisplayed] = React.useState(false);

    useEffect(() => {
        if (!open) {
            const timeout2 = setTimeout(() => {
                setDisplayed(false);
            }, 200);
            return () => clearTimeout(timeout2);
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

    console.log({
        displayed,
        open
    })

    return (

        <DialogPrimitive.Root open={displayed || open}
                              onOpenChange={onOpenChange}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay
                    className={`fixed inset-0 transition-opacity duration-200 bg-black bg-opacity-30 ${
                        displayed && open ? "opacity-100" : "opacity-0"
                    }`}
                    style={{
                        pointerEvents: displayed ? "auto" : "none",
                    }}
                />
                <DialogPrimitive.Content
                    {...props}
                    className={`fixed transform bg-white shadow-md z-[1300] transition-transform duration-200 ease-in-out
                ${side === "top" || side === "bottom" ? "w-full h-80" : "h-full w-64"}
                ${side === "left" || side === "top" ? "left-0 top-0" : "right-0 bottom-0"}
                ${!displayed || !open ? transformValue[side] : ""}`}
                >
                    {children}
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
};
