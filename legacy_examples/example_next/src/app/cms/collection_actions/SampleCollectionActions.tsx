import React from "react";
import { CollectionActionsProps, useSnackbarController } from "@firecms/core";
import { Button, CloseIcon, IconButton, Select, SelectItem } from "@firecms/ui";

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
        <Button onClick={onClick}
                color="primary"
                variant={"text"}>
            Extra action
        </Button>
    );

}

export function CustomFiltersActions({
                                         tableController
                                     }: CollectionActionsProps) {

    const filterValues = tableController.filterValues;
    const categoryFilter = filterValues?.category;
    const categoryFilterValue = categoryFilter?.[1];

    const updateFilter = (value: string | null) => {
        const newFilter = {
            ...filterValues
        };
        if (value) {
            newFilter.category = ["==", value];
        } else {
            delete newFilter.category;
        }
        tableController.setFilterValues?.(newFilter);
    };
    return (
        <Select placeholder={"Category filter"}
                className={"w-44"}
                endAdornment={categoryFilterValue ?
                    <IconButton size={"small"} onClick={() => updateFilter(null)}>
                        <CloseIcon size={"smallest"}/>
                    </IconButton> : undefined}
                onValueChange={updateFilter}
                size={"medium"}
                value={categoryFilterValue}>
            <SelectItem value="cameras">Cameras</SelectItem>
            <SelectItem value="bath">Bath</SelectItem>
        </Select>
    );

}
