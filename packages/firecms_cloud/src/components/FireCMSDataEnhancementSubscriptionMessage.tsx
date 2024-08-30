import React from "react";
import { Button, Typography } from "@firecms/ui";
import { SubscriptionMessageProps } from "@firecms/data_enhancement";

export function FireCMSDataEnhancementSubscriptionMessage({ projectId }: SubscriptionMessageProps) {

    return (
        <div className="flex flex-col gap-1 p-1">
            <Typography variant={"h6"}>Subscription required</Typography>
            <Typography>Please upgrade plans to use this feature in this project</Typography>
            <Button
                color={"primary"}
                component={"a"}
                rel="noopener noreferrer"
                target="_blank"
                onClick={e => e.stopPropagation()}
                href={`/p/${projectId}/settings`}>
                Upgrade plan
            </Button>
        </div>
    )
}
