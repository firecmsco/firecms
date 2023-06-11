import React from "react";
import { Button } from "@mui/material";
import { Link as ReactLink } from "react-router-dom";
import TTypography from "../../migrated/TTypography";

export function NotFoundPage() {

    return (
        <div className="flex w-full h-full">
            <div className="m-auto flex items-center flex-col"
            >
                <TTypography variant={"h4"} align={"center"}
                             gutterBottom={true}>
                    Page not found
                </TTypography>
                <TTypography align={"center"} gutterBottom={true}>
                    This page does not exist or you may not have access to it
                </TTypography>
                <Button
                    component={ReactLink}
                    to={"/"}>Back to home</Button>
            </div>
        </div>
    );
}
