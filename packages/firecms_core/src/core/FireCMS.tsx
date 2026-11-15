"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { CenteredView } from "@firecms/ui";
import { AppliedBundles, applyPluginTranslations, createAppliedBundles } from "./plugin_translations.js";
import { filterPausedPlugins, isProPaused } from "./pro_plugins.js";
import { AuthController } from "../types/index.js";
import { CustomizationController, FireCMSContext, FireCMSPlugin, FireCMSProps, User } from "../types/index.js";
import { AuthControllerContext, ModeControllerProvider } from "../contexts/index.js";
import { useBuildSideEntityController } from "../internal/useBuildSideEntityController.js";
import { useCustomizationController, useFireCMSContext, useTranslation, ModeController } from "../hooks/index.js";
import { useBuildModeController } from "../hooks/useBuildModeController.js";
import { useBuildSideDialogsController } from "../internal/useBuildSideDialogsController.js";
import { ErrorView } from "../components/index.js";
import { StorageSourceContext } from "../contexts/StorageSourceContext.js";
import { UserConfigurationPersistenceContext } from "../contexts/UserConfigurationPersistenceContext.js";
import { DataSourceContext } from "../contexts/DataSourceContext.js";
import { SideEntityControllerContext } from "../contexts/SideEntityControllerContext.js";
import { NavigationContext } from "../contexts/NavigationContext.js";
import { SideDialogsControllerContext } from "../contexts/SideDialogsControllerContext.js";
import { DialogsProvider } from "../contexts/DialogsProvider.js";
import { useBuildDataSource } from "../internal/useBuildDataSource.js";
import { CustomizationControllerContext } from "../contexts/CustomizationControllerContext.js";
import { AnalyticsContext } from "../contexts/AnalyticsContext.js";
import { useProjectLog } from "../hooks/useProjectLog.js";
import { BreadcrumbsProvider } from "../contexts/BreacrumbsContext.js";
import { InternalUserManagementContext } from "../contexts/InternalUserManagementContext.js";
import { LicenseStatusContext, publishLicenseStatus } from "../contexts/LicenseStatusContext.js";

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
        navigationController,
        apiKey,
        telemetry,
        userManagement: _userManagement
    } = props;

    if (_pluginsProp) {
        console.warn("The `plugins` prop is deprecated in the FireCMS component. You should pass your plugins to `useBuildNavigationController` instead.");
    }

    const { i18n } = useTranslation();

    const modeController = useBuildModeController();

    // Every plugin the app mounts. The license check is sent all of their keys:
    // the server decides from them whether the project needs a license.
    const allPlugins = navigationController.plugins ?? _pluginsProp;

    const licenseStatus = useProjectLog({
        apiKey,
        telemetry,
        authController,
        dataSourceDelegate,
        plugins: allPlugins
    });

    // The CMS always renders. While PRO is paused, PRO plugins drop out of
    // everything below (providers, form, collection view and home page
    // contributions); `useBuildNavigationController` drops their collection,
    // view and navigation contributions from the status published below.
    const plugins = useMemo(
        () => filterPausedPlugins(allPlugins, licenseStatus),
        [allPlugins, licenseStatus]
    );

    useEffect(() => {
        publishLicenseStatus(licenseStatus);
        if (licenseStatus?.message) {
            if (isProPaused(licenseStatus)) console.warn(licenseStatus.message);
            else console.debug(licenseStatus.message);
        }
    }, [licenseStatus]);

    // The status belongs to this FireCMS; do not leave it to a later one.
    useEffect(() => () => publishLicenseStatus(null), []);

    const userManagement = plugins?.find(p => p.userManagement)?.userManagement
        ?? _userManagement
        ?? {
            users: [],
            getUser: (uid: string) => null
        };

    const sideDialogsController = useBuildSideDialogsController();
    const sideEntityController = useBuildSideEntityController(navigationController, sideDialogsController, authController);

    const pluginsLoading = plugins?.some(p => p.loading) ?? false;

    const loading = authController.initialLoading || navigationController.loading || pluginsLoading;

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

    /**
     * Controller in charge of fetching and persisting data
     */
    const dataSource = useBuildDataSource({
        delegate: dataSourceDelegate,
        propertyConfigs,
        navigationController,
        authController
    });

    // Inject plugin translations into the live i18next instance.
    //
    // The work, and the reason repeat writes have to be suppressed, is in
    // `applyPluginTranslations`. Paused plugins keep their strings: app code
    // may render their components directly, and strings unlock nothing.
    const appliedBundles = useRef<AppliedBundles>(createAppliedBundles());
    const appliedTo = useRef<unknown>(null);

    useEffect(() => {
        if (!i18n) return;

        // A different instance has its own store and has been written nothing.
        // Reset here rather than in an effect of its own, which would run after
        // this one and wipe the record of what this pass just wrote.
        if (appliedTo.current !== i18n) {
            appliedTo.current = i18n;
            appliedBundles.current = createAppliedBundles();
        }

        let active = true;
        const isActive = () => active;
        const applyFor = (language: string) => applyPluginTranslations({
            i18n,
            plugins: allPlugins,
            language,
            applied: appliedBundles.current,
            isActive
        });

        applyFor(i18n.language ?? "en");
        i18n.on("languageChanged", applyFor);
        return () => {
            active = false;
            i18n.off("languageChanged", applyFor);
        };
    }, [i18n, allPlugins]);

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
        <LicenseStatusContext.Provider value={licenseStatus}>
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
                                        </NavigationContext.Provider>
                                    </SideEntityControllerContext.Provider>
                                </SideDialogsControllerContext.Provider>
                            </AuthControllerContext.Provider>
                        </DataSourceContext.Provider>
                    </StorageSourceContext.Provider>
                </UserConfigurationPersistenceContext.Provider>
            </CustomizationControllerContext.Provider>
        </AnalyticsContext.Provider>
        </LicenseStatusContext.Provider>
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
