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
    greyPaper: {
        backgroundColor: "rgba(0, 0, 0, 0.09)"
    },
    inputLabel: {
        marginTop: "4px",
        marginLeft: "4px"
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
        minHeight: "64px",
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1)
    },
    oneOfInput: {
        marginBottom: theme.spacing(2)
    }
}));


