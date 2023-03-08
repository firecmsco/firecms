import { PropsWithChildren, useCallback, useState } from "react";

import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export function ExpandablePanel({
                                    title,
                                    children,
                                    expanded = true,
                                    padding = 1,
                                    darken = true
                                }: PropsWithChildren<{
    title: React.ReactNode,
    expanded?: boolean;
    padding?: number | string;
    darken?: boolean
}>) {

    const [expandedInternal, setExpandedInternal] = useState(expanded);
    return (
        <Accordion variant={"outlined"}
                   disableGutters
                   expanded={expandedInternal}
                   sx={theme => ({
                       color: theme.palette.text.secondary,
                       backgroundColor: darken ? undefined : "inherit",
                       borderRadius: `${theme.shape.borderRadius}px`
                   })}
                   TransitionProps={{ unmountOnExit: true }}
                   onChange={useCallback((event: React.SyntheticEvent, expanded: boolean) => setExpandedInternal(expanded), [])}>

            <AccordionSummary expandIcon={<ExpandMoreIcon/>}
                              sx={(theme) => ({
                                  minHeight: "56px",
                                  alignItems: "center",
                                  borderTopLeftRadius: `${theme.shape.borderRadius}px`,
                                  borderTopRightRadius: `${theme.shape.borderRadius}px`,
                                  borderBottomLeftRadius: !expandedInternal ? `${theme.shape.borderRadius}px` : undefined,
                                  borderBottomRightRadius: !expandedInternal ? `${theme.shape.borderRadius}px` : undefined,
                                  "&.Mui-expanded": {
                                      borderBottom: `1px solid ${theme.palette.divider}`
                                  }
                              })}>
                {title}
            </AccordionSummary>

            <AccordionDetails sx={(theme) => ({
                padding: typeof padding === "string" ? padding : theme.spacing(padding),
                py: theme.spacing(2)
            })}>
                {children}
            </AccordionDetails>

        </Accordion>
    )
}
