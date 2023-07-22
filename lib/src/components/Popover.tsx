import * as PopoverPrimitive from "@radix-ui/react-popover";
import clsx from "clsx";

import { paperMixin } from "../styles";
import { useInjectStyles } from "./util/useInjectStyles";

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
                        }: PopoverProps) {

    // useInjectStyles("Popover", popoverStyles);

    return <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
        <PopoverPrimitive.Trigger>
            {trigger}
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content className={clsx(paperMixin, "PopoverContent shadow")}
                                      side={side}
                                      sideOffset={sideOffset}
                                      align={align}
                                      alignOffset={alignOffset}
                                      arrowPadding={arrowPadding}
                                      sticky={sticky}
                                      hideWhenDetached={hideWhenDetached}
                                      avoidCollisions={avoidCollisions}>

                {children}
                <PopoverPrimitive.Arrow className="fill-white dark:fill-gray-950"/>
            </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>;
}

const popoverStyles = `

.PopoverContent {
  animation-duration: 1400ms;
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
