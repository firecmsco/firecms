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
    select: {
        paddingTop: theme.spacing(1 / 2)
    },
    oneOfInput: {
        marginBottom: theme.spacing(2)
    }
}));


