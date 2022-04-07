import { PropsWithChildren, useCallback, useState } from "react";

import {
    Accordion,
    AccordionDetails,
    AccordionDetailsProps,
    AccordionSummary,
    AccordionSummaryProps
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { darken, styled } from "@mui/material/styles";

const ExpandablePanelSummary = styled((props: AccordionSummaryProps) => (
    <AccordionSummary
        expandIcon={<ExpandMoreIcon/>}
        {...props}
    />
))(({ theme }) => ({
    minHeight: "56px",
    backgroundColor: theme.palette.mode === "dark"
        ? darken(theme.palette.background.paper, 0.1)
        : darken(theme.palette.background.paper, 0.05),
    "&.Mui-expanded": {
        borderBottom: `1px solid ${theme.palette.divider}`
    },
    // flexDirection: "row-reverse",
    "& .MuiAccordionSummary-content": {
        // marginLeft: theme.spacing(1)
    }
}));

const ExpandablePanelDetails = styled((props: AccordionDetailsProps) => (
    <AccordionDetails
        {...props}
    />
))(({ theme }) => ({
    padding: theme.spacing(1),
    [theme.breakpoints.up("md")]: {
        padding: theme.spacing(2)
    }
}));

export function ExpandablePanel({
                                    title,
                                    children,
                                    expanded = true
                                }: PropsWithChildren<{ title: React.ReactNode, expanded?: boolean }>) {

    const [expandedInternal, setExpandedInternal] = useState(expanded);
    return (
        <Accordion variant={"outlined"}
                   disableGutters
                   expanded={expandedInternal}
                   onChange={useCallback((event, expanded) => setExpandedInternal(expanded), [])}>
            <ExpandablePanelSummary expandIcon={<ExpandMoreIcon/>}>
                {title}
            </ExpandablePanelSummary>
            <ExpandablePanelDetails>
                {children}
            </ExpandablePanelDetails>
        </Accordion>
    )
}
