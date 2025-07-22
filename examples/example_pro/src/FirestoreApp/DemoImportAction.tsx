import React from "react";
import { CollectionActionsProps } from "@firecms/core";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Tooltip,
    Typography,
    UploadIcon
} from "@firecms/ui";

export function DemoImportAction({}: CollectionActionsProps) {

    const [open, setOpen] = React.useState(false);

    return <>

        <Tooltip title={"Import"}
                 asChild={true}>
            <IconButton color={"primary"} size={"small"} onClick={() => setOpen(true)}>
                <UploadIcon size={"small"}/>
            </IconButton>
        </Tooltip>

        <Dialog open={open}
                maxWidth={"lg"}>
            <DialogTitle>Import data</DialogTitle>
            <DialogContent className={"flex flex-col gap-4 my-4"}>
                <Typography variant={"body2"}>The import feature is disabled in this demo</Typography>
            </DialogContent>
            <DialogActions>

                <Button variant="outlined"
                        onClick={() => setOpen(false)}>
                    Got it
                </Button>

            </DialogActions>
        </Dialog>

    </>;
}
