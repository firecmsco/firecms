import * as React from "react";
import { Dialog } from "@mui/material";

import { SchemaEditor } from "./SchemaEditor";
import { EntitySchema } from "../index";

export interface SchemaEditorDialogProps {
    open: boolean;
    handleClose: (schema?: EntitySchema) => void;
    schemaId: string;
}

export function SchemaEditorDialog({
                                       open,
                                       handleClose,
                                       schemaId
                                   }: SchemaEditorDialogProps) {

    return (
        <Dialog
            open={open}
            maxWidth={"lg"}
            fullWidth
            PaperProps={{
                sx: (theme) => ({
                    height: "100%",
                    background: theme.palette.background.default
                })
            }}
        >
            <SchemaEditor schemaId={schemaId}
                          handleClose={handleClose}/>
        </Dialog>
    );
}
