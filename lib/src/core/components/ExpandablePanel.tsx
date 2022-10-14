import { PropsWithChildren, useCallback, useState } from "react";

import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export function ExpandablePanel({
                                    Title,
                                    children,
                                    expanded = true,
                                    padding = 1,
                                    darken = true
                                }: PropsWithChildren<{
    Title: React.ReactNode,
    expanded?: boolean;
    padding?: number | string;
    darken?: boolean
}>) {

    const [expandedInternal, setExpandedInternal] = useState(expanded);
    return (
        <Accordion variant={"outlined"}
                   disableGutters
                   expanded={expandedInternal}
                   sx={{
                       backgroundColor: darken ? undefined : "inherit"
                   }}
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
                                  },
                                  // flexDirection: "row-reverse",
                                  "& .MuiAccordionSummary-content": {
                                      // marginLeft: theme.spacing(1)
                                  }
                              })}>
                {Title}
            </AccordionSummary>
            <AccordionDetails sx={(theme) => ({
                padding: typeof padding === "string" ? padding : theme.spacing(padding)
            })}>
                {children}
            </AccordionDetails>
        </Accordion>
    )
}
