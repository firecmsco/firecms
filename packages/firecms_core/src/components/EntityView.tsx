import React from "react";
import { Entity, EntityCollection, Properties } from "@firecms/types";
import { cls, defaultBorderMixin, IconButton, OpenInNewIcon, Typography } from "@firecms/ui";
import { CustomizationController } from "@firecms/types";
import { useCustomizationController } from "../hooks/useCustomizationController";
import { useAuthController } from "../hooks";
import { PropertyCollectionView } from "./PropertyCollectionView";

/**
 * @group Components
 */
export interface EntityViewProps<M extends Record<string, any>> {
    entity: Entity<M>;
    collection: EntityCollection<M>;
    path: string;
    className?: string;
}

export function EntityView<M extends Record<string, any>>(
    {
        entity,
        collection,
        path,
        className
    }: EntityViewProps<M>) {

    const customizationController: CustomizationController = useCustomizationController();

    const properties: Properties = collection.properties;

    return (
        <div className={"w-full " + className}>
            <div className={"w-full mb-4 p-4"}>

                <div className={`grid grid-cols-12 gap-x-4 py-4 items-start border-b ${defaultBorderMixin}`}>
                    <div className="col-span-4 pr-2">
                        <Typography variant="caption"
                            color={"secondary"}
                            component={"span"}
                            className="break-words">
                            Id
                        </Typography>
                    </div>
                    <div className="col-span-8">
                        <div
                            className="flex-grow text-surface-900 dark:text-white flex items-center">
                            <span className="flex-grow mr-2">{entity.id}</span>
                            {customizationController?.entityLinkBuilder &&
                                <a href={customizationController.entityLinkBuilder({ entity })}
                                    rel="noopener noreferrer"
                                    target="_blank">
                                    <IconButton>
                                        <OpenInNewIcon
                                            size={"small"} />
                                    </IconButton>
                                </a>}
                        </div>
                    </div>
                </div>

                <PropertyCollectionView data={entity.values} properties={properties} size={"medium"} />

            </div>
        </div>
    );
}
