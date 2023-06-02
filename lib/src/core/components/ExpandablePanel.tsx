import React, { PropsWithChildren, useCallback, useState } from "react";

import {
    Accordion,
    AccordionDetails,
    AccordionSummary, darken,
    lighten, useTheme
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { fieldBackgroundSubtleHover } from "../util/field_colors";

export function ExpandablePanel({
                                    title,
                                    children,
                                    invisible = false,
                                    initiallyExpanded = true,
                                    highlightOnHover = false,
                                    padding = 1,
                                    dark = true,
                                    onExpandedChange
                                }: PropsWithChildren<{
    title: React.ReactNode,
    invisible?: boolean,
    initiallyExpanded?: boolean;
    padding?: number | string;
    highlightOnHover?: boolean,
    dark?: boolean,
    onExpandedChange?: (expanded: boolean) => void
}>) {

    const theme = useTheme();

    const [onHover, setOnHover] = React.useState(false);
    const setOnHoverTrue = useCallback(() => setOnHover(true), []);
    const setOnHoverFalse = useCallback(() => setOnHover(false), []);

    const [expandedInternal, setExpandedInternal] = useState(initiallyExpanded);
    return (
        <Accordion variant={"outlined"}
                   onMouseEnter={setOnHoverTrue}
                   onMouseMove={setOnHoverTrue}
                   onMouseLeave={setOnHoverFalse}
                   disableGutters
                   expanded={expandedInternal}
                   className={`${
                       invisible
                           ? "bg-transparent"
                           : dark
                               ? onHover && highlightOnHover
                                   ? fieldBackgroundSubtleHover(theme)
                                   : "bg-transparent"
                               : "bg-inherit"
                   } ${
                       invisible ? "rounded-none" : `rounded-${theme.shape.borderRadius}`
                   } ${invisible ? "border-none" : ""}`}

                   style={{
                       "&::before": {
                           display: "none",
                       },
                   }}
                   TransitionProps={{ unmountOnExit: true }}
                   onChange={useCallback((event: React.SyntheticEvent, expanded: boolean) => {
                       onExpandedChange?.(expanded);
                       setExpandedInternal(expanded);
                   }, [onExpandedChange])}>

            <AccordionSummary expandIcon={<ExpandMoreIcon/>}
                              className={`items-center ${invisible ? 'p-0' : ''} min-h-14 border-${invisible ? '0' : ''} ${!expandedInternal && !invisible ? 'rounded-t rounded-bl' : ''}`}
                              style={{
                                  color: 'text-secondary',
                                  minHeight: '56px',
                                  borderTopLeftRadius: `${theme.shape.borderRadius}px`,
                                  borderTopRightRadius: `${theme.shape.borderRadius}px`,
                                  borderBottomLeftRadius: !expandedInternal && !invisible ? `${theme.shape.borderRadius}px` : undefined,
                                  borderBottomRightRadius: !expandedInternal && !invisible ? `${theme.shape.borderRadius}px` : undefined,
                                  border: invisible ? 'none' : undefined,
                                  borderBottom: invisible ? `1px solid ${theme.palette.divider}` : undefined,
                              }}
                              data-classes="Mui-expanded:border-b Mui-expanded:border-solid Mui-expanded:border-divider">
                {title}
            </AccordionSummary>

            <AccordionDetails className={`${
                invisible ? 'p-0' : typeof padding === 'string' ? padding : `p-${padding}`
            } py-2 ${
                invisible ? 'border-none' : ''
            } text-current`}>
                {children}
            </AccordionDetails>

        </Accordion>
    )
}
