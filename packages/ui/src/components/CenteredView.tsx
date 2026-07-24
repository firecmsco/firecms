"use client";
import React from "react";
import { Container } from "./Container";
import { cls } from "../util";

export type CenteredViewProps = {
    children: React.ReactNode;
    maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl";
    outerClassName?: string;
    className?: string;
    fullScreen?: boolean;
};

export const CenteredView = React.forwardRef<HTMLDivElement, CenteredViewProps>(({
                                                                                     children,
                                                                                     maxWidth,
                                                                                     outerClassName,
                                                                                     className,
                                                                                     fullScreen,
                                                                                     ...rest
                                                                                 }, ref) => { // Notice how the ref is now received as the second argument

    return (
        <div ref={ref}
             className={cls("flex flex-col grow", fullScreen ? "h-screen" : "h-full", outerClassName)}
             {...rest}>
            <Container className={cls("m-auto", className)} maxWidth={maxWidth}>
                {children}
            </Container>
        </div>
    );

});

CenteredView.displayName = "CenteredView";
