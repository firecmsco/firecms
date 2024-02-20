import React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn, useInjectStyles } from "../util";

export type TooltipProps = {
    open?: boolean,
    onOpenChange?: (open: boolean) => void,
    side?: "top" | "bottom" | "left" | "right",
    sideOffset?: number,
    title?: string | React.ReactNode,
    delayDuration?: number;
    className?: string,
    tooltipClassName?: string,
    children: React.ReactNode,
    style?: React.CSSProperties;
};

export const Tooltip = ({
                            open,
                            side = "bottom",
                            delayDuration = 250,
                            sideOffset,
                            onOpenChange,
                            title,
                            className,
                            style,
                            tooltipClassName,
                            children
                        }: TooltipProps) => {

    useInjectStyles("Tooltip", styles);

    if (!title)
        return <>{children}</>;

    return (
        <TooltipPrimitive.Provider delayDuration={delayDuration}>
            <TooltipPrimitive.Root open={open} onOpenChange={onOpenChange}>
                <TooltipPrimitive.Trigger asChild>
                    <div className={className} style={style}>
                        {children}
                    </div>
                </TooltipPrimitive.Trigger>
                <TooltipPrimitive.Portal>
                    <TooltipPrimitive.Content
                        className={cn("TooltipContent",
                            "max-w-lg leading-relaxed",
                            "z-50 rounded px-3 py-2 text-xs leading-none bg-slate-700 dark:bg-slate-800 bg-opacity-90 font-medium text-slate-50 shadow-2xl select-none duration-400 ease-in transform opacity-100",
                            tooltipClassName)}
                        sideOffset={sideOffset === undefined ? 4 : sideOffset}
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
