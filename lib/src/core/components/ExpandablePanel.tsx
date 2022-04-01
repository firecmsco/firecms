import { PropsWithChildren } from "react";

import {
    Accordion,
    AccordionDetails,
    AccordionProps,
    AccordionSummary,
    AccordionSummaryProps
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { darken, styled } from "@mui/material/styles";

const FireAccordion = styled((props: AccordionProps) => (
    <Accordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    "&:not(:last-child)": {
        borderBottom: 0
    },
    "&:before": {
        display: "none"
    }
}));

const FireAccordionSummary = styled((props: AccordionSummaryProps) => (
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
        marginLeft: theme.spacing(1)
    }
}));

export function ExpandablePanel({
                                    title,
                                    children
                                }: PropsWithChildren<{ title: React.ReactNode }>) {

    return (
        <Accordion variant={"outlined"}>
            <FireAccordionSummary expandIcon={<ExpandMoreIcon/>}>
                {title}
            </FireAccordionSummary>
            <AccordionDetails>
                {children}
            </AccordionDetails>
        </Accordion>
    )
}
