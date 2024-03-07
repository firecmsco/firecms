import React, { useCallback } from "react";

import { CollectionActionsProps, EntityCollection, User } from "@firecms/core";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    IconButton,
    PrecisionManufacturingIcon,
    Tooltip,
    Typography,
} from "@firecms/ui";

/**
 * Button that gets displayed in the collection view to open the DoFlow dialog
 * @constructor
 */
export function DoFlowCollectionAction<M extends Record<string, any>, UserType extends User>({
                                                                                                 collection,
                                                                                                 path,
                                                                                             }: CollectionActionsProps<M, UserType, EntityCollection<M, any>>) {

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = useCallback(() => {
        setOpen(true);
    }, [setOpen]);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    const onOkClicked = useCallback(() => {
        handleClose();
    }, [handleClose]);

    return <>

        <Tooltip title={"Automations"}>
            <IconButton color={"primary"} onClick={handleClickOpen}>
                <PrecisionManufacturingIcon/>
            </IconButton>
        </Tooltip>

        <Dialog
            open={open}
            onOpenChange={setOpen}
            maxWidth={"6xl"}>
            <DialogContent className={"flex flex-col gap-4 my-4"}>

                <Typography variant={"h6"}>Do flow integration here</Typography>

            </DialogContent>

            <DialogActions>

                {/*<Button onClick={handleClose}*/}
                {/*        variant={"text"}>*/}
                {/*    Cancel*/}
                {/*</Button>*/}

                <Button variant="filled"
                        onClick={onOkClicked}>
                    Done
                </Button>

            </DialogActions>

        </Dialog>

    </>;
}
