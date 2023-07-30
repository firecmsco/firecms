import React from "react";
import clsx from "clsx";

import { Entity, ResolvedStringProperty } from "../../types";
import { PreviewSize, PropertyPreview } from "../../preview";

import { ErrorBoundary } from "../../core";
import { IconButton } from "../../components";
import { paperMixin } from "../../styles";
import { Tooltip } from "../../components/Tooltip";
import { RemoveIcon } from "../../icons";

interface StorageItemPreviewProps {
    name: string;
    property: ResolvedStringProperty;
    value: string,
    entity: Entity<any>,
    onRemove: (value: string) => void;
    size: PreviewSize;
    disabled: boolean;
}

export function StorageItemPreview({
                                       name,
                                       property,
                                       value,
                                       entity,
                                       onRemove,
                                       disabled,
                                       size
                                   }: StorageItemPreviewProps) {

    return (
        <div className={clsx(paperMixin,
            "relative m-4 border-box flex items-center justify-center",
            size === "medium" ? "min-w-[220px] min-h-[220px]" : "min-w-[118px] min-h-[118px]")}>

            {!disabled &&
                <div
                    className="absolute rounded-full -top-2 -right-2 z-10 bg-white dark:bg-gray-900">

                    <Tooltip
                        title="Remove">
                        <IconButton
                            size={"small"}
                            onClick={(event) => {
                                event.stopPropagation();
                                onRemove(value);
                            }}>
                            <RemoveIcon size={"small"}/>
                        </IconButton>
                    </Tooltip>
                </div>
            }

            {value &&
                <ErrorBoundary>
                    <PropertyPreview propertyKey={name}
                                     value={value}
                                     property={property}
                                     entity={entity}
                                     size={size}/>
                </ErrorBoundary>
            }


        </div>
    );

}
