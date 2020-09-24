import { createStyles, makeStyles, Theme } from "@material-ui/core";
import { lighten } from "@material-ui/core/styles";

const drawerWidth = 240;

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: "flex",
            width: "100%",
            marginTop: theme.spacing(3)
        },
        drawer: {
            // [theme.breakpoints.up("md")]: {
            //     width: drawerWidth,
            //     flexShrink: 0
            // }
        },
        appBar: {
            [theme.breakpoints.up("md")]: {
                width: `calc(100% - ${drawerWidth}px)`,
                marginLeft: drawerWidth
            }
        },
        menuButton: {
            marginRight: theme.spacing(2),
            // [theme.breakpoints.up("md")]: {
            //     display: "none"
            // }
        },
        grow: {
            flexGrow: 1
        },
        field: {
            minHeight: 56
        },
        toolbar: {
            minHeight: 56,
            [`${theme.breakpoints.up("xs")} and (orientation: landscape)`]: {
                minHeight: 48
            },
            [theme.breakpoints.up("sm")]: {
                minHeight: 64
            }
        },
        tableNoBottomBorder: {
            "&:last-child th, &:last-child td": {
                borderBottom: 0,
            },
        },
        logo: {
            padding: theme.spacing(3),
            maxWidth: drawerWidth
        },
        drawerPaper: {
            width: drawerWidth
        },
        content: {
            flexGrow: 1,
            padding: theme.spacing(3),
            width: `calc(100% - ${drawerWidth}px)`
        },
        filter: {
            flexGrow: 1,
            padding: theme.spacing(1)
        },
        tree: {
            height: 216,
            flexGrow: 1,
            maxWidth: 400
        }
    })
);


export const formStyles = makeStyles(theme => ({
    appBar: {
        position: "relative"
    },
    layout: {
        width: "auto",
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
        [theme.breakpoints.up(600 + theme.spacing(2) * 2)]: {
            width: 600,
            marginLeft: "auto",
            marginRight: "auto"
        }
    },
    paper: {
        padding: theme.spacing(1),
        [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
            padding: theme.spacing(2)
        }
    },
    dropZone: {
        "&:hover": {
            backgroundColor: "#f5f5f5"
        }
    },
    activeDrop: {
        backgroundColor: "#f5f5f5"
    },
    acceptDrop: {
        borderColor: theme.palette.success.main
    },
    rejectDrop: {
        borderColor: theme.palette.error.main
    },
    uploadItem: {
        padding: theme.spacing(1),
        minWidth: 220,
        minHeight: 220
    },
    formPaper: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        padding: theme.spacing(2),
        [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {}
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


export const collectionStyles = makeStyles((theme: Theme) =>
    createStyles({
        toolbar: {
            paddingLeft: theme.spacing(2),
            paddingRight: theme.spacing(1),
            zIndex: 100,
            position: "sticky",
            top: 64,
            [`${theme.breakpoints.up("xs")} and (orientation: landscape)`]: {
                top: 56
            },
            [theme.breakpoints.up("sm")]: {
                top: 72
            },
            backgroundColor: "white",
            borderBottom: "1px solid rgba(224, 224, 224, 1)"
        },
        table: {
            minWidth: 750
        },
        highlight:
            theme.palette.type === "light"
                ? {
                    color: theme.palette.secondary.main,
                    backgroundColor: lighten(theme.palette.secondary.light, 0.85)
                }
                : {
                    color: theme.palette.text.primary,
                    backgroundColor: theme.palette.secondary.dark
                },
        title: {
            flex: "1 1 100%"
        },
        searchBar: {
            flex: "1 1 100%"
        },
        visuallyHidden: {
            border: 0,
            clip: "rect(0 0 0 0)",
            height: 1,
            margin: -1,
            overflow: "hidden",
            padding: 0,
            position: "absolute",
            top: 20,
            width: 1
        }
    })
);
