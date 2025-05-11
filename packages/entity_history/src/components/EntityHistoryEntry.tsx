import * as React from "react";

import { Chip, cls, defaultBorderMixin, IconButton, KeyboardTabIcon, Tooltip, Typography } from "@firecms/ui";
import {
    Entity,
    EntityCollection,
    getPropertyInPath,
    getValueInPath,
    PreviewSize,
    PropertyPreview,
    resolveCollection,
    ResolvedProperty,
    SkeletonPropertyComponent,
    useAuthController,
    useCustomizationController,
    useNavigationController,
    useSideEntityController
} from "@firecms/core";
import { useHistoryController } from "../HistoryControllerProvider";
import { UserChip } from "./UserChip";

export type EntityPreviewProps = {
    size: PreviewSize,
    actions?: React.ReactNode,
    collection?: EntityCollection,
    hover?: boolean;
    previewKeys?: string[],
    disabled?: boolean,
    entity: Entity<any>,
    onClick?: (e: React.SyntheticEvent) => void;
};

/**
 * This view is used to display a preview of an entity.
 * It is used by default in reference fields and whenever a reference is displayed.
 */
export function EntityHistoryEntry({
                                       actions,
                                       disabled,
                                       hover,
                                       collection: collectionProp,
                                       previewKeys,
                                       onClick,
                                       size,
                                       entity
                                   }: EntityPreviewProps) {

    const authController = useAuthController();
    const customizationController = useCustomizationController();

    const navigationController = useNavigationController();
    const sideEntityController = useSideEntityController();

    const collection = collectionProp ?? navigationController.getCollection(entity.path);
    const updatedOn = entity.values?.["__metadata"]?.["updated_on"];
    if (!collection) {
        throw Error(`Couldn't find the corresponding collection view for the path: ${entity.path}`);
    }

    const updatedBy = entity.values?.["__metadata"]?.["updated_by"];
    const { getUser } = useHistoryController();
    const user = getUser?.(updatedBy);

    const resolvedCollection = React.useMemo(() => resolveCollection({
        collection,
        path: entity.path,
        values: entity.values,
        propertyConfigs: customizationController.propertyConfigs,
        authController
    }), [collection]);

    return <div className={"w-full flex flex-col gap-2 mt-4"}>
        <div className={"ml-4 flex items-center gap-4"}>
            <Typography variant={"body2"} color={"secondary"}>{updatedOn.toLocaleString()}</Typography>
            {!user && updatedBy && <Chip size={"small"}>{updatedBy}</Chip>}
            {user && <UserChip user={user}/>}
        </div>
        <div
            className={cls(
                "bg-white dark:bg-surface-900",
                "min-h-[42px]",
                "w-full",
                "items-center",
                hover ? "hover:bg-surface-accent-50 dark:hover:bg-surface-800 group-hover:bg-surface-accent-50 dark:group-hover:bg-surface-800" : "",
                size === "small" ? "p-1" : "px-2 py-1",
                "flex border rounded-lg",
                onClick ? "cursor-pointer" : "",
                defaultBorderMixin
            )}>


            {actions}

            {entity &&
                <Tooltip title={"See details for this revision"}
                         className={"my-2 grow-0 shrink-0 self-start"}>
                    <IconButton
                        color={"inherit"}
                        className={""}
                        onClick={(e) => {

                            sideEntityController.open({
                                entityId: entity.id,
                                path: entity.path,
                                allowFullScreen: false,
                                collection: {
                                    ...collection,
                                    subcollections: undefined,
                                    entityViews: undefined,
                                    permissions: {
                                        create: false,
                                        delete: false,
                                        edit: false,
                                        read: true
                                    }
                                },
                                updateUrl: true
                            });
                        }}>
                        <KeyboardTabIcon/>
                    </IconButton>
                </Tooltip>}

            <div className={"flex flex-col grow w-full m-1 shrink min-w-0"}>

                {previewKeys && previewKeys.map((key) => {
                    const childProperty = getPropertyInPath(resolvedCollection.properties, key);
                    if (!childProperty) return null;

                    const valueInPath = getValueInPath(entity.values, key);
                    return (
                        <div key={"ref_prev_" + key}
                             className="flex w-full my-1 items-center">
                            <Typography variant={"caption"}
                                        color={"secondary"}
                                        className="min-w-[140px] md:min-w-[200px] w-1/5 pr-8 overflow-hidden text-ellipsis text-right">
                                {key}
                            </Typography>
                            <div className="w-4/5">
                                {
                                    entity
                                        ? <PropertyPreview
                                            propertyKey={key as string}
                                            value={valueInPath}
                                            property={childProperty as ResolvedProperty}
                                            size={"small"}/>
                                        : <SkeletonPropertyComponent
                                            property={childProperty as ResolvedProperty}
                                            size={"small"}/>
                                }
                            </div>
                        </div>
                    );
                })}

            </div>

        </div>
    </div>
}

