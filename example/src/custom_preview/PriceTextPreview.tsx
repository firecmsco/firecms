import React, { ReactElement } from "react";
import { PreviewComponentProps } from "@camberi/firecms";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";


export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        light: {
            fontSize: "small",
            color: "#838383"
        },
    })
);

export default function PriceTextPreview({
                                                 value, property, size
                                             }: PreviewComponentProps<number>)
    : ReactElement {

    const classes = useStyles();

    return (
        <div className={value ? undefined : classes.light}>
            {value ? value : "Not available"}
        </div>
    );

}
