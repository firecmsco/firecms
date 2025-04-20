import { Button, FilterListOffIcon } from "@firecms/ui";
import { EntityTableController } from "../types";

export function ClearFilterSortButton({
                                          tableController,
                                          enabled
                                      }: {
    enabled: boolean;
    tableController: EntityTableController
}) {
    if (!enabled) {
        return null;
    }

    const filterIsSet = !!tableController.filterValues && Object.keys(tableController.filterValues).length > 0;
    const sortIsSet = !!tableController.sortBy && tableController.sortBy.length > 0;

    if ((filterIsSet || sortIsSet) && (tableController.clearFilter || tableController.setSortBy)) {
        let label;
        if (filterIsSet && sortIsSet) {
            label = "Clear filter/sort";
        } else if (filterIsSet) {
            label = "Clear filter";
        } else {
            label = "Clear sort";
        }
        return <Button
            variant={"outlined"}
            className="h-fit-content"
            aria-label="filter clear"
            onClick={() => {
                tableController.clearFilter?.();
                tableController.setSortBy?.(undefined);
            }}
            size={"small"}>
            <FilterListOffIcon/>
            {label}
        </Button>
    }
    return null;
}
