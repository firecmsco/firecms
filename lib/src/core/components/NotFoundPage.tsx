import React from "react";
import { Button } from "@mui/material";
import { Link as ReactLink } from "react-router-dom";
import Typography from "../../components/Typography";

export function NotFoundPage() {

    return (
        <div className="flex w-full h-full">
            <div className="m-auto flex items-center flex-col"
            >
                <Typography variant={"h4"} align={"center"}
                            gutterBottom={true}>
                    Page not found
                </Typography>
                <Typography align={"center"} gutterBottom={true}>
                    This page does not exist or you may not have access to it
                </Typography>
                <Button
                    component={ReactLink}
                    to={"/"}>Back to home</Button>
            </div>
        </div>
    );
}
