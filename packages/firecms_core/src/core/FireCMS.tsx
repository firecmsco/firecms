import React, { useMemo } from "react";

import { EntityCollection, FireCMSContext, FireCMSPlugin, FireCMSProps, User } from "../types";
import { AuthControllerContext, ModeControllerContext } from "../contexts";
import { useBuildSideEntityController } from "../internal/useBuildSideEntityController";
import { useCustomizationController, useFireCMSContext, useModeController } from "../hooks";
import { useBuildSideDialogsController } from "../internal/useBuildSideDialogsController";
import { ErrorView } from "../components";
import { StorageSourceContext } from "../contexts/StorageSourceContext";
import { UserConfigurationPersistenceContext } from "../contexts/UserConfigurationPersistenceContext";
import { DataSourceContext } from "../contexts/DataSourceContext";
import { SideEntityControllerContext } from "../contexts/SideEntityControllerContext";
import { NavigationContext } from "../contexts/NavigationContext";
import { SideDialogsControllerContext } from "../contexts/SideDialogsControllerContext";
import { useLocaleConfig } from "../internal/useLocaleConfig";
import { CenteredView } from "@firecms/ui";
import { DialogsProvider } from "../contexts/DialogsProvider";
import { useBuildNavigationController } from "../internal/useBuildNavigationController";
import { useBuildDataSource } from "../internal/useBuildDataSource";
import { useBuildCustomizationController } from "../internal/useBuildCustomizationController";
import { CustomizationControllerContext } from "../contexts/CustomizationControllerContext";
import { AnalyticsContext } from "../contexts/AnalyticsContext";

/**
 * If you are using independent components of the CMS
 * you need to wrap them with this main component, so the internal hooks work.
 *
 * This is the main component of FireCMS. It acts as the provider of all the
 * internal contexts and hooks.
 *
 * You only need to use this component if you are building a custom app.
 *
 * @constructor
 * @group Core
 */
export function FireCMS<UserType extends User, EC extends EntityCollection>(props: FireCMSProps<UserType, EC>) {

    const modeController = useModeController();
    const {
        children,
        entityLinkBuilder,
        userConfigPersistence,
        dateTimeFormat,
        locale,
        authController,
        storageSource,
        dataSourceDelegate,
        plugins,
        onAnalyticsEvent,
        propertyConfigs,
        entityViews,
        components,
        baseCollectionPath,
        basePath,
        collections,
        views
    } = props;

    useLocaleConfig(locale);

    const navigationController = useBuildNavigationController({
        basePath,
        baseCollectionPath,
        authController,
        collections,
        views,
        userConfigPersistence,
        dataSource: dataSourceDelegate,
        plugins
    });

    /**
     * Controller in charge of fetching and persisting data
     */
    const dataSource = useBuildDataSource({
        delegate: dataSourceDelegate,
        propertyConfigs,
        navigationController
    });

    const sideDialogsController = useBuildSideDialogsController();
    const sideEntityController = useBuildSideEntityController(navigationController, sideDialogsController);

    const pluginsLoading = plugins?.some(p => p.loading) ?? false;

    const loading = authController.initialLoading || navigationController.loading || pluginsLoading;

    const customizationController = useBuildCustomizationController({
        dateTimeFormat,
        locale,
        entityLinkBuilder,
        plugins,
        entityViews: entityViews ?? [],
        propertyConfigs: propertyConfigs ?? {},
        components
    })

    const analyticsController = useMemo(() => ({
        onAnalyticsEvent
    }), []);

    if (navigationController.navigationLoadingError) {
        return (
            <CenteredView maxWidth={"md"}>
                <ErrorView
                    title={"Error loading navigation"}
                    error={navigationController.navigationLoadingError}/>
            </CenteredView>
        );
    }

    if (authController.authError) {
        return (
            <CenteredView maxWidth={"md"}>
                <ErrorView
                    title={"Error loading auth"}
                    error={authController.authError}/>
            </CenteredView>
        );
    }

    return (
        <ModeControllerContext.Provider value={modeController}>
            <AnalyticsContext.Provider value={analyticsController}>
                <CustomizationControllerContext.Provider value={customizationController}>
                    <UserConfigurationPersistenceContext.Provider
                        value={userConfigPersistence}>
                        <StorageSourceContext.Provider
                            value={storageSource}>
                            <DataSourceContext.Provider
                                value={dataSource}>
                                <AuthControllerContext.Provider
                                    value={authController}>
                                    <SideDialogsControllerContext.Provider
                                        value={sideDialogsController}>
                                        <SideEntityControllerContext.Provider
                                            value={sideEntityController}>
                                            <NavigationContext.Provider
                                                value={navigationController}>
                                                <DialogsProvider>
                                                    <FireCMSInternal
                                                        loading={loading}>
                                                        {children}
                                                    </FireCMSInternal>
                                                </DialogsProvider>
                                            </NavigationContext.Provider>
                                        </SideEntityControllerContext.Provider>
                                    </SideDialogsControllerContext.Provider>
                                </AuthControllerContext.Provider>
                            </DataSourceContext.Provider>
                        </StorageSourceContext.Provider>
                    </UserConfigurationPersistenceContext.Provider>
                </CustomizationControllerContext.Provider>
            </AnalyticsContext.Provider>
        </ModeControllerContext.Provider>
    );

}

function FireCMSInternal({
                             loading,
                             children
                         }: {
    loading: boolean;
    children: (props: {
        context: FireCMSContext;
        loading: boolean;
    }) => React.ReactNode;
}) {

    const context = useFireCMSContext();
    const customizationController = useCustomizationController();

    let childrenResult = children({
        context,
        loading
    });

    const plugins = customizationController.plugins;
    if (!loading && plugins) {
        plugins.forEach((plugin: FireCMSPlugin) => {
            if (plugin.provider) {
                childrenResult = (
                    <plugin.provider.Component {...plugin.provider.props}
                                               context={context}>
                        {childrenResult}
                    </plugin.provider.Component>
                );
            }
        });
    }

    return <>{childrenResult}</>;
}
