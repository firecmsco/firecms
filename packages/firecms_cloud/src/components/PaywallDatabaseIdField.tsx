import React from "react";
import { Button, TextField, Tooltip, Typography } from "@firecms/ui";
import { useProjectConfig } from "../hooks";

export function PaywallDatabaseIdField({
                                           databaseId,
                                           onDatabaseIdUpdate
                                       }:
                                           { databaseId?: string, onDatabaseIdUpdate: (databaseId: string) => void }) {

    const projectConfig = useProjectConfig();
    return <>
        <Tooltip
            side={"top"}
            sideOffset={8}
            title={<div className="flex flex-col gap-2 p-2 text-base">
                <Typography variant={"h6"}>Subscription required</Typography>
                <Typography>Please upgrade plans to use alternate databases</Typography>
                <Button
                    className={"hover:text-white"}
                    color={"primary"}
                    component={"a"}
                    rel="noopener noreferrer"
                    target="_blank"
                    href={`/p/${projectConfig.projectId}/settings`}>
                    Upgrade plan
                </Button>
            </div>}>
            <TextField size={"smallest"}
                       inputClassName={"text-end"}
                       className={"bg-transparent dark:bg-transparent"}
                       disabled={true}
                       placeholder={"(default)"}></TextField>
        </Tooltip>
    </>
}
