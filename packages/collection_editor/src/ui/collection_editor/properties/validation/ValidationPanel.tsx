import { PropsWithChildren } from "react";

import { ExpandablePanel, RuleIcon, Typography } from "@firecms/ui";

export function ValidationPanel({
                                    children
                                }: PropsWithChildren<{}>) {

    return (
        <ExpandablePanel
            initiallyExpanded={false}
            asField={true}
            innerClassName="p-4"
            title={
                <div className="flex flex-row text-surface-500">
                    <RuleIcon/>
                    <Typography variant={"subtitle2"}
                                className="ml-2">
                        Validation
                    </Typography>
                </div>
            }>

            {children}

        </ExpandablePanel>
    )
}
