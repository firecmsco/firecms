import React from "react";
import { Button, ButtonProps } from "./Button";
import { CircularProgress } from "./CircularProgress";

export type LoadingButtonProps<P extends React.ElementType> = ButtonProps<P> & {
    startIcon?: React.ReactNode;
    loading?: boolean;
}

export function LoadingButton<P extends React.ElementType = "button">({
                                                                          children,
                                                                          loading,
                                                                          disabled,
                                                                          onClick,
                                                                          startIcon,
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
                <CircularProgress size={"small"}/>
            )}
            {!loading && startIcon}
            {children}
        </Button>
    );
};
