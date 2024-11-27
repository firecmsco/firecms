import React, { useState } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    SearchIcon,
    TextField,
    Typography
} from "@firecms/ui";

export default function DialogBasicDemo() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setOpen(true)}>Open Dialog</Button>
            <Dialog
                open={open}
                onOpenChange={setOpen}>
                <DialogTitle variant={"h6"} className={"flex flex-row gap-4 items-center"}>
                    <SearchIcon size={"small"}/>
                    Search
                </DialogTitle>
                <DialogContent>
                    <Typography variant={"body2"}>
                        Search in your documents
                    </Typography>
                    <TextField size={"small"}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} variant={"text"}>
                        Close
                    </Button>
                    <Button onClick={() => setOpen(false)}
                            variant={"filled"}>
                        Got it!
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
