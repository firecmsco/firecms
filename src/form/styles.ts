import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import { Theme } from "@mui/material";


export const formStyles = makeStyles((theme: Theme) => createStyles({
    paper: {
        elevation: 0,
        padding: theme.spacing(2),
        [theme.breakpoints.up("md")]: {
            padding: theme.spacing(2)
        }
    },
    largePadding: {
        padding: theme.spacing(2),
        [theme.breakpoints.up("md")]: {
            padding: theme.spacing(3)
        }
    },
    inputLabel: {
        marginTop: theme.spacing(1 / 2),
        marginLeft: theme.spacing(1 / 2)
    },
    shrinkInputLabel: {
        marginTop: "-2px",
        marginLeft: theme.spacing(1 / 2)
    },
    buttons: {
        display: "flex",
        justifyContent: "flex-end"
    },
    button: {
        margin: theme.spacing(1)
    },
    form: {
        marginTop: theme.spacing(2)
    },
    input: {
        minHeight: "64px"
    },
    select: {
        paddingTop: theme.spacing(1 / 2)
    },
    oneOfInput: {
        marginBottom: theme.spacing(2)
    }
}));


