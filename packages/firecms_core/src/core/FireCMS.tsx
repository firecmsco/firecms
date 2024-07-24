import React, { useMemo } from "react";

import { CustomizationController, EntityCollection, FireCMSContext, FireCMSPlugin, FireCMSProps, User } from "../types";
import { AuthControllerContext } from "../contexts";
import { useBuildSideEntityController } from "../internal/useBuildSideEntityController";
import { useCustomizationController, useFireCMSContext } from "../hooks";
import { useBuildSideDialogsController } from "../internal/useBuildSideDialogsController";
import { ErrorView } from "../components";
import { StorageSourceContext } from "../contexts/StorageSourceContext";
import { UserConfigurationPersistenceContext } from "../contexts/UserConfigurationPersistenceContext";
import { DataSourceContext } from "../contexts/DataSourceContext";
import { SideEntityControllerContext } from "../contexts/SideEntityControllerContext";
import { NavigationContext } from "../contexts/NavigationContext";
import { SideDialogsControllerContext } from "../contexts/SideDialogsControllerContext";
import { CenteredView, Typography, useLocaleConfig } from "@firecms/ui";
import { DialogsProvider } from "../contexts/DialogsProvider";
import { useBuildDataSource } from "../internal/useBuildDataSource";
import { CustomizationControllerContext } from "../contexts/CustomizationControllerContext";
import { AnalyticsContext } from "../contexts/AnalyticsContext";
import { useProjectLog } from "../hooks/useProjectLog";

/**
 * If you are using independent components of the CMS
 * you need to wrap them with this main component, so the internal hooks work.
 *
 * This is the main component of FireCMS. It acts as the provider of all the
 * internal contexts and hooks.
 *
 * You only need to use this component if you are building a custom app.
 *

 * @group Core
 */
export function FireCMS<UserType extends User, EC extends EntityCollection>(props: FireCMSProps<UserType, EC>) {

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
        navigationController,
    } = props;

    useLocaleConfig(locale);

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

    const customizationController: CustomizationController = {
        dateTimeFormat,
        locale,
        entityLinkBuilder,
        plugins,
        entityViews: entityViews ?? [],
        propertyConfigs: propertyConfigs ?? {},
        components
    };

    const analyticsController = useMemo(() => ({
        onAnalyticsEvent
    }), []);

    const accessResponse = useProjectLog(authController, dataSourceDelegate, plugins);

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

    if (accessResponse?.blocked) {
        return (
            <CenteredView maxWidth={"md"} fullScreen={true}>
                <Typography variant={"h4"}>
                    Access blocked
                </Typography>
                <Typography>
                    This app has been blocked. Please reach out at <a
                    href={"mailto:hello@firecms.co"}>hello@firecms.co</a> for more information.
                </Typography>
                {accessResponse?.message &&
                    <Typography>Response from the server: {accessResponse?.message}</Typography>}
            </CenteredView>
        );
    }

    return (
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
