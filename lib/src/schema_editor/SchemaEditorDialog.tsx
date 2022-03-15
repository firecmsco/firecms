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
                    maxHeight: "900px",
                    background: theme.palette.background.default
                })
            }}
        >
            <SchemaEditor schemaId={schemaId}
                          handleClose={handleClose}
                          setDirty={setDirty}
            />
        </Dialog>
    );
}
