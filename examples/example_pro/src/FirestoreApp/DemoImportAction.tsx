import React from "react";
import { CollectionActionsProps } from "@firecms/core";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    FileUploadIcon,
    IconButton,
    Tooltip,
    Typography
} from "@firecms/ui";

export function DemoImportAction({}: CollectionActionsProps) {

    const [open, setOpen] = React.useState(false);

    return <>

        <Tooltip title={"Import"}
                 asChild={true}>
            <IconButton color={"primary"} onClick={() => setOpen(true)}>
                <FileUploadIcon/>
            </IconButton>
        </Tooltip>

        <Dialog open={open}
                maxWidth={"lg"}>
            <DialogContent className={"flex flex-col gap-4 my-4"}>
                <Typography variant={"h6"}>Import data</Typography>
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
