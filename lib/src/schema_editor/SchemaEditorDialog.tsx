import * as React from "react";
import { Dialog } from "@mui/material";

import { SchemaEditor } from "./SchemaEditor";
import { EntityCollection } from "../index";

export interface SchemaEditorDialogProps {
    open: boolean;
    handleClose: (collection?: EntityCollection) => void;
    path: string;
}

export function SchemaEditorDialog({
                                       open,
                                       handleClose,
                                       path
                                   }: SchemaEditorDialogProps) {

    const [dirty, setDirty] = React.useState(false);

    return (
        <Dialog
            open={open}
            maxWidth={"lg"}
            fullWidth
            keepMounted={false}
            onClose={dirty ? undefined : () => handleClose()}
            PaperProps={{
                sx: (theme) => ({
                    height: "100%",
                    "@media (min-height:900px)": {
                        maxHeight: "900px"
                    },
                    background: theme.palette.background.default
                })
            }}
        >
            <SchemaEditor path={path}
                          handleClose={handleClose}
                          setDirty={setDirty}
            />
        </Dialog>
    );
}
