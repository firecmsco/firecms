import * as React from "react";
import { Dialog } from "@mui/material";

import { CollectionEditor } from "./CollectionEditor";
import { EntityCollection } from "@camberi/firecms";
import {
    useCollectionEditorController
} from "../useCollectionEditorController";

export interface CollectionEditorDialogProps {
    open: boolean;
    handleClose: (collection?: EntityCollection) => void;
    saveCollection: <M>(path: string, collection: EntityCollection<M>) => Promise<void>;
    path?: string;
}

export const CollectionEditorDialog = React.memo(
    function CollectionEditorDialog({
                                        open,
                                        handleClose,
                                        saveCollection,
                                        path
                                    }: CollectionEditorDialogProps) {

        const collectionEditorController = useCollectionEditorController();

        const [dirty, setDirty] = React.useState(false);

        if (!collectionEditorController) return null;

        return (
            <Dialog
                open={open}
                maxWidth={"lg"}
                fullWidth
                keepMounted={false}
                onClose={handleClose ? (dirty ? undefined : () => handleClose()) : undefined}
                PaperProps={{
                    sx: (theme) => ({
                        height: "100%",
                        "@media (min-height:964px)": {
                            maxHeight: "900px"
                        },
                        background: theme.palette.background.default
                    })
                }}
            >
                {path && <CollectionEditor path={path}
                                           saveCollection={saveCollection}
                                           handleClose={handleClose}
                                           setDirty={setDirty}
                />}
            </Dialog>
        );
    }
)
