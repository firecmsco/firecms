import React, { PropsWithChildren, useState } from "react";
import clsx from "clsx";

import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronDown } from "lucide-react";
import { defaultBorderMixin, focusedMixin, paperMixin } from "../../styles";

export function ExpandablePanel({
                                    title,
                                    children,
                                    invisible = false,
                                    initiallyExpanded: initiallyOpen = true,
                                    onExpandedChange,
                                    className,
                                    contentClassName
                                }: PropsWithChildren<{
    title: React.ReactNode,
    invisible?: boolean,
    initiallyExpanded?: boolean;
    padding?: number | string;
    onExpandedChange?: (expanded: boolean) => void,
    className?: string,
    contentClassName?: string
}>) {

    const [open, setOpen] = useState(initiallyOpen);
    return (<>
            <style>
                {`
.CollapsibleContent {
  overflow: hidden;
}
.CollapsibleContent[data-state='open'] {
  animation: slideDown 220ms ease-in;
}
.CollapsibleContent[data-state='closed'] {
  animation: slideUp 220ms ease-in;
}

@keyframes slideDown {
  from {
    height: 0;
  }
  to {
    height: var(--radix-collapsible-content-height);
  }
}

@keyframes slideUp {
  from {
    height: var(--radix-collapsible-content-height);
  }
  to {
    height: 0;
  }
}`}
            </style>
            <Collapsible.Root
                className={clsx(
                    !invisible && paperMixin,
                )}
                open={open}
                onOpenChange={(updatedOpen: boolean) => {
                    onExpandedChange?.(updatedOpen);
                    setOpen(updatedOpen);
                }}>

                <Collapsible.Trigger
                    className={clsx(focusedMixin,
                        "rounded flex items-center justify-between w-full p-4",
                        invisible && "border-b",
                        invisible && defaultBorderMixin,
                        className
                    )}
                >
                    {title}
                    <ChevronDown strokeWidth={2} className={clsx("transition", open ? "rotate-180" : "")}/>
                </Collapsible.Trigger>

                <Collapsible.Content
                    className={clsx("CollapsibleContent", contentClassName)}
                >
                    {children}
                </Collapsible.Content>
            </Collapsible.Root>
        </>
    )
}
