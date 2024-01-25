import React from "react";
import { Container } from "./Container";
import { cn } from "../util";

export function CenteredView({
                                 children,
                                 maxWidth,
                                 className
                             }: {
    children: React.ReactNode;
    maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl";
    className?: string;
}) {

    return <div className={"flex flex-col flex-grow h-full"}>
        <Container className={cn("m-auto", className)}
                   maxWidth={maxWidth}>
            {children}
        </Container>
    </div>

}
