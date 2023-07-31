import React, { PropsWithChildren, useState } from "react";
import clsx from "clsx";

import * as Collapsible from "@radix-ui/react-collapsible";
import { defaultBorderMixin, focusedMixin } from "../styles";
import { useInjectStyles } from "./util/useInjectStyles";
import { ExpandMoreIcon } from "../icons";

export function ExpandablePanel({
                                    title,
                                    children,
                                    invisible = false,
                                    initiallyExpanded: initiallyOpen = true,
                                    onExpandedChange,
                                    titleClassName,
                                    className
                                }: PropsWithChildren<{
    title: React.ReactNode,
    invisible?: boolean,
    initiallyExpanded?: boolean;
    onExpandedChange?: (expanded: boolean) => void,
    titleClassName?: string,
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

    const [open, setOpen] = useState(initiallyOpen);
    return (<>
            <Collapsible.Root
                className={clsx(
                    !invisible && defaultBorderMixin + " border",
                    "rounded-md"
                )}
                open={open}
                onOpenChange={(updatedOpen: boolean) => {
                    onExpandedChange?.(updatedOpen);
                    setOpen(updatedOpen);
                }}>

                <Collapsible.Trigger
                    className={clsx(focusedMixin,
                        "rounded flex items-center justify-between w-full min-h-[64px]",
                        invisible ? "border-b px-2" : "p-4",
                        invisible && defaultBorderMixin,
                        titleClassName
                    )}
                >
                    {title}
                    <ExpandMoreIcon className={clsx("transition", open ? "rotate-180" : "")}/>
                </Collapsible.Trigger>

                <Collapsible.Content
                    className={clsx("CollapsibleContent")}
                >
                    <div className={className}>
                        {children}
                    </div>
                </Collapsible.Content>
            </Collapsible.Root>
        </>
    )
}
