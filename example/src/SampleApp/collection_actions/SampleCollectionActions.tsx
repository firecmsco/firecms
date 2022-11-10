import React from "react";
import { Button } from "@mui/material";
import {
    CollectionActionsProps,
    useSnackbarController
} from "@camberi/firecms";

export function SampleCollectionActions({ selectionController }: CollectionActionsProps) {

    const snackbarController = useSnackbarController();

    const onClick = (event: React.MouseEvent) => {
        const selectedEntities = selectionController?.selectedEntities;
        const count = selectedEntities ? selectedEntities.length : 0;
        snackbarController.open({
            type: "success",
            message: `User defined code here! ${count} products selected`
        });
    };

    return (
        <Button onClick={onClick} color="primary">
            Extra action
        </Button>
    );

}
