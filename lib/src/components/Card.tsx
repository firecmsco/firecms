import React from "react";
import { cardMixin, cardClickableMixin, focusedMixin } from "../styles";
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
            tabIndex={onClick ? 0 : undefined}
            onClick={onClick}
            className={cn(cardMixin, focusedMixin, onClick && cardClickableMixin, className)}
            style={style}>
            {children}
        </div>
    )
}
