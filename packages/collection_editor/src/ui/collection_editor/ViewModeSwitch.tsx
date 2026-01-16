import { Card, cls, GridViewIcon, TableViewIcon, Tooltip, Typography } from "@firecms/ui";

export function ViewModeSwitch({
    value,
    onChange,
    className
}: {
    value: "table" | "cards";
    onChange: (value: "table" | "cards") => void;
    className?: string;
}) {

    return <div className={cls(className)}>
        <Typography variant={"label"} color={"secondary"} className={"ml-3.5"}>Default collection view</Typography>
        <div className={cls("flex flex-row gap-4")}>

            <Tooltip title={"Display entities in a spreadsheet-like table"}>
                <Card
                    onClick={() => onChange("table")}
                    className={cls(
                        "my-2 rounded-md mx-0 p-4 focus:outline-none transition ease-in-out duration-150 flex flex-row gap-4 items-center",
                        "text-surface-700 dark:text-surface-accent-300",
                        "hover:text-primary-dark dark:hover:text-primary focus:ring-primary hover:ring-1 hover:ring-primary",
                        value === "table" ? "border-primary dark:border-primary" : "border-surface-400 dark:border-surface-600",
                    )}
                >
                    <TableViewIcon />
                    <Typography variant={"label"}>
                        Table
                    </Typography>
                </Card>
            </Tooltip>

            <Tooltip title={"Display entities as a grid of cards with thumbnails"}>
                <Card
                    onClick={() => onChange("cards")}
                    className={cls(
                        "my-2 rounded-md mx-0 p-4 focus:outline-none transition ease-in-out duration-150 flex flex-row gap-4 items-center",
                        "text-surface-700 dark:text-surface-accent-300",
                        "hover:text-primary-dark dark:hover:text-primary focus:ring-primary hover:ring-1 hover:ring-primary",
                        value === "cards" ? "border-primary dark:border-primary" : "border-surface-400 dark:border-surface-600",
                    )}
                >
                    <GridViewIcon />
                    <Typography variant={"label"}>
                        Cards
                    </Typography>
                </Card>
            </Tooltip>

        </div>
        <Typography variant={"caption"} color={"secondary"} className={"ml-3.5"}>Should entities be displayed as a table or as cards with thumbnails</Typography>
    </div>
}
