import { ContentCopyIcon, IconButton, Typography } from "@firecms/ui";
import { useCallback, useState } from "react";

export function PropertyIdCopyTooltipContent({ propertyId }: { propertyId: string }) {

    const [copied, setCopied] = useState(false);

    return (
        <div className={"flex flex-row gap-2 items-center justify-center text-white"}>
            <div>
                <Typography variant={"caption"} className={"min-w-20 text-slate-400"}
                            color={"disabled"}>{copied ? "Copied" : "Property ID"}</Typography>
                <Typography variant={"caption"} className={"text-white"}><code>{propertyId}</code></Typography>
            </div>
            <IconButton size={"small"}>
                <ContentCopyIcon size={"smallest"}
                                  className={"text-white"}
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
