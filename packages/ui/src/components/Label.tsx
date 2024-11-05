import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cls } from "../util";
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
        className={cls("text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            border && "border border-surface-300 dark:border-surface-700 rounded-md px-3 py-1.5",
            onClick && "hover:cursor-pointer hover:bg-surface-200 dark:hover:bg-surface-800",
            defaultBorderMixin, className)}
        {...props}
    />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
