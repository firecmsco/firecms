import React from "react";
import { CMSType, ResolvedProperty } from "../../types";

import InfoIcon from "@mui/icons-material/InfoOutlined";
import { Typography } from "../../components/Typography";
import { IconButton } from "../../components";
import { Tooltip } from "../../components/Tooltip";

interface FieldDescriptionPopoverProps<T extends CMSType> {
    property: ResolvedProperty<T>,
}

/**
 * Render the field description for a property
 * @category Form custom fields
 */
export function FieldDescription<T extends CMSType>({ property }: FieldDescriptionPopoverProps<T>) {
    const disabledTooltip: string | undefined = typeof property.disabled === "object" ? property.disabled.disabledMessage : undefined;
    return (
        <div className={"flex"}>
            <Typography variant={"caption"}
                        className={"flex-grow"}>
                {disabledTooltip || property.description}
            </Typography>

            {property.longDescription &&
                <Tooltip title={property.longDescription}
                         placement="bottom"
                         >
                    <IconButton
                        size={"small"}
                        className="self-start">

                        <InfoIcon color={"disabled"}
                                  fontSize={"small"}/>
                    </IconButton>
                </Tooltip>}

        </div>
    );
}
