import { Card, cls, SquareIcon, Tooltip, Typography, VerticalSplitIcon } from "@firecms/ui";

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
        <div className={cls("flex flex-row gap-4")}>

            <Tooltip title={"Documents are open in a side panel"}>
                <Card
                    onClick={() => onChange("side_panel")}
                    className={cls(
                        "my-2 rounded-md mx-0 p-4 focus:outline-none transition ease-in-out duration-150 flex flex-row gap-4 items-center",
                        "text-surface-700 dark:text-surface-accent-300",
                        "hover:text-primary-dark dark:hover:text-primary focus:ring-primary hover:ring-1 hover:ring-primary",
                        value === "side_panel" ? "border-primary dark:border-primary" : "border-surface-400 dark:border-surface-600",
                    )}
                >
                    <VerticalSplitIcon/>
                    <Typography variant={"label"}>
                        Side panel
                    </Typography>
                </Card>
            </Tooltip>

            <Tooltip title={"Documents are open full-screen"}>
                <Card
                    onClick={() => onChange("full_screen")}
                    className={cls(
                        "my-2 rounded-md mx-0 p-4 focus:outline-none transition ease-in-out duration-150 flex flex-row gap-4 items-center",
                        "text-surface-700 dark:text-surface-accent-300",
                        "hover:text-primary-dark dark:hover:text-primary focus:ring-primary hover:ring-1 hover:ring-primary",
                        value === "full_screen" ? "border-primary dark:border-primary" : "border-surface-400 dark:border-surface-600",
                    )}
                >
                    <SquareIcon/>
                    <Typography variant={"label"}>
                        Full screen
                    </Typography>
                </Card>
            </Tooltip>

        </div>
    </div>
}
