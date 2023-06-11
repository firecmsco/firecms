import { PropsWithChildren } from "react";
import { ExpandablePanel } from "../ExpandablePanel";
import { useUserConfigurationPersistence } from "../../../hooks/useUserConfigurationPersistence";
import TTypography from "../../../migrated/TTypography";

export function NavigationGroup({
                                    children,
                                    group
                                }: PropsWithChildren<{
    group: string | undefined
}>) {
    const userConfigurationPersistence = useUserConfigurationPersistence();
    return (
        <ExpandablePanel
            invisible={true}
            initiallyExpanded={!(userConfigurationPersistence?.collapsedGroups ?? []).includes(group ?? "ungrouped")}
            onExpandedChange={expanded => {
                if (userConfigurationPersistence) {

                    if (!expanded) {
                        const paths = (userConfigurationPersistence.collapsedGroups ?? []).concat(group ?? "ungrouped");
                        userConfigurationPersistence.setCollapsedGroups(paths);
                    } else {
                        userConfigurationPersistence.setCollapsedGroups((userConfigurationPersistence.collapsedGroups ?? []).filter(g => g !== (group ?? "ungrouped")));
                    }
                }
            }}
            title={<TTypography color={"secondary"}
                                className="weight-500 ml-1">
                {group?.toUpperCase() ?? "Ungrouped views".toUpperCase()}
            </TTypography>}>

            <div className="mb-8">
                {children}
            </div>
        </ExpandablePanel>
    );
}
