import * as SeparatorPrimitive from "@radix-ui/react-separator";

export function Separator({ orientation, decorative }: {
    orientation: "horizontal" | "vertical",
    decorative?: boolean
}) {
    if (orientation === "horizontal")
        return (
            <SeparatorPrimitive.Root
                decorative={decorative}
                orientation="horizontal"
                className="dark:bg-opacity-50 bg-opacity-50 dark:bg-gray-400 bg-gray-500 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px my-[8px]"/>
        );
    else
        return (
            <SeparatorPrimitive.Root
                className="dark:bg-opacity-50 bg-opacity-50 dark:bg-gray-400 bg-gray-500 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px mx-[8px]"
                decorative={decorative}
                orientation="vertical"
            />
        );
}
