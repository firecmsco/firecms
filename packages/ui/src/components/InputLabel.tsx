import * as React from "react";
import { cls } from "../util";
import { Label } from "./Label";
import { defaultBorderMixin } from "../styles";

export type InputLabelProps = {
    children?: React.ReactNode;
    className?: string;
    shrink?: boolean;
} & React.LabelHTMLAttributes<HTMLLabelElement>;

const defaultClasses = {
    root: "origin-left transition-transform block whitespace-nowrap overflow-hidden text-overflow-ellipsis max-w-full",
    shrink: "transform translate-y-[2px] scale-75 translate-x-[12px]",
    expanded: "translate-x-[16px] top-0 transform translate-y-[16px] scale-100"
};

export const InputLabel = React.forwardRef<HTMLLabelElement, InputLabelProps>(function InputLabel(inProps, ref) {
    const {
        shrink,
        className,
        ...other
    } = inProps;

    const computedClassName = cls(defaultClasses.root,
        {
            [defaultClasses.shrink]: shrink,
            [defaultClasses.expanded]: !shrink
        }, className);

    return (
        <label
            className={cls("text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                defaultBorderMixin, computedClassName)}
            data-shrink={shrink}
            ref={ref}
            {...other}
        />
    );
});
