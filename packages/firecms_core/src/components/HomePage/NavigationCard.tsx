import { ArrowForwardIcon, Card, cls, Markdown, Typography, } from "@firecms/ui";
import React from "react"; // Import React

export type NavigationCardProps = {
    name: string,
    description?: string;
    actions: React.ReactNode;
    icon: React.ReactNode;
    onClick?: () => void,
    shrink?: boolean
};

// Wrap the component with React.memo
export const NavigationCard = React.memo(function NavigationCard({
    name,
    description,
    icon,
    actions,
    onClick,
    shrink
}: NavigationCardProps) {

    return (
        <Card
            className={cls(
                "h-full px-4 py-3 cursor-pointer min-h-[160px] transition-all duration-200 ease-in-out",
                "hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/5",
                shrink && "w-full max-w-full min-h-0 scale-75"
            )}
            onClick={() => {
                onClick?.();
            }}
        >

            <div className="flex flex-col items-start h-full">
                <div
                    className="flex-grow w-full">

                    <div
                        className="h-8 flex items-center w-full justify-between text-surface-300 dark:text-surface-600">

                        {icon}

                        <div
                            className="flex items-center gap-0.5"
                            onClick={(event: React.MouseEvent) => {
                                event.preventDefault();
                                event.stopPropagation();
                            }}>

                            {actions}

                        </div>

                    </div>

                    <Typography gutterBottom variant="subtitle1"
                        className="font-medium mt-1"
                        component="h2">
                        {name}
                    </Typography>

                    {description && <Typography variant="caption"
                        color="secondary"
                        component="div">
                        <Markdown source={description} size={"small"} />
                    </Typography>}
                </div>

                <div style={{ alignSelf: "flex-end" }}>

                    <div className={"p-2"}>
                        <ArrowForwardIcon className="text-primary" size={"small"} />
                    </div>
                </div>

            </div>

        </Card>)
});
