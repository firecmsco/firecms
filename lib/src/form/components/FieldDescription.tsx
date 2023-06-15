import React from "react";
import { CMSType, ResolvedProperty } from "../../types";

import { FormHelperText, IconButton, Tooltip } from "@mui/material";
import InfoIcon from "@mui/icons-material/InfoOutlined";
import TTypography from "../../components/TTypography";

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

        // <FormHelperText>{disabledTooltip ? disabledTooltip : property.description}</FormHelperText>
        <div className={"flex"}>

            <div className={"flex-grow"}>
                <FormHelperText>{disabledTooltip || property.description}</FormHelperText>
            </div>

            {property.longDescription &&
                <Tooltip title={
                    <TTypography
                        variant={"caption"}>{property.longDescription}</TTypography>
                }
                         placement="bottom-start"
                         arrow>
                    <IconButton
                        edge={"start"}
                        size={"small"}
                        className="self-start">

                        <InfoIcon color={"disabled"}
                                  fontSize={"small"}/>
                    </IconButton>
                </Tooltip>}

        </div>
    );
}
