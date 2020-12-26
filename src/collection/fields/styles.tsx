import React from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core";


export const useInputStyles = makeStyles<Theme>(theme => createStyles({
        input: {
            padding: 0,
            margin: 0,
            width: "100%",
            color: "unset",
            fontWeight: "unset",
            lineHeight: "unset",
            fontSize: "unset",
            fontFamily: "unset",
            background: "unset",
            border: "unset",
            resize: "none",
            outline: "none"
        },
        select: {
            height: "100%"
        },
        hidden: {
            display: "none"
        },
        selectRoot: {
            display: "flex",
            alignItems: "center",
            height: "100%"
        },
        numberInput: {
            textAlign: "right"
        }
    })
);
