import {
    PreviewComponentFactoryProps,
    PreviewComponentProps,
    PreviewSize
} from "../PreviewComponentProps";
import ErrorBoundary from "../../components/ErrorBoundary";

import React from "react";

import {
    Box,
    createStyles,
    Divider,
    Grid,
    makeStyles,
    Theme
} from "@material-ui/core";
import { PreviewComponent } from "../PreviewComponent";


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        tableNoBottomBorder: {
            "&:last-child th, &:last-child td": {
                borderBottom: 0
            }
        }
    })
);

export function ArrayPreview({
                                       name,
                                       value,
                                       property,
                                       size,
                                       entitySchema,
                                       PreviewComponent
                                   }: PreviewComponentProps<any[]> & PreviewComponentFactoryProps) {

    if (property.dataType !== "array")
        throw Error("Picked wrong preview component ArrayPreview");

    const values = value;

    if (!values) return null;

    const childSize: PreviewSize = size === "regular" ? "small" : "tiny";

    return (
        <Grid>
            {values &&
            values.map((value, index) =>
                <React.Fragment key={"preview_array_" + value + "_" + index}>
                    <Box p={1}>
                        <ErrorBoundary>
                            <PreviewComponent
                                name={name}
                                value={value}
                                property={property.of}
                                size={childSize}
                                entitySchema={entitySchema}/>
                        </ErrorBoundary>
                    </Box>
                    {index < values.length - 1 && <Divider/>}
                </React.Fragment>
            )}
        </Grid>
    );
}
