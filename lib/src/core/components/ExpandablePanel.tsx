import { PropsWithChildren } from "react";

import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Typography
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export function ExpandablePanel({
                                    title,
                                    children
                                }: PropsWithChildren<{ title: React.ReactNode }>) {

    return (
        <Accordion variant={"outlined"}>
            <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                {title}
            </AccordionSummary>
            <AccordionDetails>
                {children}
            </AccordionDetails>
        </Accordion>
    )
}
