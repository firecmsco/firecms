import React, { useEffect, useState } from "react";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
    createMuiTheme,
    createStyles,
    CssBaseline,
    makeStyles,
    Theme,
    ThemeProvider
} from "@material-ui/core";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";

import DateFnsUtils from "@date-io/date-fns";
import * as locales from "date-fns/locale";

import { BrowserRouter as Router } from "react-router-dom";

import firebase from "firebase/app";
import "firebase/analytics";
import "firebase/auth";
import "firebase/storage";
import "firebase/firestore";

import "typeface-space-mono";

import CircularProgressCenter from "./components/CircularProgressCenter";
import { Authenticator, EntityCollection } from "./models";
import { blue, pink, red } from "@material-ui/core/colors";
import { BreadcrumbsProvider } from "./contexts/BreacrumbsContext";
import { AuthContext, AuthProvider } from "./contexts/AuthContext";
import { SnackbarProvider } from "./contexts/SnackbarContext";
import { AppConfigProvider } from "./contexts/AppConfigContext";

import { DndProvider } from "react-dnd";
import {
    CMSAppProps,
    Locale,
    Navigation,
    NavigationBuilder
} from "./CMSAppProps";
import { LoginView } from "./LoginView";
import { CMSDrawer } from "./CMSDrawer";
import { CMSRouterSwitch } from "./CMSRouterSwitch";
import { CMSAppBar } from "./components/CMSAppBar";
import { EntitySideDialogs } from "./side_dialog/EntitySideDialogs";
import { SideEntityProvider } from "./contexts/SideEntityController";
import { SchemaRegistryProvider } from "./side_dialog/SchemaRegistry";
import { SchemaResolver } from "./side_dialog/model";

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
     * Logged in user
     */
    user: firebase.User | null;

    /**
     * Use this prop to specify the views that will be generated in the CMS.
     * You usually will want to create a `Navigation` object that includes
     * collection views where you specify the path and the schema.
     * Additionally you can add custom views to the root navigation.
     * In you need to customize the navigation based on the logged user you
     * can use a `NavigationBuilder`
     */
    navigation: Navigation | NavigationBuilder | EntityCollection[] ;

    /**
     * A component that gets rendered on the upper side of the main toolbar
     */
    toolbarExtraWidget?: React.ReactNode;

    /**
     * Format of the dates in the CMS.
     * Defaults to 'MMMM dd, yyyy, HH:mm:ss'
     */
    dateTimeFormat?: string;

    /**
     * Locale of the CMS, currently only affecting dates
     */
    locale?: Locale;

    /**
     * Used to override schemas based on the collection path and entityId.
     * This resolver allows to override the schema for specific entities, or
     * specific collections, app wide. This overrides schemas all through the app.
     *
     * You can also override schemas in place, when using `useSideEntityController`
     */
    schemaResolver?: SchemaResolver;
}


export function CMSMainView(props: CMSMainViewProps) {

    const {
        name,
        logo,
        navigation: navigationOrCollections,
        toolbarExtraWidget,
        schemaResolver,
        locale,
        user,
    } = props;

    const classes = useStyles();
    const dateUtilsLocale = locale ? locales[locale] : undefined;


    const [drawerOpen, setDrawerOpen] = React.useState(false);

    const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
    const closeDrawer = () => setDrawerOpen(false);

    const [navigation, setNavigation] = useState<Navigation>();
    const [navigationLoading, setNavigationLoading] = useState(true);
    const [navigationLoadingError, setNavigationLoadingError] = useState();

    useEffect(() => {
        setNavigationLoading(true);
        getNavigation().then((result: Navigation) => {
            setNavigation(result);
        }).catch(setNavigationLoadingError).finally(() => setNavigationLoading(false));
    }, [user, navigationOrCollections]);

    async function getNavigation(): Promise<Navigation> {
        if (Array.isArray(navigationOrCollections)) {
            return {
                collections: navigationOrCollections
            };
        } else if (typeof navigationOrCollections === "function") {
            return navigationOrCollections({ user });
        } else {
            return navigationOrCollections;
        }
    }

    if(navigationLoadingError){
        return <div>
            <p>There was an error while loading
                your navigation config</p>
            <p>{navigationLoadingError}</p>
        </div>
    }

    if(!navigation){
        return <CircularProgressCenter/>;
    }

    const collections = navigation.collections;
    const additionalViews = navigation.views;

    return (
        <Router>
            <SchemaRegistryProvider collections={collections}
                                    schemaResolver={schemaResolver}>
                <SideEntityProvider collections={collections}>
                    <BreadcrumbsProvider>
                        <MuiPickersUtilsProvider
                            utils={DateFnsUtils}
                            locale={dateUtilsLocale}>
                            <DndProvider backend={HTML5Backend}>

                                <nav>
                                    <CMSDrawer logo={logo}
                                               drawerOpen={drawerOpen}
                                               collections={collections}
                                               closeDrawer={closeDrawer}
                                               additionalViews={additionalViews}/>
                                </nav>

                                <div className={classes.main}>
                                    <CMSAppBar title={name}
                                               handleDrawerToggle={handleDrawerToggle}
                                               toolbarExtraWidget={toolbarExtraWidget}/>

                                    <main
                                        className={classes.content}>
                                        <CMSRouterSwitch
                                            collections={collections}
                                            views={additionalViews}/>
                                    </main>
                                </div>

                                <EntitySideDialogs
                                    collections={collections}/>

                            </DndProvider>
                        </MuiPickersUtilsProvider>
                    </BreadcrumbsProvider>
                </SideEntityProvider>
            </SchemaRegistryProvider>
        </Router>
    );

}
