"use client";
import React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cls } from "../util";
import { useInjectStyles } from "../hooks";

export type TooltipProps = {
    open?: boolean,
    defaultOpen?: boolean,
    onOpenChange?: (open: boolean) => void,
    side?: "top" | "bottom" | "left" | "right",
    align?: "start" | "center" | "end",
    sideOffset?: number,
    title?: string | React.ReactNode,
    delayDuration?: number;
    asChild?: boolean;
    tooltipClassName?: string,
    tooltipStyle?: React.CSSProperties;
    children: React.ReactNode,
    className?: string,
    container?: HTMLElement,
    style?: React.CSSProperties;
};

export const Tooltip = ({
                            open,
                            defaultOpen,
                            side = "bottom",
                            delayDuration = 200,
                            sideOffset,
                            align,
                            onOpenChange,
                            title,
                            tooltipClassName,
                            tooltipStyle,
                            children,
                            asChild = false,
                            container,
                            className,
                            style
                        }: TooltipProps) => {

    useInjectStyles("Tooltip", styles);

    if (!title)
        return <>{children}</>;

    const trigger = asChild
        ? <TooltipPrimitive.Trigger asChild={true}>
            {children}
        </TooltipPrimitive.Trigger>
        : <TooltipPrimitive.Trigger asChild={true}>
            <div style={style} className={className}>
                {children}
            </div>
        </TooltipPrimitive.Trigger>;

    return (
        <TooltipPrimitive.Provider delayDuration={delayDuration}>
            <TooltipPrimitive.Root open={open} onOpenChange={onOpenChange} defaultOpen={defaultOpen}>
                {trigger}
                <TooltipPrimitive.Portal container={container}>
                    <TooltipPrimitive.Content
                        className={cls("TooltipContent",
                            "max-w-lg leading-relaxed",
                            "z-50 rounded px-3 py-2 text-xs leading-none bg-slate-700 dark:bg-slate-800 bg-opacity-90 font-medium text-slate-50 shadow-2xl select-none duration-400 ease-in transform opacity-100",
                            tooltipClassName)}
                        style={tooltipStyle}
                        sideOffset={sideOffset === undefined ? 4 : sideOffset}
                        align={align}
                        side={side}>
                        {title}
                        {/*<TooltipPrimitive.Arrow className="fill-slate-600"/>*/}
                    </TooltipPrimitive.Content>
                </TooltipPrimitive.Portal>
            </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
    );
};

const styles = `

.TooltipContent {
  animation-duration: 220ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
}

.TooltipContent[data-state='delayed-open'][data-side='top'] {
  animation-name: slideDownAndFade;
}
.TooltipContent[data-state='delayed-open'][data-side='right'] {
  animation-name: slideLeftAndFade;
}
.TooltipContent[data-state='delayed-open'][data-side='bottom'] {
  animation-name: slideUpAndFade;
}
.TooltipContent[data-state='delayed-open'][data-side='left'] {
  animation-name: slideRightAndFade;
}


@keyframes slideUpAndFade {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideRightAndFade {
  from {
    opacity: 0;
    transform: translateX(-4px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideDownAndFade {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideLeftAndFade {
  from {
    opacity: 0;
    transform: translateX(4px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}`;
