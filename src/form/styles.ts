import createStyles from "@material-ui/styles/createStyles";
import makeStyles from "@material-ui/styles/makeStyles";
import { Theme } from "@material-ui/core";


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
        // display: "inline-flex",
        // alignItems: "center",
        // height: "14px"
    },
    stickyButtons: {
        marginTop: theme.spacing(2),
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


