import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Typography, TypographyProps, TypographyVariant } from "./Typography";
import { cls } from "../util";

export type DialogContentProps = TypographyProps & {
    children: React.ReactNode,
    hidden?: boolean,
    className?: string,
    includeMargin?: boolean,
    variant?: TypographyVariant
};

export function DialogTitle({
                                children,
                                hidden,
                                className,
                                variant = "subtitle2",
                                gutterBottom = true,
                                includeMargin = true,
                                ...props
                            }: DialogContentProps) {

    const title = <DialogPrimitive.Title asChild>
        <Typography variant={variant}
                    className={cls({ "mt-8 mx-6": includeMargin }, className)}
                    gutterBottom={gutterBottom}
                    {...props}>
            {children}
        </Typography>
    </DialogPrimitive.Title>;

    if (hidden) {
        return <VisuallyHidden.Root>{title}</VisuallyHidden.Root>
    }

    return title;
}
