import { PropsWithChildren, useCallback, useState } from "react";

import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export function ExpandablePanel({
                                    title,
                                    children,
                                    invisible = false,
                                    expanded = true,
                                    padding = 1,
                                    darken = true
                                }: PropsWithChildren<{
    title: React.ReactNode,
    invisible?: boolean,
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
                       backgroundColor: invisible ? "transparent" : (darken ? undefined : "inherit"),
                       borderRadius: invisible ? 0 : `${theme.shape.borderRadius}px`,
                       border: invisible ? "none" : undefined,
                       "&::before": {
                           display: "none"
                       }

                   })}
                   TransitionProps={{ unmountOnExit: true }}
                   onChange={useCallback((event: React.SyntheticEvent, expanded: boolean) => setExpandedInternal(expanded), [])}>

            <AccordionSummary expandIcon={<ExpandMoreIcon/>}
                              sx={(theme) => ({
                                  padding: invisible ? 0 : undefined,
                                  minHeight: "56px",
                                  alignItems: "center",
                                  borderTopLeftRadius: `${theme.shape.borderRadius}px`,
                                  borderTopRightRadius: `${theme.shape.borderRadius}px`,
                                  borderBottomLeftRadius: !expandedInternal && !invisible ? `${theme.shape.borderRadius}px` : undefined,
                                  borderBottomRightRadius: !expandedInternal && !invisible ? `${theme.shape.borderRadius}px` : undefined,
                                  border: invisible ? "none" : undefined,
                                  borderBottom: invisible ? `1px solid ${theme.palette.divider}` : undefined,
                                  "&.Mui-expanded": {
                                      borderBottom: `1px solid ${theme.palette.divider}`
                                  }
                              })}>
                {title}
            </AccordionSummary>

            <AccordionDetails sx={(theme) => ({
                padding: invisible ? 0 : typeof padding === "string" ? padding : theme.spacing(padding),
                py: theme.spacing(2),
                border: invisible ? "none" : undefined

            })}>
                {children}
            </AccordionDetails>

        </Accordion>
    )
}
