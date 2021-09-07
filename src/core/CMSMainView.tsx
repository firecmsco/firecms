import React, { PropsWithChildren } from "react";

import { Theme } from "@mui/material";
import { createStyles, makeStyles } from "@mui/styles";


import CircularProgressCenter from "./components/CircularProgressCenter";
import { CMSDrawer } from "./CMSDrawer";
import { CMSAppBar } from "./internal/CMSAppBar";
import { useCMSAppContext } from "../contexts";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";

import DateFnsUtils from "@date-io/date-fns";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import * as locales from "date-fns/locale";


/**
 * @category Core
 */
export interface CMSMainViewProps {

    /**
     * Name of the app, displayed as the main title and in the tab title
     */
    name: string;

    /**
     * Logo to be displayed in the drawer of the CMS
     */
    logo?: string;

    /**
     * If authentication is enabled, allow the user to access the content
     * without login.
     */
    allowSkipLogin?: boolean;

    /**
     * A component that gets rendered on the upper side of the main toolbar
     */
    toolbarExtraWidget?: React.ReactNode;

}


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        logo: {
            padding: theme.spacing(3),
            maxWidth: 240
        },
        main: {
            display: "flex",
            flexDirection: "column",
            width: "100vw",
            height: "100vh"
        },
        content: {
            flexGrow: 1,
            width: "100%",
            height: "100%",
            overflow: "auto"
        },
        tableNoBottomBorder: {
            "&:last-child th, &:last-child td": {
                borderBottom: 0
            }
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

/**
 * This is the main view of the CMS, it will display the login screen
 * if the user is not authenticated or the main app otherwise.
 *
 * It is in charge of displaying the navigation drawer, top bar and main
 * collection views.
 *
 * @param props
 * @constructor
 * @category Core
 */
export function CMSMainView(props: PropsWithChildren<CMSMainViewProps>) {

    const {
        children,
        name,
        logo,
        toolbarExtraWidget
    } = props;

    const context = useCMSAppContext();
    const locale = context.locale;

    const dateUtilsLocale = locale ? locales[locale] : undefined;

    const classes = useStyles();

    const [drawerOpen, setDrawerOpen] = React.useState(false);

    const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
    const closeDrawer = () => setDrawerOpen(false);

    if (!context.navigation) {
        return <CircularProgressCenter/>;
    }

    return (
        <LocalizationProvider
            dateAdapter={AdapterDateFns}
            utils={DateFnsUtils}
            locale={dateUtilsLocale}>
            <DndProvider backend={HTML5Backend}>
                <nav>
                    <CMSDrawer logo={logo}
                               drawerOpen={drawerOpen}
                               navigation={context.navigation}
                               closeDrawer={closeDrawer}/>
                </nav>

                <div className={classes.main}>

                    <CMSAppBar title={name}
                               handleDrawerToggle={handleDrawerToggle}
                               toolbarExtraWidget={toolbarExtraWidget}/>
                    <main
                        className={classes.content}>
                        {children}
                    </main>
                </div>

            </DndProvider>
        </LocalizationProvider>
    );


}

