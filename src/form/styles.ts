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
    stickyButtons: {
        marginTop:theme.spacing(2),
        backgroundColor: "#ffffffb8",
        borderTop: "solid 1px #f9f9f9",
        position: "sticky",
        bottom: 0,
        zIndex: 200
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


