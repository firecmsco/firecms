import React from "react";
import { Typography } from "@firecms/ui";

export function SaaSHelp() {
    return (
        <Typography
            variant={"caption"}
            className="underline"
            component={"a"}
            href="mailto:hello@firecms.co?subject=FireCMS%20Cloud%20help"
            rel="noopener noreferrer"
            target="_blank">
            Reach us if you need help
        </Typography>
    )
}
