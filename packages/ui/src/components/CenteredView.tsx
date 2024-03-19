import React from "react";
import { Container } from "./Container";
import { cn } from "../util";

export function CenteredView({
                                 children,
                                 maxWidth,
                                 className,
                                 fullScreen
                             }: {
    children: React.ReactNode;
    maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl";
    className?: string;
    fullScreen?: boolean;
}) {

    return <div className={cn("flex flex-col flex-grow", fullScreen ? "h-screen" : "h-full")}>
        <Container className={cn("m-auto", className)}
                   maxWidth={maxWidth}>
            {children}
        </Container>
    </div>

}
