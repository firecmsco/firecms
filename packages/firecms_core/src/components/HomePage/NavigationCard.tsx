import { ArrowForwardIcon, Card, cls, Markdown, Typography, } from "@firecms/ui";

export type NavigationCardProps = {
    name: string,
    description?: string;
    actions: React.ReactNode;
    icon: React.ReactNode;
    onClick?: () => void,
};

export function NavigationCard({
                                   name,
                                   description,
                                   icon,
                                   actions,
                                   onClick,
                               }: NavigationCardProps) {

    return (<Card
        className={cls("h-full p-4 cursor-pointer min-h-[230px]")}
        onClick={() => {
            onClick?.();
        }}>

        <div className="flex flex-col items-start h-full">
            <div
                className="flex-grow w-full">

                <div
                    className="h-10 flex items-center w-full justify-between text-gray-300 dark:text-gray-600">

                    {icon}

                    <div
                        className="flex items-center gap-1"
                        onClick={(event: React.MouseEvent) => {
                            event.preventDefault();
                            event.stopPropagation();
                        }}>

                        {actions}

                    </div>

                </div>

                <Typography gutterBottom variant="h5"
                            component="h2">
                    {name}
                </Typography>

                {description && <Typography variant="body2"
                                            color="secondary"
                                            component="div">
                    <Markdown source={description} size={"small"}/>
                </Typography>}
            </div>

            <div style={{ alignSelf: "flex-end" }}>

                <div className={"p-4"}>
                    <ArrowForwardIcon className="text-primary"/>
                </div>
            </div>

        </div>

    </Card>)
}
