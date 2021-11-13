import React from "react";
import { Button } from "@mui/material";
import { SelectionController, useSnackbarController } from "@camberi/firecms";

export function SampleExtraActions({ selectionController }: {
    selectionController: SelectionController
}) {

    const snackbarContext = useSnackbarController();
    const { selectedEntities } = selectionController;

    const onClick = (event: React.MouseEvent) => {
        const count = selectedEntities ? selectedEntities.length : 0;
        snackbarContext.open({
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
