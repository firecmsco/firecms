import React from "react";
import { HTML5Backend } from "react-dnd-html5-backend";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";

import DateFnsUtils from "@date-io/date-fns";
import * as locales from "date-fns/locale";

import { BrowserRouter as Router } from "react-router-dom";

import CircularProgressCenter from "./components/CircularProgressCenter";
import { BreadcrumbsProvider } from "./contexts/BreacrumbsContext";

import { DndProvider } from "react-dnd";
import { CMSAppProps } from "./CMSAppProps";
import { CMSDrawer } from "./CMSDrawer";
import { CMSRouterSwitch } from "./CMSRouterSwitch";
import { CMSAppBar } from "./components/CMSAppBar";
import { EntitySideDialogs } from "./side_dialog/EntitySideDialogs";
import { SideEntityProvider } from "./contexts/SideEntityController";
import { SchemaRegistryProvider } from "./contexts/SchemaRegistry";
import {
    NavigationContext,
    useNavigation
} from "./contexts/NavigationProvider";
import { CMSAppContextProvider } from "./contexts/CMSAppContext";

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


export function CMSMainView(props: CMSAppProps & {usedFirebaseConfig:Object}) {

    const {
        name,
        logo,
        toolbarExtraWidget,
        schemaResolver,
        usedFirebaseConfig,
        locale
    } = props;

    const classes = useStyles();
    const dateUtilsLocale = locale ? locales[locale] : undefined;

    const [drawerOpen, setDrawerOpen] = React.useState(false);

    const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
    const closeDrawer = () => setDrawerOpen(false);

    const navigationContext = useNavigation();

    if (!navigationContext.navigation) {
        return <CircularProgressCenter/>;
    }


    if (navigationContext.navigationLoadingError) {
        return (
            <div>
                <p>There was an error while loading
                    your navigation config</p>
                <p>{navigationContext.navigationLoadingError}</p>
            </div>
        );
    }

    const collections = navigationContext.navigation.collections;
    const additionalViews = navigationContext.navigation.views;

    return (
        <Router>
            <SchemaRegistryProvider collections={collections}
                                    schemaResolver={schemaResolver}>

                <CMSAppContextProvider cmsAppConfig={props} firebaseConfig={usedFirebaseConfig}>

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
                </CMSAppContextProvider>
            </SchemaRegistryProvider>
        </Router>
    );


}
