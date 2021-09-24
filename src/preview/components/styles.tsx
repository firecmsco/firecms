import * as React from "react";

import { Theme } from "@mui/material";

import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        flexCenter: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        },
        smallMargin: {
            margin: theme.spacing(1)
        },
        arrayWrap: {
            display: "flex",
            flexWrap: "wrap"
        },
        array: {
            display: "flex",
            flexDirection: "column"
        },
        arrayItem: {
            margin: theme.spacing(0.5)
        },
        arrayItemBig: {
            margin: theme.spacing(1)
        },
        tableNoBottomBorder: {
            "&:last-child th, &:last-child td": {
                borderBottom: 0
            }
        },
        link: {
            display: "flex",
            wordBreak: "break-word",
            fontWeight: theme.typography.fontWeightMedium
        }
    })
);
