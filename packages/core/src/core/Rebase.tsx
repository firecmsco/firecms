import type { RebaseProps } from "./RebaseProps";
import type { CustomizationController, RebasePlugin, SlotContribution } from "@rebasepro/types";
"use client";

import React, { useMemo } from "react";
import { CenteredView, Typography } from "@rebasepro/ui";
import { RebaseContext, User, UserManagementDelegate, CollectionRegistryController } from "@rebasepro/types";
import { PluginProviderStack } from "./PluginProviderStack";
import { PluginLifecycleManager } from "./PluginLifecycleManager";
import { AuthControllerContext } from "../contexts";
import { useCustomizationController, useRebaseContext, useAuthSubscription } from "../hooks";
import { ApiConfigProvider, useApiConfig } from "../hooks/ApiConfigContext";
import { ErrorView } from "../components";
import { StorageSourceContext } from "../contexts/StorageSourceContext";
import { UserConfigurationPersistenceContext } from "../contexts/UserConfigurationPersistenceContext";
import { RebaseDataContext } from "../contexts/RebaseDataContext";
import { DatabaseAdminContext } from "../contexts/DatabaseAdminContext";
import { ModeControllerProvider, AdminModeControllerProvider, SnackbarProvider } from "../contexts";
import { RebaseI18nProvider } from "../i18n/RebaseI18nProvider";
import { RebaseRegistryProvider } from "../hooks/useRebaseRegistry";
import { useBuildModeController } from "../hooks/useBuildModeController";
import { useBuildAdminModeController } from "../hooks/useBuildAdminModeController";
import { RebaseClientInstanceContext } from "../contexts/RebaseClientInstanceContext";
import { DialogsProvider } from "../contexts/DialogsProvider";
import { buildRebaseData, CollectionRegistry } from "@rebasepro/common";
import { CustomizationControllerContext } from "../contexts/CustomizationControllerContext";
import { AnalyticsContext } from "../contexts/AnalyticsContext";
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
        apiKey,
        userManagement: _userManagement,
        effectiveRoleController,
        apiUrl
    } = props;

    const plugins = pluginsProp;

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

    // Database admin — use explicit prop, or derive from client.ws / driver when available.
    // Prefers the new `driver.admin` capability object, falls back to legacy per-method derivation.
    const resolvedDatabaseAdmin = useMemo(() => {
        if (databaseAdmin) return databaseAdmin;

        // 1. New path: DataDriver exposes `.admin` capability object
        if (driverProp?.admin) return driverProp.admin;

        // 2. Auto-derive from the client's WebSocket connection (Rebase backend)
        const ws = (client as any)?.ws;
        if (ws && typeof ws.executeSql === "function") {
            return {
                executeSql: ws.executeSql.bind(ws),
                fetchAvailableDatabases: ws.fetchAvailableDatabases?.bind(ws),
                fetchAvailableRoles: ws.fetchAvailableRoles?.bind(ws),
                fetchCurrentDatabase: ws.fetchCurrentDatabase?.bind(ws),
                fetchUnmappedTables: ws.fetchUnmappedTables?.bind(ws),
                fetchTableMetadata: ws.fetchTableMetadata?.bind(ws),
            };
        }

        // 3. Legacy: derive from deprecated per-method properties on DataDriver
        if (driverProp && typeof driverProp.executeSql === "function") {
            return {
                executeSql: driverProp.executeSql.bind(driverProp),
                fetchAvailableDatabases: driverProp.fetchAvailableDatabases?.bind(driverProp),
                fetchAvailableRoles: driverProp.fetchAvailableRoles?.bind(driverProp),
                fetchCurrentDatabase: driverProp.fetchCurrentDatabase?.bind(driverProp),
                fetchUnmappedTables: driverProp.fetchUnmappedTables?.bind(driverProp),
                fetchTableMetadata: driverProp.fetchTableMetadata?.bind(driverProp),
            };
        }
        return undefined;
    }, [databaseAdmin, client, driverProp]);

    if (!resolvedStorage && typeof console !== "undefined") {
        console.warn(
            "[Rebase] No storageSource provided. File upload features will not work. " +
            "Provide storageSource via props or through a RebaseClient."
        );
    }

    const pluginsLoading = plugins?.some((p) => p.loading) ?? false;

    const loading = authController.initialLoading || pluginsLoading;

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

    const modeController = useBuildModeController();
    const adminModeController = useBuildAdminModeController();

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
        <RebaseI18nProvider locale={locale}>
        <SnackbarProvider>
        <ModeControllerProvider value={modeController}>
        <AdminModeControllerProvider value={adminModeController}>
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
                                    <InternalUserManagementContext.Provider value={userManagement}>
                                        <EffectiveRoleControllerContext.Provider value={activeEffectiveRoleController}>
                                            <DialogsProvider>
                                                <RebaseRegistryProvider>
                                                    <RebaseInternal
                                                        loading={loading}>
                                                        {children}
                                                    </RebaseInternal>
                                                </RebaseRegistryProvider>
                                            </DialogsProvider>
                                        </EffectiveRoleControllerContext.Provider>
                                    </InternalUserManagementContext.Provider>
                                </AuthControllerContext.Provider>
                            </DatabaseAdminContext.Provider>
                        </RebaseDataContext.Provider>
                    </StorageSourceContext.Provider>
                </UserConfigurationPersistenceContext.Provider>
            </CustomizationControllerContext.Provider>
        </AnalyticsContext.Provider>
        </RebaseClientInstanceContext.Provider>
        </AdminModeControllerProvider>
        </ModeControllerProvider>
        </SnackbarProvider>
        </RebaseI18nProvider>
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
    children: React.ReactNode | ((props: { context: RebaseContext; loading: boolean; }) => React.ReactNode);
}) {

    const context = useRebaseContext();
    const customizationController = useCustomizationController();

    const childrenResult = typeof children === "function" ? children({
        context,
        loading
    }) : children;

    const plugins = customizationController.plugins;
    if (!loading && plugins && plugins.length > 0) {
        return (
            <PluginProviderStack
                plugins={plugins}
                scope="root"
                scopeProps={{ context }}>
                <PluginLifecycleManager plugins={plugins} context={context} />
                {childrenResult}
            </PluginProviderStack>
        );
    }

    return childrenResult;
}

