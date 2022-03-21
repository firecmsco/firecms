import * as React from "react";
import { Dialog } from "@mui/material";

import { CollectionEditor } from "./CollectionEditor";
import { EntityCollection } from "../index";

export interface CollectionEditorDialogProps {
    open: boolean;
    handleClose: (collection?: EntityCollection) => void;
    path: string;
}

export function CollectionEditorDialog({
                                       open,
                                       handleClose,
                                       path
                                   }: CollectionEditorDialogProps) {

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
            <CollectionEditor path={path}
                              handleClose={handleClose}
                              setDirty={setDirty}
            />
        </Dialog>
    );
}
