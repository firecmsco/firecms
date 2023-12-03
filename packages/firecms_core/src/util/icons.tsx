import React from "react";
import { CMSView, EntityCollection } from "../types";
import { hashString } from "./hash";
import { Icon } from "../icons";
import { slugify } from "./strings";
import { coolIconKeys, iconKeys } from "../icons/icon_keys";

export function getIcon(iconKey?: string, className?:string): React.ReactElement | undefined {
    if (!iconKey) return undefined;
    iconKey = slugify(iconKey);
    if (!(iconKey in iconKeysMap)) {
        return undefined;
    }
    return iconKey in iconKeysMap ? <Icon iconKey={iconKey} size={"medium"} className={className}/> : undefined;
}

export function getIconForView(collectionOrView: EntityCollection | CMSView, className?:string): React.ReactElement {

    const icon = getIcon(collectionOrView.icon, className);
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

    return <Icon iconKey={key} size={"medium"} className={className}/>;
}

const iconKeysMap: Record<string, string> = iconKeys.reduce((acc: Record<string, string>, key) => {
    acc[key] = key;
    return acc;
}, {});
