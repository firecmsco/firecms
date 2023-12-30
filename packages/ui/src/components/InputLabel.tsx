import * as React from "react";
import { cn } from "../util";

export type InputLabelProps = {
    children?: React.ReactNode;
    className?: string;
    shrink?: boolean;
} & React.LabelHTMLAttributes<HTMLLabelElement>;

export const InputLabel = React.forwardRef<HTMLLabelElement, InputLabelProps>(function InputLabel(inProps, ref) {
    const {
        shrink,
        className,
        ...other
    } = inProps;

    const defaultClasses = {
        root: "origin-left transition-transform block whitespace-nowrap overflow-hidden text-overflow-ellipsis max-w-full",
        shrink: "transform translate-y-[2px] scale-75 translate-x-[12px]",
        expanded: "translate-x-[16px] top-0 transform translate-y-[16px] scale-100"
    };

    const computedClassName = cn(defaultClasses.root,
        {
            [defaultClasses.shrink]: shrink,
            [defaultClasses.expanded]: !shrink
        }, className);

    return (
        <label
            data-shrink={shrink}
            ref={ref}
            className={computedClassName}
            {...other}
        />
    );
});
