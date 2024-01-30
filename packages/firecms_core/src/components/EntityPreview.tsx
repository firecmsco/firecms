import React, { useMemo } from "react";
import { PropertyPreview } from "../preview";
import { Entity, EntityCollection, ResolvedEntityCollection, ResolvedProperties } from "../types";
import { resolveCollection } from "../util";
import { useFireCMSContext } from "../hooks";
import { cn, defaultBorderMixin, IconButton, OpenInNewIcon } from "@firecms/ui";
import { CustomizationController } from "../types/customization_controller";
import { useCustomizationController } from "../hooks/useCustomizationController";

/**
 * @group Components
 */
export interface EntityPreviewProps<M extends Record<string, any>> {
    entity: Entity<M>;
    collection: EntityCollection<M>;
    path: string;
    className?: string;
}

export function EntityPreview<M extends Record<string, any>>(
    {
        entity,
        collection,
        path,
        className
    }: EntityPreviewProps<M>) {

    const customizationController: CustomizationController = useCustomizationController();
    const resolvedCollection: ResolvedEntityCollection<M> = useMemo(() => resolveCollection<M>({
        collection,
        path,
        entityId: entity.id,
        values: entity.values,
        fields: customizationController.propertyConfigs
    }), [collection, path, entity]);

    const properties: ResolvedProperties = resolvedCollection.properties;

    return (
        <div className={"w-full " + className}>
            <div className={"w-full mb-4"}>
                <div className={cn(defaultBorderMixin, "flex justify-between py-2 border-b last:border-b-0")}>
                    <div className="flex items-center w-1/4">
                        <span className="pl-2 text-sm text-gray-600">Id</span>
                    </div>
                    <div
                        className="flex-grow p-2 ml-2 w-3/4 text-gray-900 dark:text-white min-h-[56px] flex items-center">
                        <span className="flex-grow mr-2">{entity.id}</span>
                        {customizationController?.entityLinkBuilder &&
                            <a href={customizationController.entityLinkBuilder({ entity })}
                               rel="noopener noreferrer"
                               target="_blank">
                                <IconButton>
                                    <OpenInNewIcon
                                        size={"small"}/>
                                </IconButton>
                            </a>}
                    </div>
                </div>
                {Object.entries(properties)
                    .map(([key, property]) => {
                        const value = (entity.values)[key];
                        return (
                            <div
                                key={`reference_previews_${key}`}
                                className={cn(defaultBorderMixin, "flex justify-between py-2 border-b last:border-b-0")}>
                                <div className="flex items-center w-1/4">
                                    <span className="pl-2 text-sm text-gray-600">{property.name}</span>
                                </div>
                                <div
                                    className="flex-grow p-2 ml-2 w-3/4 text-gray-900 dark:text-white min-h-[56px] flex items-center">
                                    <PropertyPreview
                                        propertyKey={key}
                                        value={value}
                                        // entity={entity}
                                        property={property}
                                        size={"medium"}/>
                                </div>
                            </div>
                        )
                    })}
            </div>
        </div>
    );
}
