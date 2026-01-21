import { ViewMode } from "@firecms/core";
import { cls, GridViewIcon, TableViewIcon, ToggleButtonGroup, Typography, ViewKanbanIcon } from "@firecms/ui";

export function ViewModeSwitch({
    value,
    onChange,
    className
}: {
    value: ViewMode;
    onChange: (value: ViewMode) => void;
    className?: string;
}) {

    return <div className={cls(className)}>
        <Typography variant={"label"} color={"secondary"} className={"ml-3.5"}>Default collection view</Typography>
        <div className={"my-2"}>
            <ToggleButtonGroup
                value={value}
                onValueChange={onChange}
                options={[
                    {
                        value: "table",
                        label: "Table",
                        icon: <TableViewIcon />
                    },
                    {
                        value: "cards",
                        label: "Cards",
                        icon: <GridViewIcon />
                    },
                    {
                        value: "kanban",
                        label: "Kanban",
                        icon: <ViewKanbanIcon />
                    }
                ]}
            />
        </div>
        <Typography variant={"caption"} color={"secondary"} className={"ml-3.5"}>Choose how entities should be displayed by default</Typography>
    </div>
}
