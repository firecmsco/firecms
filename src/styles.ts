import { createStyles, makeStyles } from "@material-ui/core";


export const formStyles = makeStyles(theme => createStyles({
    paper: {
        elevation: 0,
        padding: theme.spacing(1),
        [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
            padding: theme.spacing(2)
        }
    },
    largePadding: {
        padding: theme.spacing(2),
        [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
            padding: theme.spacing(3)
        }
    },
    greyPaper: {
        backgroundColor: "rgba(0, 0, 0, 0.09)"
    },
    inputLabel: {
        display: "inline-flex",
        alignItems: "center",
        height: "14px"
    },
    formPaper: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        padding: theme.spacing(2),
        [theme.breakpoints.up("md")]: {
            padding: theme.spacing(1)
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
    }
}));


