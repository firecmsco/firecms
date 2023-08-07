import React from "react";
import { cardMixin, cardClickableMixin } from "../styles";
import { cn } from "./util/cn";

export function Card({
                         children,
                         style,
                         onClick,
                         className,
                     }: {
    children: React.ReactNode;
    style?: React.CSSProperties;
    onClick?: () => void;
    className?: string;

}) {
    return (
        <div
            onClick={onClick}
            className={cn(cardMixin, onClick && cardClickableMixin, className)}
            style={style}>
            {children}
        </div>
    )
}
