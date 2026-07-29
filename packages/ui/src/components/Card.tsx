"use client";
import React, { useCallback } from "react";
import { cardClickableMixin, cardMixin } from "../styles";
import { cls } from "../util";

type CardProps = {
    children: React.ReactNode;
    style?: React.CSSProperties;
    onClick?: (e?: React.MouseEvent) => void;
    className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

const Card = React.forwardRef<HTMLDivElement, CardProps>(({
    children,
    className,
    onClick,
    style,
    onKeyDown: onKeyDownProp,
    ...props
}, ref) => {

    const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        // Always let a caller supplied handler run first, and let it opt out of
        // the default activation by calling preventDefault().
        onKeyDownProp?.(e);
        if (!onClick || e.defaultPrevented)
            return;
        // Only activate when the card itself is focused. Cards may render their
        // own focusable children (e.g. action buttons), which handle their own
        // activation; their key events must not activate the card as well.
        if (e.target !== e.currentTarget)
            return;
        if (e.key === "Enter" || e.key === " ") {
            // Without this, Space also performs its default browser action and
            // scrolls the page away from the focused card.
            e.preventDefault();
            onClick();
        }
    }, [onClick, onKeyDownProp]);

    return (
        <div
            ref={ref}
            onKeyDown={onKeyDown}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            onClick={onClick}
            className={cls(cardMixin, onClick && cardClickableMixin, className)}
            style={style}
            {...props}>
            {children}
        </div>
    );
});

Card.displayName = "Card";

export { Card };
