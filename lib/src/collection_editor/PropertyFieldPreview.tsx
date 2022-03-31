import React from "react";
import { alpha, Box, Paper, Typography } from "@mui/material";
import { getBadgeForWidget } from "../core/util/property_utils";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import FunctionsIcon from "@mui/icons-material/Functions";
import { Property } from "../models";
import { getWidget } from "../core/util/widgets";
import { editableProperty } from "../core/util/collections";

export function PropertyFieldPreview({
                                         property,
                                         onClick,
                                         hasError,
                                         includeName,
                                         includeEditButton,
                                         selected,
                                     }: {
    property: Property,
    hasError?: boolean,
    selected?: boolean,
    includeName?: boolean,
    includeEditButton?: boolean;
    onClick?: () => void
}) {

    const widget = getWidget(property);
    const disabled = !editableProperty(property);

    return <Box
        onClick={onClick}
        sx={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            pb: 1,
            cursor: "pointer"
        }}>
        <Box sx={{
            mt: 0.5
        }}>
            {getBadgeForWidget(widget)}
        </Box>
        <Box sx={{
            pl: 3,
            width: "100%",
            display: "flex",
            flexDirection: "row"
        }}>
            <Paper variant={"outlined"}
                   sx={(theme) => ({
                       flexGrow: 1,
                       p: 2,
                       border: hasError
                           ? `1px solid ${theme.palette.error.light}`
                           : (selected ? `1px solid ${theme.palette.primary.light}` : undefined),
                       "&:hover": {
                           backgroundColor: onClick ? alpha(theme.palette.primary.light, 0.05) : undefined
                       }
                   })}
                   elevation={0}>

                <Box
                    sx={(theme) => ({
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                    })}>

                    {includeName && <Typography variant="subtitle1"
                                                component="span"
                                                sx={{ flexGrow: 1, pr: 2 }}>
                        {property.name
                            ? property.name
                            : "\u00a0"
                        }
                    </Typography>}

                    <Box sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center"
                    }}>
                        <Typography sx={{ flexGrow: 1, pr: 2 }}
                                    variant={includeName ? "body2" : "subtitle1"}
                                    component="span"
                                    color="text.secondary">
                            {widget?.name}
                        </Typography>
                        <Typography variant="body2"
                                    component="span"
                                    color="text.disabled">
                            {property.dataType}
                        </Typography>

                        {disabled && <Box
                            sx={{
                                fontSize: "14px",
                                height: "14px",
                                ml: 0.5
                            }}>
                            <RemoveCircleIcon color={"disabled"}
                                              fontSize={"inherit"}/>
                        </Box>}
                    </Box>
                </Box>

                {includeEditButton && <Typography variant={"button"}>
                    Edit
                </Typography>}

            </Paper>
        </Box>
    </Box>
}

export function PropertyBuilderPreview({
                                           name,
                                           selected,
                                           onClick
                                       }: {
    name: string,
    selected: boolean,
    onClick?: () => void,
}) {

    return (
        <Box
            onClick={onClick}
            sx={{
                display: "flex",
                flexDirection: "row",
                width: "100%",
                pb: 1,
                cursor: "pointer"
            }}>
            <Box sx={{
                background: "#888",
                height: "32px",
                mt: 0.5,
                padding: 0.5,
                borderRadius: "50%",
                boxShadow: "0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
                color: "white"
            }}>
                <FunctionsIcon color={"inherit"} fontSize={"medium"}/>
            </Box>
            <Box sx={{
                pl: 3,
                width: "100%",
                display: "flex",
                flexDirection: "row"
            }}>
                <Paper variant={"outlined"}
                       sx={(theme) => ({
                           flexGrow: 1,
                           p: 2,
                           border: selected ? `1px solid ${theme.palette.primary.light}` : undefined
                       })}
                       elevation={0}>

                    <Box sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column"
                    }}>
                        <Typography variant="body2"
                                    component="span"
                                    color="text.disabled">
                            <Box sx={{
                                fontSize: "14px"
                            }}>
                                <RemoveCircleIcon color={"disabled"}
                                                  fontSize={"inherit"}/>
                            </Box>
                            {name}
                        </Typography>
                        <Typography sx={{ flexGrow: 1, pr: 2 }}
                                    variant="body2"
                                    component="span"
                                    color="text.secondary">
                            This property can only be edited in code
                        </Typography>
                    </Box>

                </Paper>
            </Box>
        </Box>)
}
