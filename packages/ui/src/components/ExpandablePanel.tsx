"use client";
import React, { PropsWithChildren, useEffect, useState } from "react";

import * as Collapsible from "@radix-ui/react-collapsible";
import { defaultBorderMixin, fieldBackgroundMixin } from "../styles";
import { KeyboardArrowDownIcon } from "../icons";
import { cls } from "../util";
import { useInjectStyles } from "../hooks";

export function ExpandablePanel({
                                    title,
                                    children,
                                    invisible = false,
                                    expanded,
                                    onExpandedChange,
                                    initiallyExpanded = true,
                                    titleClassName,
                                    asField,
                                    className,
                                    innerClassName
                                }: PropsWithChildren<{
    title: React.ReactNode,
    invisible?: boolean,
    initiallyExpanded?: boolean;
    expanded?: boolean;
    onExpandedChange?: (expanded: boolean) => void,
    titleClassName?: string,
    asField?: boolean,
    className?: string,
    innerClassName?: string
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
                className={cls(
                    !invisible && defaultBorderMixin + " border",
                    "rounded-md",
                    "w-full",
                    className
                )}
                open={open}
                onOpenChange={(updatedOpen: boolean) => {
                    onExpandedChange?.(updatedOpen);
                    setOpen(updatedOpen);
                }}>

                <Collapsible.Trigger asChild>
                    <div
                        className={cls(
                            "rounded-t flex items-center justify-between w-full min-h-[52px]",
                            "hover:bg-surface-accent-200 hover:bg-opacity-40 hover:bg-surface-accent-200/40 dark:hover:bg-surface-800 dark:hover:bg-opacity-40 dark:hover:bg-surface-800/40",
                            invisible ? "border-b px-2" : "p-4",
                            open ? "py-6" : "py-4",
                            "transition-all duration-200",
                            invisible && defaultBorderMixin,
                            asField && fieldBackgroundMixin,
                            titleClassName,
                            "cursor-pointer"
                        )}
                        role="button"
                        tabIndex={0}
                    >
                        {title}
                        <KeyboardArrowDownIcon className={cls("transition", open ? "rotate-180" : "")}/>
                    </div>
                </Collapsible.Trigger>

                <Collapsible.Content
                    className={cls("CollapsibleContent")}
                    style={{
                        overflow: allowOverflow ? "visible" : "hidden"
                    }}
                >
                    <div className={innerClassName}>
                        {children}
                    </div>
                </Collapsible.Content>
            </Collapsible.Root>
        </>
    )
}
