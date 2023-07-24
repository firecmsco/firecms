import React from "react";
import { Button, ButtonProps } from "./Button";
import { CircularProgress } from "./CircularProgress";

export type LoadingButtonProps<P> = ButtonProps<P> & {
    loading?: boolean;
}

export function LoadingButton<P = any>({
                                           children,
                                           loading,
                                           disabled,
                                           onClick,
                                           ...props
                                       }: LoadingButtonProps<P>) {
    return (
        <Button
            disabled={loading || disabled}
            onClick={onClick}
            component={props.component as any}
            {...props}
        >
            {loading && (
                <CircularProgress/>
            )}
            {children}
        </Button>
    );
};
