import type { EntityCollection } from "../../types/collections";
import type { Property } from "@rebasepro/types";import * as React from "react";

import {
    Chip,
    cls,
    defaultBorderMixin,
    KeyboardBackspaceIcon,
    Tooltip,
    Typography
} from "@rebasepro/ui";
import { PreviewSize } from "../../types/components/PropertyPreviewProps";import {
    getValueInPath
} from "@rebasepro/common";
import { getPropertyInPath } from "@rebasepro/core";
import { PropertyPreview, SkeletonPropertyComponent } from "../../preview";
import { useAuthController } from "@rebasepro/core";
import { UserChip } from "./UserChip";
import { HistoryEntryData } from "@rebasepro/core";

/**
 * Shallow-deep equality: uses JSON.stringify for objects, strict equality for primitives.
 */
function deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (a == null || b == null) return a === b;
    if (typeof a === "object" && typeof b === "object") {
        return JSON.stringify(a) === JSON.stringify(b);
    }
    return false;
}

export type EntityHistoryEntryProps = {
    size: PreviewSize;
    actions?: React.ReactNode;
    collection?: EntityCollection;
    hover?: boolean;
    entry: HistoryEntryData;
    onClick?: (e: React.SyntheticEvent) => void;
};

function PreviousValueView({
    previousValueInPath,
    childProperty,
    propertyKey
}: {
    previousValueInPath: unknown;
    childProperty: Property;
    propertyKey: string;
}) {
    if (typeof previousValueInPath === "string" || typeof previousValueInPath === "number") {
        return <Typography variant={"caption"} color={"secondary"} className="line-through">
            {previousValueInPath}
        </Typography>;
    } else if (typeof previousValueInPath === "boolean") {
        return <Typography variant={"caption"} color={"secondary"} className="line-through">
            {previousValueInPath ? "true" : "false"}
        </Typography>;
    } else {
        return <Tooltip
            side={"left"}
            title={<div className={"flex flex-col gap-2"}>
                <Typography variant={"caption"} color={"secondary"}>
                    Previous value
                </Typography>
                <PropertyPreview
                    propertyKey={propertyKey as string}
                    value={previousValueInPath as never}
                    property={childProperty as Property}
                    size={"small"} />
            </div>}>
            <KeyboardBackspaceIcon size={"smallest"} color={"disabled"} className={"mb-1"} />
        </Tooltip>
    }
}

/**
 * Displays a single entity history revision entry.
 * Adapted from the entity_history plugin — now reads from backend API data.
 */
export function EntityHistoryEntry({
    actions,
    hover,
    collection,
    size,
    entry
}: EntityHistoryEntryProps) {

    const authController = useAuthController();

    const changedFields = entry.changed_fields;
    const previousValues = entry.previous_values;
    const updatedOn = new Date(entry.updated_at);
    const updatedBy = entry.updated_by;

    // Resolve user display
    const currentUser = authController.user;
    const userDisplay = updatedBy === currentUser?.uid
        ? currentUser
        : undefined;

    return <div className={"w-full flex flex-col gap-2 mt-4"}>
        <div className={"ml-4 flex items-center gap-4"}>
            <Typography variant={"body2"} color={"secondary"}>
                {updatedOn.toLocaleString()}
            </Typography>
            <Chip size={"small"}>
                {entry.action}
            </Chip>
            {!userDisplay && updatedBy && <Chip size={"small"}>{updatedBy}</Chip>}
            {userDisplay && <UserChip user={userDisplay} />}
        </div>
        <div
            className={cls(
                "bg-white dark:bg-surface-900",
                "min-h-[44px]",
                "w-full",
                "items-center",
                hover ? "hover:bg-surface-accent-50 dark:hover:bg-surface-800" : "",
                size === "small" ? "p-1" : "px-2 py-1",
                "flex border rounded-lg",
                defaultBorderMixin
            )}>

            {actions}

            <div className={"flex flex-col grow w-full m-1 shrink min-w-0"}>

                {changedFields && collection && changedFields.map((key) => {
                    const childProperty = getPropertyInPath(collection.properties, key);
                    const valueInPath = entry.values ? getValueInPath(entry.values, key) : undefined;
                    const previousValueInPath = previousValues ? getValueInPath(previousValues, key) : undefined;

                    const element = childProperty
                        ? <PropertyPreview
                            propertyKey={key}
                            value={valueInPath as never}
                            property={childProperty as Property}
                            size={"small"} />
                        : <Typography variant={"body2"}>
                            {typeof valueInPath === "string" ? valueInPath : JSON.stringify(valueInPath)}
                        </Typography>;

                    return (
                        <div key={"ref_prev_" + key}
                            className="flex w-full my-1 items-center">
                            <Typography variant={"caption"}
                                color={"secondary"}
                                className="min-w-[140px] md:min-w-[200px] w-1/5 pr-8 overflow-hidden text-ellipsis text-right">
                                {key}
                            </Typography>
                            <div className="w-4/5">
                                {previousValueInPath !== undefined && !deepEqual(previousValueInPath, valueInPath) &&
                                    <PreviousValueView previousValueInPath={previousValueInPath}
                                        childProperty={childProperty as Property}
                                        propertyKey={key} />
                                }
                                {element}
                            </div>
                        </div>
                    );
                })}

                {(!changedFields || changedFields.length === 0) && (
                    <Typography variant={"caption"} color={"secondary"} className="ml-4">
                        {entry.action === "create" ? "Entity created" :
                            entry.action === "delete" ? "Entity deleted" : "No field changes recorded"}
                    </Typography>
                )}

            </div>

        </div>
    </div>;
}
