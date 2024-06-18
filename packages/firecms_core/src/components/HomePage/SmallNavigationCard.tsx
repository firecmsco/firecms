import { ArrowForwardIcon, cardClickableMixin, cardMixin, cls, focusedMixin, Typography, } from "@firecms/ui";

import { Link } from "react-router-dom";

export type SmallNavigationCardProps = {
    name: string,
    url: string;
    icon: React.ReactElement;
};

export function SmallNavigationCard({
                                 name,
                                 url,
                                 icon,
                             }: SmallNavigationCardProps) {

    return (
        <>

            <Link
                tabIndex={0}
                className={cls(cardMixin,
                    cardClickableMixin,
                    focusedMixin,
                    "cursor-pointer flex flex-row items-center px-4 py-2 text-inherit dark:text-inherit visited:text-inherit visited:dark:text-inherit hover:text-inherit hover:dark:text-inherit ")}
                to={url}
            >

                <div className="flex flex-row items-center flex-grow gap-2 ">
                    {icon}

                    <Typography gutterBottom variant="h5"
                                component="h2"
                                className="mb-0 ml-4">
                        {name}
                    </Typography>
                </div>

                <div className={"p-4"}>
                    <ArrowForwardIcon color="primary"/>
                </div>
            </Link>

        </>);
}
