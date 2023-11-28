import { PropsWithChildren } from "react";

import { ExpandablePanel, RuleIcon, Typography } from "@firecms/core";

export function ValidationPanel({
                                    children
                                }: PropsWithChildren<{}>) {

    return (
        <ExpandablePanel
            initiallyExpanded={false}
            asField={true}
            className="p-4"
            title={
                <div className="flex flex-row text-gray-500">
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
