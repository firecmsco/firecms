import React, { useEffect } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    IconButton,
    Step,
    StepLabel,
    Stepper,
    Typography
} from "@mui/material";

import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { useSideDialogsController } from "firecms";

/**
 * This whole component is a big hack used to point the user to the
 * data enhancement feature.
 * @constructor
 */
export function OpenAIInstructionsActions() {

    const [open, setOpen] = React.useState(process.env.NODE_ENV === "production");

    const sideEntityController = useSideDialogsController();
    useEffect(() => {
        if (sideEntityController.sidePanels.length > 0) {
            setTimeout(() => {
                const querySelector = document.querySelector("#enhance_entity_books");
                // @ts-ignore
                querySelector?.focus();
            }, 100);
        }
    }, [sideEntityController.sidePanels])

    const handleClose = () => {
        setOpen(false);
        // @ts-ignore
        document.querySelector("#add_entity_books")?.focus();
    };

    return (
        <>
            <IconButton onClick={() => setOpen(true)}>
                <AutoFixHighIcon/>
            </IconButton>
            <Dialog
                open={open}
                onClose={handleClose}
            >
                <DialogContent sx={{
                    p: 4,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1
                }}>
                    <Typography variant={"h5"} gutterBottom>
                        OpenAI data enhancement DEMO
                    </Typography>
                    <Stepper activeStep={0} alternativeLabel sx={{ p: 4 }}>
                        <Step>
                            <StepLabel>+ ADD BOOK</StepLabel>
                        </Step>

                        <Step>
                            <StepLabel>ENHANCE</StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>Type in any book!</StepLabel>
                        </Step>
                    </Stepper>
                    <Typography gutterBottom>
                        Try it out by clicking on <b>ADD BOOK</b> and
                        then typing the title of your favourite book on the <b>ENHANCE
                        input</b>
                    </Typography>
                    <Typography gutterBottom>
                        You can also try finding an empty or incomplete field
                        and clicking on <b>the magic wand</b> button
                        of the field, to have it autofilled.
                    </Typography>

                    <Typography gutterBottom>
                        If you are interested in adding this plugin to your own
                        project, please contact us at <a
                        href="mailto:hello@firecms.co?subject=FireCMS%20data%20enhancement%20plugin"
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        hello@firecms.co
                    </a>
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} autoFocus
                            variant={"contained"}>
                        Got it!
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );

}
