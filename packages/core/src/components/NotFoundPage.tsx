import React from "react";
import { Link } from "react-router-dom";
import { Button, Typography } from "@rebasepro/ui";
import { useTranslation } from "../hooks";

export function NotFoundPage() {
    const { t } = useTranslation();

    return (
        <div className="flex w-full h-full">
            <div className="m-auto flex items-center flex-col"
            >
                <Typography variant={"h4"} align={"center"}
                    gutterBottom={true}>
                    {t("page_not_found")}
                </Typography>
                <Typography align={"center"} gutterBottom={true}>
                    {t("page_not_found_body")}
                </Typography>
                <Button
                    variant={"text"}
                    component={Link}
                    to={"/"}>{t("back_to_home")}</Button>
            </div>
        </div>
    );
}
