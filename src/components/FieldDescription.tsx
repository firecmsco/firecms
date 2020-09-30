import React from "react";
import { Property } from "../models";

import {
    Box,
    FormHelperText,
    IconButton,
    Tooltip,
    Typography
} from "@material-ui/core";
import InfoIcon from "@material-ui/icons/InfoOutlined";

interface FieldDescriptionPopoverProps {
    property: Property,
}


export function FieldDescription({ property }: FieldDescriptionPopoverProps) {

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
