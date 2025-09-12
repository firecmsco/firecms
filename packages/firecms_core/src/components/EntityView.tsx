import React from "react";
import { PropertyPreview } from "../preview";
import { CustomizationController, Entity, EntityCollection, Properties } from "@firecms/types";
import { cls, defaultBorderMixin, IconButton, OpenInNewIcon } from "@firecms/ui";
import { useCustomizationController } from "../hooks/useCustomizationController";

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
            <div className={"w-full mb-4"}>
                <div className={cls(defaultBorderMixin, "flex justify-between py-2 border-b last:border-b-0")}>
                    <div className="flex items-center w-1/4">
                        <span className="pl-2 text-sm text-surface-600">Id</span>
                    </div>
                    <div
                        className="grow p-2 ml-2 w-3/4 text-surface-900 dark:text-white min-h-[56px] flex items-center">
                        <span className="grow mr-2">{entity.id}</span>
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
                        const value = entity.values?.[key];
                        return (
                            <div
                                key={`reference_previews_${key}`}
                                className={cls(defaultBorderMixin, "flex justify-between py-2 border-b last:border-b-0")}>
                                <div className="flex items-center w-1/4">
                                    <span className="pl-2 text-sm text-surface-600">{property.name}</span>
                                </div>
                                <div
                                    className="grow p-2 ml-2 w-3/4 text-surface-900 dark:text-white min-h-[56px] flex items-center">
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
