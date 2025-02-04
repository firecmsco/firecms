import { ContentCopyIcon, IconButton, Tooltip, Typography } from "@firecms/ui";
import { useCallback, useState } from "react";

export function PropertyIdCopyTooltip({
                                          propertyKey,
                                          className,
                                          children,
                                      }: {
    propertyKey: string,
    className?: string,
    children: React.ReactNode
}) {
    return <Tooltip title={<PropertyIdCopyTooltipContent propertyKey={propertyKey}/>}
                    delayDuration={800}
                    side={"top"}
                    align={"start"}
                    sideOffset={8}
                    className={className}>
            {children}
    </Tooltip>

}

export function PropertyIdCopyTooltipContent({ propertyKey }: { propertyKey: string }) {

    const [copied, setCopied] = useState(false);

    return (
        <div className={"flex flex-row gap-2 items-center justify-center text-white"}>
            <div>
                <Typography variant={"caption"} className={"min-w-20 text-surface-accent-400"}
                            color={"disabled"}>{copied ? "Copied" : "Property ID"}</Typography>
                <Typography variant={"caption"} className={"text-white"}><code>{propertyKey}</code></Typography>
            </div>
            <IconButton size={"small"}>
                <ContentCopyIcon size={"smallest"}
                                 className={"text-white"}
                                 onClick={useCallback(() => {
                                     navigator.clipboard.writeText(propertyKey);
                                     setCopied(true);
                                     setTimeout(() => setCopied(false), 2000);
                                 }, [propertyKey])}
                />
            </IconButton>
        </div>
    );
}
