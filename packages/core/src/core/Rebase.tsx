"use client";

import React, { useMemo } from "react";
import { CenteredView, Typography } from "@rebasepro/ui";
import {
    CustomizationController,
    RebaseContext,
    RebasePlugin,
    RebaseProps,
    User,
    UserManagementDelegate
} from "@rebasepro/types";
import { AuthControllerContext } from "../contexts";
import { useBuildSideEntityController } from "../internal/useBuildSideEntityController";
import { useCustomizationController, useRebaseContext, useAuthSubscription } from "../hooks";
import { ApiConfigProvider } from "../hooks/ApiConfigContext";
import { useBuildSideDialogsController } from "../internal/useBuildSideDialogsController";
import { ErrorView } from "../components";
import { StorageSourceContext } from "../contexts/StorageSourceContext";
import { UserConfigurationPersistenceContext } from "../contexts/UserConfigurationPersistenceContext";
import { RebaseDataContext } from "../contexts/RebaseDataContext";
import { DatabaseAdminContext } from "../contexts/DatabaseAdminContext";
import { RebaseClientInstanceContext } from "../contexts/RebaseClientInstanceContext";
import { SideEntityControllerContext } from "../contexts/SideEntityControllerContext";
import { SideDialogsControllerContext } from "../contexts/SideDialogsControllerContext";
import { CollectionRegistryContext, NavigationStateContext, CMSUrlContext } from "../hooks/navigation/contexts";
import { DialogsProvider } from "../contexts/DialogsProvider";
import { buildRebaseData } from "@rebasepro/common";
import { CustomizationControllerContext } from "../contexts/CustomizationControllerContext";
import { AnalyticsContext } from "../contexts/AnalyticsContext";
import { BreadcrumbsProvider } from "../contexts/BreacrumbsContext";
import { InternalUserManagementContext } from "../contexts/InternalUserManagementContext";
import { EffectiveRoleControllerContext } from "../contexts/EffectiveRoleController";
import { useBuildEffectiveRoleController } from "../hooks/useBuildEffectiveRoleController";

/**
 * If you are using independent components of the CMS
 * you need to wrap them with this main component, so the internal hooks work.
 *
 * This is the main component of Rebase. It acts as the provider of all the
 * internal contexts and hooks.
 *
 * You only need to use this component if you are building a custom app.
 *
 * @group Core
 */
export function Rebase<USER extends User>(props: RebaseProps<USER>) {

    const {
        children,
        entityLinkBuilder,
        userConfigPersistence,
        dateTimeFormat,
        locale,
        client,
        authController: authControllerProp,
        storageSource: storageSourceProp,
        driver: driverProp,
        data: dataProp,
        databaseAdmin,
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
        userManagement: _userManagement,
        effectiveRoleController,
        apiUrl
    } = props;

    if (_pluginsProp) {
        console.warn("The `plugins` prop is deprecated in the Rebase component. You should pass your plugins to `useBuildNavigationStateController` instead.");
    }

    const plugins = navigationStateController.plugins ?? _pluginsProp;
    const userManagement = plugins?.find((p: RebasePlugin) => p.userManagement)?.userManagement
        ?? _userManagement
        ?? {
            loading: false,
            users: [],
            getUser: (uid: string) => null
        } as unknown as UserManagementDelegate<USER>;

    const sideDialogsController = useBuildSideDialogsController();
    
    // Auth fallback logic
    const clientAuthController = useAuthSubscription(client?.auth);
    const authController = authControllerProp ?? clientAuthController;
    
    // Data fallback logic
    const resolvedData = useMemo(() => {
        if (dataProp) return dataProp;
        if (driverProp) return buildRebaseData(driverProp);
        if (client?.data) return client.data;
        throw new Error("Rebase requires either `client`, `data`, or `driver` to be provided");
    }, [dataProp, driverProp, client]);

    // Storage fallback logic
    const resolvedStorage = storageSourceProp ?? client?.storage;

    // Database fallback logic
    const resolvedDatabaseAdmin = databaseAdmin ?? (client?.ws as unknown as typeof databaseAdmin);

    const sideEntityController = useBuildSideEntityController(collectionRegistryController, cmsUrlController, navigationStateController, sideDialogsController, authController);

    const pluginsLoading = plugins?.some((p: RebasePlugin) => p.loading) ?? false;

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

    const fallbackEffectiveRoleController = useBuildEffectiveRoleController();
    const activeEffectiveRoleController = effectiveRoleController ?? fallbackEffectiveRoleController;

    if (navigationStateController.navigationLoadingError) {
        return (
            <CenteredView maxWidth={"md"}>
                <ErrorView
                    title={"Error loading navigation"}
                    error={navigationStateController.navigationLoadingError as Error | string} />
            </CenteredView>
        );
    }

    if (authController.authError) {
        return (
            <CenteredView maxWidth={"md"}>
                <ErrorView
                    title={"Error loading auth"}
                    error={authController.authError as Error | string} />
            </CenteredView>
        );
    }

    const content = (
        <RebaseClientInstanceContext.Provider value={client}>
        <AnalyticsContext.Provider value={analyticsController}>
            <CustomizationControllerContext.Provider value={customizationController}>
                <UserConfigurationPersistenceContext.Provider
                    value={userConfigPersistence}>
                    <StorageSourceContext.Provider
                        value={resolvedStorage!}>
                        <RebaseDataContext.Provider
                            value={resolvedData}>
                            <DatabaseAdminContext.Provider
                                value={resolvedDatabaseAdmin}>
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
                                                                <EffectiveRoleControllerContext.Provider value={activeEffectiveRoleController}>
                                                                    <DialogsProvider>
                                                                        <BreadcrumbsProvider>
                                                                            <RebaseInternal
                                                                                loading={loading}>
                                                                                {children}
                                                                            </RebaseInternal>
                                                                        </BreadcrumbsProvider>
                                                                    </DialogsProvider>
                                                                </EffectiveRoleControllerContext.Provider>
                                                            </InternalUserManagementContext.Provider>
                                                        </CMSUrlContext.Provider>
                                                    </NavigationStateContext.Provider>
                                                </CollectionRegistryContext.Provider>
                                            </SideEntityControllerContext.Provider>
                                        </SideDialogsControllerContext.Provider>
                                </AuthControllerContext.Provider>
                            </DatabaseAdminContext.Provider>
                        </RebaseDataContext.Provider>
                    </StorageSourceContext.Provider>
                </UserConfigurationPersistenceContext.Provider>
            </CustomizationControllerContext.Provider>
        </AnalyticsContext.Provider>
        </RebaseClientInstanceContext.Provider>
    );

    if (apiUrl) {
        return (
            <ApiConfigProvider apiUrl={apiUrl} getAuthToken={authController.getAuthToken}>
                {content}
            </ApiConfigProvider>
        );
    }

    return content;

}

function RebaseInternal({
    loading,
    children
}: {
    loading: boolean;
    children: (props: {
        context: RebaseContext;
        loading: boolean;
    }) => React.ReactNode;
}) {

    const context = useRebaseContext();
    const customizationController = useCustomizationController();

    let childrenResult = children({
        context,
        loading
    });

    const plugins = customizationController.plugins;
    if (!loading && plugins) {
        plugins.forEach((plugin: RebasePlugin) => {
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
