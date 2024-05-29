import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cn } from "../util";
import { defaultBorderMixin } from "../styles";

type LabelProps = React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
    border?: boolean,
    onClick?: React.MouseEventHandler<HTMLLabelElement>
};
const Label = React.forwardRef<
    React.ElementRef<typeof LabelPrimitive.Root>,
    LabelProps
>(({
       className,
       border,
       onClick,
       ...props
   }, ref) => (
    <LabelPrimitive.Root
        ref={ref}
        onClick={onClick}
        className={cn("text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            border && "border border-gray-300 dark:border-gray-700 rounded-md px-3 py-1.5",
            onClick && "hover:cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800",
            defaultBorderMixin, className)}
        {...props}
    />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
