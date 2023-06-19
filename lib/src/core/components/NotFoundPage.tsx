import React from "react";
import { Button } from "@mui/material";
import { Link as ReactLink } from "react-router-dom";
import Text from "../../components/Text";

export function NotFoundPage() {

    return (
        <div className="flex w-full h-full">
            <div className="m-auto flex items-center flex-col"
            >
                <Text variant={"h4"} align={"center"}
                             gutterBottom={true}>
                    Page not found
                </Text>
                <Text align={"center"} gutterBottom={true}>
                    This page does not exist or you may not have access to it
                </Text>
                <Button
                    component={ReactLink}
                    to={"/"}>Back to home</Button>
            </div>
        </div>
    );
}
