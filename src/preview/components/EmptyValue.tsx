import React from "react";
import { Theme } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles<Theme>(theme => createStyles({
        root: {
            borderRadius: "9999px",
            backgroundColor: "rgba(128,128,128,0.1)",
            width: "18px",
            height: "6px",
            display: "inline-block"
        }
    })
);

/**
 * @category Preview components
 */
export function EmptyValue() {
    const classes = useStyles();
    return (
        <div className={classes.root}/>
    );
}
