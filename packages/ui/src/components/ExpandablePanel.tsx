import React, { PropsWithChildren, useEffect, useState } from "react";

import * as Collapsible from "@radix-ui/react-collapsible";
import { defaultBorderMixin, fieldBackgroundMixin, focusedMixin } from "../styles";
import { ExpandMoreIcon } from "../icons";
import { cn, useInjectStyles } from "../utils";

export function ExpandablePanel({
                                    title,
                                    children,
                                    invisible = false,
                                    expanded,
                                    onExpandedChange,
                                    initiallyExpanded = true,
                                    titleClassName,
                                    asField,
                                    className
                                }: PropsWithChildren<{
    title: React.ReactNode,
    invisible?: boolean,
    initiallyExpanded?: boolean;
    expanded?: boolean;
    onExpandedChange?: (expanded: boolean) => void,
    titleClassName?: string,
    asField?: boolean,
    className?: string
}>) {

    useInjectStyles("ExpandablePanel", `
.CollapsibleContent {
  overflow: hidden;
}
.CollapsibleContent[data-state='open'] {
  animation: slideDown 220ms ease-out
}
.CollapsibleContent[data-state='closed'] {
  animation: slideUp 220ms ease-out;
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
}`);

    const [open, setOpen] = useState(expanded !== undefined ? expanded : initiallyExpanded);
    const [allowOverflow, setAllowOverflow] = useState(open);

    useEffect(() => {
        if (open) {
            setTimeout(() => {
                setAllowOverflow(true);
            }, 220);
        } else {
            setAllowOverflow(false);
        }
    }, [open]);

    useEffect(() => {
        if (expanded !== undefined)
            setOpen(expanded);
    }, [expanded]);

    return (<>
            <Collapsible.Root
                className={cn(
                    !invisible && defaultBorderMixin + " border",
                    "rounded-md"
                )}
                open={open}
                onOpenChange={(updatedOpen: boolean) => {
                    onExpandedChange?.(updatedOpen);
                    setOpen(updatedOpen);
                }}>

                <Collapsible.Trigger
                    className={cn(focusedMixin,
                        "rounded flex items-center justify-between w-full min-h-[52px]",
                        invisible ? "border-b px-2" : "p-4",
                        invisible && defaultBorderMixin,
                        asField && fieldBackgroundMixin,
                        titleClassName
                    )}
                >
                    {title}
                    <ExpandMoreIcon className={cn("transition", open ? "rotate-180" : "")}/>
                </Collapsible.Trigger>

                <Collapsible.Content
                    className={cn("CollapsibleContent")}
                    style={{
                        overflow: allowOverflow ? "visible" : "hidden"
                    }}
                >
                    <div className={className}>
                        {children}
                    </div>
                </Collapsible.Content>
            </Collapsible.Root>
        </>
    )
}
