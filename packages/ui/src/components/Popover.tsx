"use client";
import React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { paperMixin } from "../styles";
import { cls } from "../util";
import { useInjectStyles } from "../hooks";
import { useShadowPortal } from "../hooks/useShadowPortal";

export type PopoverSide = "top" | "right" | "bottom" | "left";
export type PopoverAlign = "start" | "center" | "end";

export interface PopoverProps {
    trigger: React.ReactNode;
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    side?: PopoverSide;
    sideOffset?: number;
    align?: PopoverAlign;
    alignOffset?: number;
    arrowPadding?: number;
    sticky?: "partial" | "always";
    hideWhenDetached?: boolean;
    avoidCollisions?: boolean;
    enabled?: boolean;
    modal?: boolean;
    className?: string;
    portalContainer?: HTMLElement | null;
}

export function Popover({
                            trigger,
                            children,
                            open,
                            onOpenChange,
                            side,
                            sideOffset = 5,
                            align,
                            alignOffset,
                            arrowPadding,
                            sticky,
                            hideWhenDetached,
                            avoidCollisions,
                            enabled = true,
                            modal = false,
                            portalContainer,
                            className
                        }: PopoverProps) {

    useInjectStyles("Popover", popoverStyles);

    // 1. Get the detection ref and the auto-detected container
    const {
        ref: detectRef,
        container: shadowContainer
    } = useShadowPortal();

    // 2. Prioritize manual prop, fallback to auto-detected container
    // We cast to HTMLElement because Radix types are strict about null vs undefined
    const finalContainer = (portalContainer || shadowContainer) as HTMLElement | undefined;

    if (!enabled)
        return <>{trigger}</>;

    return <PopoverPrimitive.Root open={open}
                                  onOpenChange={onOpenChange}
                                  modal={modal}>

        {/* 3. Attach the detection ref here.
            Radix handles merging this ref with the child's existing ref automatically. */}
        <PopoverPrimitive.Trigger asChild ref={detectRef}>
            {trigger}
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal container={finalContainer}>
            <PopoverPrimitive.Content
                className={cls(paperMixin,
                    "PopoverContent z-40", className)}
                side={side}
                sideOffset={sideOffset}
                align={align}
                alignOffset={alignOffset}
                arrowPadding={arrowPadding}
                sticky={sticky}
                hideWhenDetached={hideWhenDetached}
                avoidCollisions={avoidCollisions}>

                {children}
                <PopoverPrimitive.Arrow className="fill-white dark:fill-surface-accent-950"/>
            </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>;
}

const popoverStyles = `
/* ... (styles remain unchanged) ... */
.PopoverContent {
  animation-duration: 400ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
}
.PopoverContent[data-state='open'][data-side='top'] {
  animation-name: slideDownAndFade;
}
.PopoverContent[data-state='open'][data-side='right'] {
  animation-name: slideLeftAndFade;
}
.PopoverContent[data-state='open'][data-side='bottom'] {
  animation-name: slideUpAndFade;
}
.PopoverContent[data-state='open'][data-side='left'] {
  animation-name: slideRightAndFade;
}

@keyframes slideUpAndFade {
  from {
    opacity: 0;
    transform: translateY(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideRightAndFade {
  from {
    opacity: 0;
    transform: translateX(-2px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideDownAndFade {
  from {
    opacity: 0;
    transform: translateY(-2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideLeftAndFade {
  from {
    opacity: 0;
    transform: translateX(2px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
`;
