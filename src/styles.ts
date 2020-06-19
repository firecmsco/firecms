import { createStyles, makeStyles, Theme } from "@material-ui/core";
import { createMuiTheme, lighten } from "@material-ui/core/styles";
import { red } from "@material-ui/core/colors";

const drawerWidth = 240;

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: "flex",
            width: "100%",
            marginTop: theme.spacing(3)
        },
        drawer: {
            [theme.breakpoints.up("md")]: {
                width: drawerWidth,
                flexShrink: 0
            }
        },
        appBar: {
            [theme.breakpoints.up("md")]: {
                width: `calc(100% - ${drawerWidth}px)`,
                marginLeft: drawerWidth
            }
        },
        menuButton: {
            marginRight: theme.spacing(2),
            [theme.breakpoints.up("md")]: {
                display: "none"
            }
        },
        grow: {
            flexGrow: 1
        },
        field: {
            minHeight: 56
        },
        toolbar: theme.mixins.toolbar,
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
        table: {
            minWidth: 750
        },
        tableWrapper: {
            overflow: "auto"
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


export const useToolbarStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            paddingLeft: theme.spacing(2),
            paddingRight: theme.spacing(1)
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
        }
    })
);

export const theme = createMuiTheme({
    palette: {
        background: {
            default: "#f1f1f1"
        },
        primary: {
            main: "#03238d"
        },
        secondary: {
            main: "#8AC9BD"
        },
        error: {
            main: red.A400
        }
    },
    typography: {
        h6: {
            fontSize: 16,
            fontWeight: 600
        }
    },
    shape: {
        borderRadius: 2
    }
});
