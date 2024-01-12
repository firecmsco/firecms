import React from "react";
import { Button, Typography } from "@firecms/ui";
import { SubscriptionMessageProps } from "@firecms/data_enhancement";

export function FireCMSDataEnhancementSubscriptionMessage({ projectId, context }: SubscriptionMessageProps) {

    return (
        <div className="flex flex-col gap-1 p-1">
            <Typography variant={"h6"}>Subscription required</Typography>
            <Typography>You have finished your free usage quota.</Typography>
            <Typography>Please upgrade plans to continue using this feature in this project</Typography>
            <Button
                color={"warning"}
                component={"a"}
                rel="noopener noreferrer"
                target="_blank"
                href={`/p/${projectId}/settings`}>
                Upgrade plan
            </Button>
        </div>
    )
}
