import { cls, SquareIcon, ToggleButtonGroup, Typography, VerticalSplitIcon } from "@firecms/ui";

export function LayoutModeSwitch({
    value,
    onChange,
    className
}: {
    value: "side_panel" | "full_screen";
    onChange: (value: "side_panel" | "full_screen") => void;
    className?: string;
}) {

    return <div className={cls(className)}>
        <Typography variant={"label"} color={"secondary"} className={"ml-3.5"}>Document view</Typography>
        <div className={"my-2"}>
            <ToggleButtonGroup
                value={value}
                onValueChange={onChange}
                options={[
                    {
                        value: "side_panel",
                        label: "Side panel",
                        icon: <VerticalSplitIcon />
                    },
                    {
                        value: "full_screen",
                        label: "Full screen",
                        icon: <SquareIcon />
                    }
                ]}
            />
        </div>
        <Typography variant={"caption"} color={"secondary"} className={"ml-3.5"}>Should documents be opened full screen or in an inline side dialog</Typography>
    </div>
}
