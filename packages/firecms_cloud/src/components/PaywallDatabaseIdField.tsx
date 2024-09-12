import React from "react";
import { Button, TextField, Tooltip, Typography } from "@firecms/ui";
import { useProjectConfig } from "../hooks";

export function PaywallDatabaseIdField() {

    const ref = React.useRef(null);

    const projectConfig = useProjectConfig();
    return <>
        <Tooltip
            side={"top"}
            asChild={false}
            delayDuration={500}
            sideOffset={8}
            title={<div className="flex flex-col gap-2 p-2 text-white">
                <Typography variant={"subtitle2"} className={"text-white"}>Subscription required</Typography>
                <Typography className={"text-white"}>Please upgrade plans to use alternate databases</Typography>
                <Button
                    className={"hover:text-white"}
                    color={"primary"}
                    component={"a"}
                    rel="noopener noreferrer"
                    target="_blank"
                    onClick={e => e.preventDefault()}
                    href={`/p/${projectConfig.projectId}/settings`}>
                    Upgrade plan
                </Button>
            </div>}>
            <TextField
                inputRef={ref}
                size={"smallest"}
                inputClassName={"text-end"}
                className={"bg-transparent dark:bg-transparent"}
                disabled={true}
                placeholder={"(default)"}></TextField>
        </Tooltip>
    </>;
}
