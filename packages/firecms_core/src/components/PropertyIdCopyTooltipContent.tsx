import { ContentPasteIcon, IconButton, Typography } from "@firecms/ui";
import { useCallback, useState } from "react";

export function PropertyIdCopyTooltipContent({ propertyId }: { propertyId: string }) {

    const [copied, setCopied] = useState(false);

    return (
        <div className={"flex flex-row gap-2 items-center justify-center"}>
            <div>
                <Typography variant={"caption"} className={"min-w-20"}
                            color={"disabled"}>{copied ? "Copied" : "Property ID"}</Typography>
                <Typography variant={"caption"}><code>{propertyId}</code></Typography>
            </div>
            {/*    Copy to clipboard button*/}
            <IconButton size={"small"}>
                <ContentPasteIcon size={"smallest"}
                                  onClick={useCallback(() => {
                                      navigator.clipboard.writeText(propertyId);
                                      setCopied(true);
                                      setTimeout(() => setCopied(false), 2000);
                                  }, [propertyId])}
                />
            </IconButton>
        </div>
    );
}
