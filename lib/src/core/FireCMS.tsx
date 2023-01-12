import React from "react";

import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import DateFnsUtils from "@date-io/date-fns";
import * as locales from "date-fns/locale";

import {
    AuthController,
    CMSAnalyticsEvent,
    CMSView,
    CollectionOverrideHandler,
    DataSource,
    EntityCollection,
    EntityLinkBuilder,
    FieldConfig,
    FireCMSContext,
    FireCMSPlugin, FireCMSProps,
    Locale,
    StorageSource,
    User,
    UserConfigurationPersistence
} from "../types";
import { FireCMSContextProvider } from "./contexts/FireCMSContext";
import { BreadcrumbsProvider } from "./contexts/BreacrumbsContext";
import { ModeControllerContext } from "./contexts/ModeController";
import {
    useBuildSideEntityController
} from "./internal/useBuildSideEntityController";
import {
    useBuildNavigationContext
} from "./internal/useBuildNavigationContext";
import {
    useBuildSideDialogsController
} from "./internal/useBuildSideDialogsController";
import { useModeController, useSnackbarController } from "../hooks";
import { CenteredView, ErrorView } from "./components";

const DEFAULT_COLLECTION_PATH = "/c";

/**
 * If you are using independent components of the CMS
 * you need to wrap them with this main component, so the internal hooks work.
 *
 * @constructor
 * @category Core
 */

export function FireCMS<UserType extends User>(props: FireCMSProps<UserType>) {

    const modeController = useModeController();
    const {
        children,
        collections,
        views,
        entityLinkBuilder,
        userConfigPersistence,
        dateTimeFormat,
        locale,
        authController,
        collectionOverrideHandler,
        storageSource,
        dataSource,
        basePath,
        baseCollectionPath,
        plugins,
        onAnalyticsEvent,
        fields
    } = props;

    const usedBasePath = basePath ?? "/";
    const usedBasedCollectionPath = baseCollectionPath ?? DEFAULT_COLLECTION_PATH;

    const dateUtilsLocale = locale ? locales[locale] : undefined;

    const navigation = useBuildNavigationContext({
        basePath: usedBasePath,
        baseCollectionPath: usedBasedCollectionPath,
        authController,
        collections,
        views,
        collectionOverrideHandler,
        userConfigPersistence,
        dataSource,
        plugins
    });

    const sideDialogsController = useBuildSideDialogsController();
    const sideEntityController = useBuildSideEntityController(navigation, sideDialogsController);

    const snackbarController = useSnackbarController();

    const loading = authController.initialLoading || navigation.loading || (plugins?.some(p => p.loading) ?? false);

    if (navigation.navigationLoadingError) {
        return (
            <CenteredView maxWidth={300} fullScreen={true}>
                <ErrorView
                    title={"Error loading navigation"}
                    error={navigation.navigationLoadingError}/>
            </CenteredView>
        );
    }

    if (authController.authError) {
        return (
            <CenteredView maxWidth={300} fullScreen={true}>
                <ErrorView
                    title={"Error loading auth"}
                    error={authController.authError}/>
            </CenteredView>
        );
    }

    const context: FireCMSContext = {
        authController,
        sideDialogsController,
        sideEntityController,
        entityLinkBuilder,
        dateTimeFormat,
        locale,
        navigation,
        dataSource,
        storageSource,
        snackbarController,
        userConfigPersistence,
        plugins,
        onAnalyticsEvent,
        fields
    };

    return (
        <ModeControllerContext.Provider value={modeController}>
            <FireCMSContextProvider {...context} >
                <BreadcrumbsProvider>
                    <LocalizationProvider
                        dateAdapter={AdapterDateFns}
                        utils={DateFnsUtils}
                        locale={dateUtilsLocale}>
                        <FireCMSInternal context={context} loading={loading}>
                            {children}
                        </FireCMSInternal>
                    </LocalizationProvider>
                </BreadcrumbsProvider>
            </FireCMSContextProvider>
        </ModeControllerContext.Provider>
    );
}

function FireCMSInternal({
                             context,
                             loading,
                             children
                         }: {
    context: FireCMSContext;
    loading: boolean;
    children: (props: {
        context: FireCMSContext;
        loading: boolean;
    }) => React.ReactNode;
}) {

    let childrenResult = children({
        context,
        loading
    })

    const plugins = context.plugins;
    if (!loading && plugins) {
        plugins.forEach((plugin: FireCMSPlugin) => {
            if (plugin.wrapperComponent) {
                childrenResult = (
                    <plugin.wrapperComponent.Component {...plugin.wrapperComponent.props}
                                                       context={context}>
                        {childrenResult}
                    </plugin.wrapperComponent.Component>
                );
            }
        });
    }

    return <>{childrenResult}</>;
}
