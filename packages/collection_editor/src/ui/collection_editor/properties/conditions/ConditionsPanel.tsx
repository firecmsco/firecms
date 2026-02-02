import { PropsWithChildren } from "react";

import { ExpandablePanel, SettingsIcon, Typography } from "@firecms/ui";

export function ConditionsPanel({
    children
}: PropsWithChildren<{}>) {

    return (
        <ExpandablePanel
            initiallyExpanded={true}
            asField={true}
            innerClassName="p-4"
            title={
                <div className="flex flex-row text-surface-500 text-text-secondary dark:text-text-secondary-dark">
                    <SettingsIcon />
                    <Typography variant={"subtitle2"}
                        className="ml-4">
                        Conditions
                    </Typography>
                </div>
            }>

            {children}

        </ExpandablePanel>
    )
}
