import React from "react";
import clsx from "clsx";
import * as Collapsible from "@radix-ui/react-collapsible";

import { useInjectStyles } from "./util/useInjectStyles";

interface CollapseProps {
    children?: React.ReactNode;
    className?: string;
    in?: boolean;
}

export function Collapse({
                             children,
                             className,
                             in: isOpen = false
                         }: CollapseProps) {

    useInjectStyles("Collapse", `
.CollapseContent {
  overflow: hidden;
}
.CollapseContent[data-state='open'] {
  animation: slideDown 220ms ease-out;
}
.CollapseContent[data-state='closed'] {
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
}
`);

    return (
        <Collapsible.Root
            open={isOpen}>

            <Collapsible.Content
                className={clsx("CollapseContent", className)}
            >
                {children}
            </Collapsible.Content>
        </Collapsible.Root>
    )
};
