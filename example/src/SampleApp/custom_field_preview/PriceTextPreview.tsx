import React, { ReactElement } from "react";
import { PreviewComponentProps } from "@camberi/firecms";

import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';


export const useStyles = makeStyles(() =>
    createStyles({
        light: {
            fontSize: "small",
            color: "#838383"
        },
    })
);

export default function PriceTextPreview({
                                                 value, property, size, customProps
                                             }: PreviewComponentProps<number>)
    : ReactElement {

    const classes = useStyles();

    return (
        <div className={value ? undefined : classes.light}>
            {value ? value : "Not available"}
        </div>
    );

}
