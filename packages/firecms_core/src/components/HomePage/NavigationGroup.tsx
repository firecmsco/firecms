import React, { PropsWithChildren } from "react";
import { Typography } from "@firecms/ui";

export function NavigationGroup({
                                    children,
                                    group
                                }: PropsWithChildren<{ group: string | undefined }>) {
    return (
        <section className="mb-8">
            <Typography
                color="secondary"
                className="ml-3.5 mt-12 font-medium uppercase text-sm text-surface-600 dark:text-surface-400">
                {group ?? "Views"}
            </Typography>
            <div className="mt-4">{children}</div>
        </section>
    );
}
