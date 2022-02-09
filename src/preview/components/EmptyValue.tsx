import React from "react";
import { styled } from '@mui/material/styles';
import { Theme } from "@mui/material";
const PREFIX = 'EmptyValue';

const classes = {
    root: `${PREFIX}-root`
};

const Root = styled('div')((
    {
        theme
    }
) => ({
    [`&.${classes.root}`]: {
        borderRadius: "9999px",
        backgroundColor: "rgba(128,128,128,0.1)",
        width: "18px",
        height: "6px",
        display: "inline-block"
    }
}));

/**
 * @category Preview components
 */
export function EmptyValue() {

    return <Root className={classes.root}/>;
}
