import { FilterListOffIcon, Button, Tooltip } from "@rebasepro/ui";
import { EntityTableController } from "@rebasepro/types";
import { useTranslation } from "../hooks";

export function ClearFilterSortButton({
    tableController,
    enabled
}: {
    enabled: boolean;
    tableController: EntityTableController
}) {
    const { t } = useTranslation();

    if (!enabled) {
        return null;
    }

    const filterIsSet = !!tableController.filterValues && Object.keys(tableController.filterValues).length > 0;
    const sortIsSet = !!tableController.sortBy && tableController.sortBy.length > 0;

    if ((filterIsSet || sortIsSet) && (tableController.clearFilter || tableController.setSortBy)) {
        let label;
        if (filterIsSet && sortIsSet) {
            label = t("clear_filter_sort");
        } else if (filterIsSet) {
            label = t("clear_filter");
        } else {
            label = t("clear_sort");
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
