import React from "react";

import { PreviewSize, StringProperty } from "@firecms/types";
import { PropertyPreview } from "../../preview";

import { cls, DescriptionIcon, IconButton, paperMixin, RemoveIcon, Tooltip } from "@firecms/ui";
import { ErrorBoundary } from "../../components";

interface StorageItemPreviewProps {
    name: string;
    property: StringProperty;
    value: string,
    onRemove: (value: string) => void;
    size: PreviewSize;
    disabled: boolean;
    placeholder?: boolean;
    className?: string;
}

export function StorageItemPreview({
                                       name,
                                       property,
                                       value,
                                       onRemove,
                                       disabled,
                                       size,
                                       placeholder,
                                       className
                                   }: StorageItemPreviewProps) {

    return (
        <div className={cls(paperMixin,
            "relative border-box flex items-center justify-center",
            size === "large" ? "min-w-[220px] min-h-[220px] max-w-[220px]" : "min-w-[118px] min-h-[118px] max-w-[118px]",
            className)}>

            {!placeholder && !disabled &&
                <div
                    className="absolute rounded-full -top-2 -right-2 z-10 bg-white dark:bg-surface-900">

                    <Tooltip
                        asChild={true}
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

            {!placeholder && value &&
                <ErrorBoundary>
                    <PropertyPreview propertyKey={name}
                                     value={value}
                                     property={property}
                                     interactive={false}
                                     size={size}/>
                </ErrorBoundary>
            }

            {placeholder &&
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex flex-col items-center justify-center w-full h-full">
                    <DescriptionIcon className="text-surface-700 dark:text-surface-300"/>
                </div>
            }


        </div>
    );

}
