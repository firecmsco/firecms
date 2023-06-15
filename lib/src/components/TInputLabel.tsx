import * as React from "react";
import clsx from "clsx";

export type InputLabelProps = {
    children?: React.ReactNode;
    className?: string;
    shrink?: boolean;
} & React.LabelHTMLAttributes<HTMLLabelElement>;

const TInputLabel = React.forwardRef<HTMLLabelElement, InputLabelProps>(function InputLabel(inProps, ref) {
    const {
        shrink,
        className,
        ...other
    } = inProps;

    const defaultClasses = {
        root: "absolute transition-transform block whitespace-nowrap overflow-hidden text-overflow-ellipsis max-w-full",
        shrink: "transform translate-y-[2px] scale-75",
        expanded: "absolute translate-x-[14px] top-0 transform translate-y-[16px] scale-100"
    };

    const computedClassName = clsx(defaultClasses.root,
        className, {
        [defaultClasses.shrink]: shrink,
        [defaultClasses.expanded]: !shrink
    });

    return (
        <label
            data-shrink={shrink}
            ref={ref}
            className={computedClassName}
            {...other}
        />
    );
});

export default TInputLabel;
