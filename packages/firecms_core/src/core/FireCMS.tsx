"use client";

import React, { useMemo } from "react";
import { CenteredView, Typography } from "@firecms/ui";
import {
    CustomizationController,
    FireCMSContext,
    FireCMSPlugin,
    FireCMSProps,
    User
} from "@firecms/types";
import { AuthControllerContext } from "../contexts";
import { useBuildSideEntityController } from "../internal/useBuildSideEntityController";
import { useCustomizationController, useFireCMSContext } from "../hooks";
import { useBuildSideDialogsController } from "../internal/useBuildSideDialogsController";
import { ErrorView } from "../components";
import { StorageSourceContext } from "../contexts/StorageSourceContext";
import { UserConfigurationPersistenceContext } from "../contexts/UserConfigurationPersistenceContext";
import { DataSourceContext } from "../contexts/DataSourceContext";
import { SideEntityControllerContext } from "../contexts/SideEntityControllerContext";
import { SideDialogsControllerContext } from "../contexts/SideDialogsControllerContext";
import { CollectionRegistryContext, NavigationStateContext, CMSUrlContext } from "../hooks/navigation/contexts";
import { DialogsProvider } from "../contexts/DialogsProvider";
import { useBuildDataSource } from "../internal/useBuildDataSource";
import { CustomizationControllerContext } from "../contexts/CustomizationControllerContext";
import { AnalyticsContext } from "../contexts/AnalyticsContext";
import { useProjectLog } from "../hooks/useProjectLog";
import { BreadcrumbsProvider } from "../contexts/BreacrumbsContext";
import { InternalUserManagementContext } from "../contexts/InternalUserManagementContext";

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
export function FireCMS<USER extends User>(props: FireCMSProps<USER>) {

    const {
        children,
        entityLinkBuilder,
        userConfigPersistence,
        dateTimeFormat,
        locale,
        authController,
        storageSource,
        dataSourceDelegate,
        plugins: _pluginsProp,
        onAnalyticsEvent,
        propertyConfigs,
        entityViews,
        entityActions,
        components,
        collectionRegistryController,
        cmsUrlController,
        navigationStateController,
        apiKey,
        userManagement: _userManagement
    } = props;

    if (_pluginsProp) {
        console.warn("The `plugins` prop is deprecated in the FireCMS component. You should pass your plugins to `useBuildNavigationStateController` instead.");
    }

    const plugins = navigationStateController.plugins ?? _pluginsProp;
    const userManagement = plugins?.find((p: FireCMSPlugin) => p.userManagement)?.userManagement
        ?? _userManagement
        ?? {
        users: [],
        getUser: (uid: string) => null
    };

    const sideDialogsController = useBuildSideDialogsController();
    const sideEntityController = useBuildSideEntityController(collectionRegistryController, cmsUrlController, navigationStateController, sideDialogsController, authController);

    const pluginsLoading = plugins?.some((p: FireCMSPlugin) => p.loading) ?? false;

    const loading = authController.initialLoading || navigationStateController.loading || pluginsLoading;

    const customizationController: CustomizationController = {
        dateTimeFormat,
        locale,
        entityLinkBuilder,
        plugins,
        entityViews: entityViews ?? [],
        entityActions: entityActions ?? [],
        propertyConfigs: propertyConfigs ?? {},
        components
    };

    const analyticsController = useMemo(() => ({
        onAnalyticsEvent
    }), []);

    const accessResponse = useProjectLog({
        apiKey,
        authController,
        dataSourceDelegate,
        plugins
    });

    /**
     * Controller in charge of fetching and persisting data
     */
    const dataSource = useBuildDataSource({
        delegate: dataSourceDelegate,
        propertyConfigs,
        // Used by DataSource internally for type resolution, pass the registry
        collectionRegistryController,
        authController
    });

    if (accessResponse?.message) {
        console.warn(accessResponse.message);
    }

    if (navigationStateController.navigationLoadingError) {
        return (
            <CenteredView maxWidth={"md"}>
                <ErrorView
                    title={"Error loading navigation"}
                    error={navigationStateController.navigationLoadingError} />
            </CenteredView>
        );
    }

    if (authController.authError) {
        return (
            <CenteredView maxWidth={"md"}>
                <ErrorView
                    title={"Error loading auth"}
                    error={authController.authError} />
            </CenteredView>
        );
    }

    if (accessResponse?.blocked) {
        return (
            <CenteredView maxWidth={"md"} fullScreen={true} className={"flex flex-col gap-2"}>
                <Typography variant={"h4"} gutterBottom>
                    License needed
                </Typography>
                <Typography>
                    You need a valid license to use FireCMS PRO. Please reach out at <a
                        href={"mailto:hello@firecms.co"}>hello@firecms.co</a> for more information.
                </Typography>
                {accessResponse?.message &&
                    <Typography>{accessResponse?.message}</Typography>}
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
                                        <CollectionRegistryContext.Provider value={collectionRegistryController}>
                                            <NavigationStateContext.Provider value={navigationStateController}>
                                                <CMSUrlContext.Provider value={cmsUrlController}>
                                                    <InternalUserManagementContext.Provider value={userManagement}>
                                                        <DialogsProvider>
                                                            <BreadcrumbsProvider>
                                                                <FireCMSInternal
                                                                    loading={loading}>
                                                                    {children}
                                                                </FireCMSInternal>
                                                            </BreadcrumbsProvider>
                                                        </DialogsProvider>
                                                    </InternalUserManagementContext.Provider>
                                                </CMSUrlContext.Provider>
                                            </NavigationStateContext.Provider>
                                        </CollectionRegistryContext.Provider>
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
