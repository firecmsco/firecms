import React from "react";
import { Property } from "../models";

import {
    Box,
    FormHelperText,
    IconButton,
    Popover,
    Typography
} from "@material-ui/core";
import InfoIcon from "@material-ui/icons/InfoOutlined";

interface FieldDescriptionPopoverProps {
    property: Property,
}

export const FieldDescription: React.FunctionComponent<FieldDescriptionPopoverProps> = ({ property }: FieldDescriptionPopoverProps) => {

    return (
        <Box display="flex">
            {property.longDescription &&
            <FieldInfoPopover content={property.longDescription}
                              light={!!property.disabled}/>}
            <FormHelperText>{property.description}</FormHelperText>
        </Box>
    );
};


interface FieldInfoPopoverProps {
    content: string,
    light: boolean,
}

function FieldInfoPopover({ content, light }: FieldInfoPopoverProps) {
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? "info-popover" : undefined;

    return (
        <React.Fragment>
            <IconButton
                edge={"start"}
                size={"small"}
                onClick={handleClick}>
                <InfoIcon color={light ? "disabled" : "inherit"}
                          fontSize={"small"}/>
            </IconButton>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                elevation={1}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right"
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "left"
                }}
            >
                <Box m={1}>
                    <Typography variant={"caption"}>{content}</Typography>
                </Box>
            </Popover>
        </React.Fragment>
    );
}

