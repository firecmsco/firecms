import { PropsWithChildren } from "react";

import { ExpandablePanel, RuleIcon, Typography } from "@rebasepro/ui";

export function ValidationPanel({
    children
}: { children?: any }) {

    return (
        <ExpandablePanel
            initiallyExpanded={false}
            asField={true}
            innerClassName="p-4"
            title={
                <div className="flex flex-row text-surface-500 text-text-secondary dark:text-text-secondary-dark">
                    <RuleIcon />
                    <Typography variant={"subtitle2"}
                        className="ml-4">
                        Validation
                    </Typography>
                </div>
            }>

            {children}

        </ExpandablePanel>
    )
}
