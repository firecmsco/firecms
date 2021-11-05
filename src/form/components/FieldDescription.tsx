import React from "react";
import { CMSType, Property } from "../../models";

import {
    Box,
    FormHelperText,
    IconButton,
    Tooltip,
    Typography
} from "@mui/material";
import InfoIcon from "@mui/icons-material/InfoOutlined";

interface FieldDescriptionPopoverProps<T extends CMSType> {
    property: Property<T>,
}

/**
 * Render the field description for a property
 * @category Form custom fields
 */
export function FieldDescription<T extends CMSType>({ property }: FieldDescriptionPopoverProps<T>) {
    const disabledTooltip: string | undefined = typeof property.disabled === "object" ? property.disabled.disabledMessage : undefined;
    return (

        // <FormHelperText>{disabledTooltip ? disabledTooltip : property.description}</FormHelperText>
        <Box display="flex">

            <Box flexGrow={1}>
                <FormHelperText>{disabledTooltip ? disabledTooltip : property.description}</FormHelperText>
            </Box>

            {property.longDescription &&
            <Tooltip title={
                <Typography
                    variant={"caption"}>{property.longDescription}</Typography>
            }
                     placement="bottom-start"
                     arrow>
                <IconButton
                    edge={"start"}
                    size={"small"}>

                    <InfoIcon color={"disabled"}
                              fontSize={"small"}/>
                </IconButton>
            </Tooltip>}

        </Box>
    );
}
