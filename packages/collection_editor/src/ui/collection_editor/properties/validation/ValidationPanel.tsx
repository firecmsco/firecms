import { PropsWithChildren } from "react";

import { ExpandablePanel, RuleIcon, Typography } from "@firecms/ui";
import { useTranslation } from "@firecms/core";

export function ValidationPanel({
                                    children
                                }: PropsWithChildren<{}>) {

    const { t } = useTranslation();

    return (
        <ExpandablePanel
            initiallyExpanded={false}
            asField={true}
            innerClassName="p-4"
            title={
                <div className="flex flex-row text-surface-500 text-text-secondary dark:text-text-secondary-dark">
                    <RuleIcon/>
                    <Typography variant={"subtitle2"}
                                className="ml-4">
                        {t("validation")}
                    </Typography>
                </div>
            }>

            {children}

        </ExpandablePanel>
    )
}
