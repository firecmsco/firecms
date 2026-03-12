import { ViewMode, useTranslation } from "@firecms/core";
import { AppsIcon, cls, ListIcon, ToggleButtonGroup, Typography, ViewKanbanIcon } from "@firecms/ui";

export function ViewModeSwitch({
    value,
    onChange,
    className
}: {
    value: ViewMode;
    onChange: (value: ViewMode) => void;
    className?: string;
}) {

    const { t } = useTranslation();

    return <div className={cls(className)}>
        <Typography variant={"label"} color={"secondary"} className={"ml-3.5"}>{t("default_collection_view")}</Typography>
        <div className={"my-2"}>
            <ToggleButtonGroup
                value={value}
                onValueChange={onChange}
                options={[
                    {
                        value: "table",
                        label: t("table_view"),
                        icon: <ListIcon />
                    },
                    {
                        value: "cards",
                        label: t("cards_view"),
                        icon: <AppsIcon />
                    },
                    {
                        value: "kanban",
                        label: t("kanban_view"),
                        icon: <ViewKanbanIcon />
                    }
                ]}
            />
        </div>
        <Typography variant={"caption"} color={"secondary"} className={"ml-3.5"}>{t("choose_how_entities_displayed_default")}</Typography>
    </div>
}
