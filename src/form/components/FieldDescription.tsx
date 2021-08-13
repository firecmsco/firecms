import React from "react";
import { CMSType, Property } from "../../models";

import {
    Box,
    FormHelperText,
    IconButton,
    Tooltip,
    Typography
} from "@material-ui/core";
import InfoIcon from "@material-ui/icons/InfoOutlined";

interface FieldDescriptionPopoverProps<T extends CMSType> {
    property: Property<T>,
}

/**
 * Render the field description for a property
 * @category Form custom fields
 */
export default function FieldDescription<T extends CMSType>({ property }: FieldDescriptionPopoverProps<T>) {

    return (
        <Box display="flex">

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

            <FormHelperText>{property.description}</FormHelperText>
        </Box>
    );
};
