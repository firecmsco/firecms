import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cls } from "../util";

export function Separator({
                              orientation,
                              decorative,
                              className
                          }: {
    orientation: "horizontal" | "vertical",
    decorative?: boolean,
    className?: string
}) {
    if (orientation === "horizontal")
        return (
            <SeparatorPrimitive.Root
                decorative={decorative}
                orientation="horizontal"
                className={cls("dark:bg-surface-800/80 bg-surface-100 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px my-4", className)}/>
        );
    else
        return (
            <SeparatorPrimitive.Root
                className={cls("dark:bg-surface-800/80 bg-surface-100 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px mx-4", className)}
                decorative={decorative}
                orientation="vertical"
            />
        );
}
