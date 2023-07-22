import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import clsx from "clsx";

import { useInjectStyles } from "./util/useInjectStyles";

export type TooltipProps = {
    open?: boolean,
    placement?: "top" | "bottom" | "left" | "right",
    title?: string,
    className?: string,
    tooltipClassName?: string,
    children: React.ReactNode,
    style?: React.CSSProperties
};

export const Tooltip = ({
                            open,
                            placement = "bottom",
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
        <TooltipPrimitive.Provider delayDuration={250}>
            <TooltipPrimitive.Root open={open}>
                <TooltipPrimitive.Trigger asChild>
                    <div className={className} style={style}>
                        {children}
                    </div>
                </TooltipPrimitive.Trigger>
                <TooltipPrimitive.Portal>
                    <TooltipPrimitive.Content
                        className={clsx("TooltipContent",
                            "max-w-lg leading-relaxed",
                            "z-20 rounded px-3 py-2 text-xs leading-none bg-gray-700 dark:bg-gray-800 bg-opacity-90 font-medium text-gray-50 shadow-2xl select-none duration-400 ease-in transform opacity-100",
                            tooltipClassName)}
                        sideOffset={6}
                        side={placement}>
                        {title}
                        {/*<TooltipPrimitive.Arrow className="fill-gray-600"/>*/}
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
