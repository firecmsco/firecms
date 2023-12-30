import React, { useCallback } from "react";
import { cardClickableMixin, cardMixin, focusedMixin } from "../styles";
import { cn } from "../util";

export function Card({
                         children,
                         style,
                         onClick,
                         className
                     }: {
    children: React.ReactNode;
    style?: React.CSSProperties;
    onClick?: () => void;
    className?: string;

}) {

    const onKeyPress = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" || e.key === " ") {
            onClick?.();
        }
    }, [onClick]);

    return (
        <div
            onKeyPress={onKeyPress}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            onClick={onClick}
            className={cn(cardMixin, onClick && focusedMixin, onClick && cardClickableMixin, className)}
            style={style}>
            {children}
        </div>
    )
}
