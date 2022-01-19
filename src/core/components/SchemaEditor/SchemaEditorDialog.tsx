import * as React from "react";
import { useState } from "react";
import { Box, Dialog } from "@mui/material";

import { SchemaEditor } from "./SchemaEditor";
import { EntitySchema } from "../../..";

export interface SchemaEditorDialogProps {
    open: boolean;
    handleClose: (schema?: EntitySchema) => void;
    schemaId?: string;
}

export function SchemaEditorDialog({
                                       open,
                                       handleClose,
                                       schemaId
                                   }: SchemaEditorDialogProps) {

    const [dirty, setDirty] = useState(false);
    return (
        <Dialog
            open={open}
            maxWidth={"lg"}
            fullWidth
            onClose={dirty ? () => handleClose(undefined) : undefined}
            sx={(theme) => ({
                height: "100vh"
            })}
        >

            <Box
                sx={(theme) => ({
                    backgroundColor: theme.palette.background.paper,
                })}>
                <SchemaEditor schemaId={schemaId}
                              handleClose={handleClose}
                              updateDirtyStatus={setDirty}/>
            </Box>
        </Dialog>
    );
}
