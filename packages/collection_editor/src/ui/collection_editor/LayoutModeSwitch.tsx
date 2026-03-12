import { cls, SquareIcon, ToggleButtonGroup, Typography, VerticalSplitIcon } from "@firecms/ui";
import { useTranslation } from "@firecms/core";

export function LayoutModeSwitch({
    value,
    onChange,
    className
}: {
    value: "side_panel" | "full_screen";
    onChange: (value: "side_panel" | "full_screen") => void;
    className?: string;
}) {

    const { t } = useTranslation();

    return <div className={cls(className)}>
        <Typography variant={"label"} color={"secondary"} className={"ml-3.5"}>{t("document_view")}</Typography>
        <div className={"my-2"}>
            <ToggleButtonGroup
                value={value}
                onValueChange={onChange}
                options={[
                    {
                        value: "side_panel",
                        label: t("side_panel"),
                        icon: <VerticalSplitIcon />
                    },
                    {
                        value: "full_screen",
                        label: t("full_screen"),
                        icon: <SquareIcon />
                    }
                ]}
            />
        </div>
        <Typography variant={"caption"} color={"secondary"} className={"ml-3.5"}>{t("should_documents_opened_full_screen")}</Typography>
    </div>
}
