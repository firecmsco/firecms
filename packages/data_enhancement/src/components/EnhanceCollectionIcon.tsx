import React from "react";

import { EntityCollection, PluginHomePageActionsProps, useTranslation } from "@firecms/core";
import { AutoFixHighIcon, Tooltip } from "@firecms/ui";

export function EnhanceCollectionIcon({
                                          extraProps,
                                          path,
                                          collection
                                      }: PluginHomePageActionsProps<{
    getConfigForPath?: (props: { path: string, collection: EntityCollection }) => boolean;
}>) {
    const { t } = useTranslation();
    const [showIcon, setShowIcon] = React.useState(false);
    React.useEffect(() => {
        if (!extraProps?.getConfigForPath) {
            setShowIcon(true);
            return;
        }
        const config = extraProps.getConfigForPath({
            path,
            collection
        })
        if (config) {
            setShowIcon(true);
        }
    }, [collection, extraProps?.getConfigForPath, path]);

    if (showIcon)
        return <Tooltip
            title={t("use_openai_generate_content")}>
            <AutoFixHighIcon/>
        </Tooltip>;
    return null;
}
