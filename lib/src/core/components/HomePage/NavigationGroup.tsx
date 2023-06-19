import { PropsWithChildren } from "react";
import { ExpandablePanel } from "../ExpandablePanel";
import { useUserConfigurationPersistence } from "../../../hooks/useUserConfigurationPersistence";
import Text from "../../../components/Text";

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
            title={<Text color={"secondary"}
                                className="weight-500 ml-1">
                {group?.toUpperCase() ?? "Ungrouped views".toUpperCase()}
            </Text>}>

            <div className="mb-8">
                {children}
            </div>
        </ExpandablePanel>
    );
}
