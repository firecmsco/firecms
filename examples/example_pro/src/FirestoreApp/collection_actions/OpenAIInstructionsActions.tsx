import React, { useEffect } from "react";
import { useSideDialogsController } from "@firecms/core";
import {
    AutoFixHighIcon,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
} from "@firecms/ui";

/**
 * This whole component is a big hack used to point the user to the
 * data enhancement feature.

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
                onOpenChange={setOpen}
            >
                <DialogTitle variant={"h5"}>OpenAI data enhancement</DialogTitle>
                <DialogContent className="flex flex-col space-y-2">
                    <Typography gutterBottom>
                        Try it out by clicking on <b>ADD BOOK</b> and
                        then typing the title of your favourite book on the <b>AUTOFILL
                        input</b> field.
                    </Typography>
                    <Typography gutterBottom>
                        You can also try finding an empty or incomplete field
                        and clicking on <b>the magic wand</b> button
                        of the field, to have it autofilled.
                    </Typography>

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}
                            variant={"filled"}>
                        Got it!
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );

}
