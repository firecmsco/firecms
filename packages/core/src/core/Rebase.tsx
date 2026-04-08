import type { RebaseProps } from "./RebaseProps";
import type { CustomizationController, RebasePlugin, SlotContribution } from "@rebasepro/types";
"use client";

import React, { useMemo } from "react";
import { CenteredView, Typography } from "@rebasepro/ui";
import { RebaseContext, User, UserManagementDelegate, CollectionRegistryController } from "@rebasepro/types";
import { PluginProviderStack } from "./PluginProviderStack";
import { AuthControllerContext } from "../contexts";
import { useCustomizationController, useRebaseContext, useAuthSubscription } from "../hooks";
import { ApiConfigProvider, useApiConfig } from "../hooks/ApiConfigContext";
import { useBuildSideDialogsController } from "../internal/useBuildSideDialogsController";
import { ErrorView } from "../components";
import { StorageSourceContext } from "../contexts/StorageSourceContext";
import { UserConfigurationPersistenceContext } from "../contexts/UserConfigurationPersistenceContext";
import { RebaseDataContext } from "../contexts/RebaseDataContext";
import { DatabaseAdminContext } from "../contexts/DatabaseAdminContext";
import { RebaseClientInstanceContext } from "../contexts/RebaseClientInstanceContext";
import { SideDialogsControllerContext } from "../contexts/SideDialogsControllerContext";
import { CollectionRegistryContext, NavigationStateContext, CMSUrlContext } from "../hooks/navigation/contexts";
import { DialogsProvider } from "../contexts/DialogsProvider";
import { buildRebaseData, CollectionRegistry } from "@rebasepro/common";
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
        plugins: pluginsProp,
        slots: directSlots = [],
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

    const plugins = navigationStateController.plugins ?? pluginsProp;

    // Validate plugin key uniqueness
    if (plugins) {
        const keys = plugins.map((p) => p.key);
        if (new Set(keys).size !== keys.length) {
            console.error("Duplicate plugin keys detected:", keys.filter((k, i) => keys.indexOf(k) !== i));
        }
    }

    // Merge direct slots with plugin slots
    const resolvedSlots: SlotContribution[] = useMemo(() => [
        ...directSlots,
        ...((plugins ?? []).flatMap((p) => p.slots ?? [])),
    ], [directSlots, plugins]);

    const userManagement = plugins?.find((p) => p.userManagement)?.userManagement
        ?? _userManagement
        ?? {
            loading: false,
            users: [],
            getUser: (uid: string) => null
        } as unknown as UserManagementDelegate<USER>;

    const sideDialogsController = useBuildSideDialogsController();
    
    // Auth fallback logic
    const clientAuthController = useAuthSubscription(authControllerProp ? undefined : client?.auth);
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

    const pluginsLoading = plugins?.some((p) => p.loading) ?? false;

    const loading = authController.initialLoading || navigationStateController.loading || pluginsLoading;

    const customizationController: CustomizationController = {
        dateTimeFormat,
        locale,
        entityLinkBuilder,
        plugins,
        resolvedSlots,
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

    const childrenResult = children({
        context,
        loading
    });

    const plugins = customizationController.plugins;
    if (!loading && plugins && plugins.length > 0) {
        return (
            <PluginProviderStack
                plugins={plugins}
                scope="root"
                scopeProps={{ context }}>
                {childrenResult}
            </PluginProviderStack>
        );
    }

    return (
        <>
            {childrenResult}
            <CollectionsMetadataSyncer />
        </>
    );
}

function CollectionsMetadataSyncer() {
    const apiConfig = useApiConfig();
    const registryController = React.useContext(CollectionRegistryContext);
    const navigationStateController = React.useContext(NavigationStateContext);

    React.useEffect(() => {
        if (!apiConfig?.apiUrl) return;

        let cancelled = false;
        const fetchMetadata = async () => {
            try {
                const token = apiConfig.getAuthToken ? await apiConfig.getAuthToken() : null;
                const headers: Record<string, string> = { "Content-Type": "application/json" };
                if (token) headers["Authorization"] = `Bearer ${token}`;

                const res = await fetch(`${apiConfig.apiUrl.replace(/\/$/, "")}/api/collections`, { headers });
                if (res.ok && !cancelled) {
                    const { data } = await res.json();
                    if (!data || !Array.isArray(data)) return;

                    let changed = false;
                    // Get raw un-normalized collections as well to update both maps if necessary
                    const registryWithRef = registryController as CollectionRegistryController & { collectionRegistryRef?: React.MutableRefObject<CollectionRegistry> };
                    const refreshCollections = registryWithRef?.collectionRegistryRef?.current?.getCollections() ?? [];
                    
                    for (const c of refreshCollections) {
                        const meta = data.find((m: { slug?: string; dbPath?: string; isTableMissing?: boolean }) => m.slug === c.slug || m.dbPath === c.dbPath);
                         if (meta && c.isTableMissing !== meta.isTableMissing) {
                             c.isTableMissing = meta.isTableMissing;
                             changed = true;
                         }
                    }

                    // Force navigation state to reload if things changed
                    if (changed && navigationStateController?.refreshNavigation) {
                        navigationStateController.refreshNavigation();
                    }
                }
            } catch (e) {
                console.debug("Could not fetch collections metadata", e);
            }
        };

        fetchMetadata();

        return () => {
            cancelled = true;
        };
    }, [apiConfig?.apiUrl, apiConfig?.getAuthToken, registryController, navigationStateController]);

    return null;
}
