import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { cls } from "../util";

export interface RadioGroupProps {
    id?: string;
    children: React.ReactNode;
    name?: string
    required?: boolean;
    disabled?: boolean;
    /**
     * Whether keyboard navigation should loop around
     * @defaultValue false
     */
    loop?: boolean;
    defaultValue?: string;
    value?: string;

    onValueChange?(value: string): void;

    className?: string;
}

const RadioGroup = React.forwardRef<
    React.ElementRef<typeof RadioGroupPrimitive.Root>,
    RadioGroupProps
>(({
       className,
       ...props
   }, ref) => {
    return (
        <RadioGroupPrimitive.Root
            className={cls("grid gap-2", className)}
            {...props}
            ref={ref}
        />
    )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

export interface RadioGroupItemProps {
    id?: string;
    value: string;
    checked?: boolean;
    required?: boolean;
    className?: string;
    disabled?: boolean;
}
const RadioGroupItem = React.forwardRef<
    React.ElementRef<typeof RadioGroupPrimitive.Item>,
    RadioGroupItemProps
>(({
       className,
       ...props
   }, ref) => {
    return (
        <RadioGroupPrimitive.Item
            ref={ref}
            className={cls(
                "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        >
            <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
                <div className="h-2.5 w-2.5 fill-current text-current bg-primary rounded-lg"/>
            </RadioGroupPrimitive.Indicator>
        </RadioGroupPrimitive.Item>
    )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
