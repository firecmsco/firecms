import { FilterListOffIcon, Button, Tooltip } from "@firecms/ui";
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
        return (
            <Tooltip title={label}>
                <Button
                    size={"small"}
                    variant={"text"}
                    aria-label={label}
                    onClick={() => {
                        tableController.clearFilter?.();
                        tableController.setSortBy?.(undefined);
                    }}
                >
                    <FilterListOffIcon size="small" />
                </Button>
            </Tooltip>
        );
    }
    return null;
}
