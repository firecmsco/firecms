import React from "react";
import { hashString } from "./hash";
import { coolIconKeys, Icon, IconColor, iconKeys } from "@firecms/ui";
import { slugify } from "./strings";
import equal from "react-fast-compare"

export function getIcon(iconKey?: string,
                        className?: string,
                        color?: IconColor,
                        size?: "smallest" | "small" | "medium" | "large" | number,): React.ReactElement | undefined {
    if (!iconKey) return undefined;
    iconKey = slugify(iconKey);
    if (!(iconKey in iconKeysMap)) {
        return undefined;
    }
    return iconKey in iconKeysMap ?
        <Icon iconKey={iconKey} size={size} className={className} color={color}/> : undefined;
}

export type IconViewProps = {
    path: string;
    name: string;
    singularName?: string;
    group?: string;
    icon?: string;
}

export const IconForView = React.memo(
    function IconForView({
                             collectionOrView,
                             className,
                             color,
                             size = "medium",
                         }: {
        collectionOrView?: IconViewProps,
        color?: IconColor,
        className?: string,
        size?: "smallest" | "small" | "medium" | "large" | number,
    }): React.ReactElement {
        if (!collectionOrView) return <></>;
        const icon = getIcon(collectionOrView.icon, className, color, size);
        if (collectionOrView?.icon && icon)
            return icon;

        let slugName = slugify(("singularName" in collectionOrView ? collectionOrView.singularName : undefined) ?? collectionOrView.name);

        let key: string | undefined;
        if (slugName in iconKeysMap)
            key = slugName;

        if (!key) {
            slugName = slugify(collectionOrView.path);
            if (slugName in iconKeysMap)
                key = slugName;
        }

        const iconsCount = coolIconKeys.length;

        if (!key)
            key = coolIconKeys[hashString(collectionOrView.path) % iconsCount];

        return <Icon iconKey={key} size={size} className={className} color={color}/>;
    }, (prevProps, nextProps) => {
        return equal(prevProps.collectionOrView?.icon, nextProps.collectionOrView?.icon) && equal(prevProps.color, nextProps.color);
    });

const iconKeysMap: Record<string, string> = iconKeys.reduce((acc: Record<string, string>, key) => {
    acc[key] = key;
    return acc;
}, {});
