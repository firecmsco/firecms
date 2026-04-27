import React, { useEffect, useState } from "react";

import {
    BrightnessMediumIcon,
    Checkbox,
    DarkModeIcon,
    IconButton,
    Label,
    LightModeIcon,
    MailIcon,
    Menu,
    MenuItem,
    Typography
} from "@firecms/ui";
import { ErrorView, FireCMSLogo, LanguageToggle, useModeController, useTranslation } from "@firecms/core";
import { GoogleLoginButton } from "./GoogleLoginButton";
import { FireCMSBackend } from "../../types";
import { LoginButton } from "@firecms/firebase";
import { CloudUserPasswordForm } from "./CloudUserPasswordForm";

export interface FireCMSCloudLoginViewProps {
    fireCMSBackend: FireCMSBackend;
    includeGoogleAdminScopes: boolean;
    includeLogo: boolean;
    includeGoogleDisclosure: boolean;
    includeTermsAndNewsLetter: boolean;
    disableMarketing?: boolean;
    onAnalyticsEvent?: (event: string, params?: object) => void;
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
}

/**
 * Use this component to render a login view, that updates
 * the state of the {@link AuthController} based on the result

 * @group Firebase
 */
export function FireCMSCloudLoginView({
                                          fireCMSBackend,
                                          includeGoogleAdminScopes,
                                          includeLogo,
                                          includeGoogleDisclosure,
                                          includeTermsAndNewsLetter,
                                          disableMarketing,
                                          onAnalyticsEvent,
                                          title,
                                          subtitle
                                      }: FireCMSCloudLoginViewProps) {
    const { t } = useTranslation();
    const { mode, setMode } = useModeController();

    const [termsAccepted, setTermsAccepted] = useState(false);
    const [subscribeToNewsletter, setSubscribeToNewsletter] = useState(false);
    const [fadeIn, setFadeIn] = useState(false);
    const [passwordLoginSelected, setPasswordLoginSelected] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFadeIn(true);
        }, 10);
        onAnalyticsEvent?.("view_displayed");
        return () => clearTimeout(timer);
    }, [onAnalyticsEvent]);

    function buildErrorView() {
        let errorView: any;
        const ignoredCodes = ["auth/popup-closed-by-user", "auth/cancelled-popup-request"];
        if (fireCMSBackend.authProviderError && !ignoredCodes.includes(fireCMSBackend.authProviderError.code)) {

            if (fireCMSBackend.authProviderError.code === "auth/user-not-found")
                errorView =
                    <ErrorView error={t("auth_user_not_found")}/>;
            else if (fireCMSBackend.authProviderError.code === "auth/wrong-password")
                errorView =
                    <ErrorView error={t("auth_wrong_password")}/>;
            else if (fireCMSBackend.authProviderError.code === "auth/user-disabled")
                errorView =
                    <ErrorView error={t("auth_user_disabled")}/>;
            else if (fireCMSBackend.authProviderError.code === "auth/account-exists-with-different-credential")
                errorView =
                    <ErrorView error={t("auth_account_exists_with_different_credential")}/>;
            else if (fireCMSBackend.authProviderError.code === "auth/email-already-in-use")
                errorView =
                    <ErrorView error={t("auth_email_already_in_use")}/>;
            else
                errorView =
                    <ErrorView error={fireCMSBackend.authProviderError}/>;
        }
        return errorView;
    }

    const fadeStyle = {
        opacity: fadeIn ? 1 : 0,
        transition: "opacity 0.6s ease-in-out"
    };

    // Permissions required mode - simple centered dialog
    if (includeGoogleAdminScopes) {
        return (
            <div className="inset-0 flex items-center justify-center p-8 m-0 relative" style={fadeStyle}>
                
                <div className="absolute top-4 right-4 flex gap-2">
                    <Menu
                        trigger={<IconButton
                            color="inherit"
                            aria-label="Toggle mode">
                            {mode === "dark"
                                ? <DarkModeIcon size="small" />
                                : <LightModeIcon size="small" />}
                        </IconButton>}>
                        <MenuItem onClick={() => setMode("dark")}><DarkModeIcon size={"smallest"} /> {t("dark_mode")}</MenuItem>
                        <MenuItem onClick={() => setMode("light")}><LightModeIcon size={"smallest"} /> {t("light_mode")}</MenuItem>
                        <MenuItem onClick={() => setMode("system")}> <BrightnessMediumIcon
                            size={"smallest"} />{t("system_mode")}</MenuItem>
                    </Menu>
                    <LanguageToggle />
                </div>

                <div className="w-full max-w-md flex flex-col items-center">
                    {includeLogo && (
                        <div className="m-4" style={{
                            width: "160px",
                            height: "160px"
                        }}>
                            <FireCMSLogo/>
                        </div>
                    )}

                    {includeLogo && (
                        <Typography variant={"h4"}
                                    color={"primary"}
                                    className={subtitle ? "mb-2" : "mb-4"}>
                            {title || (
                                <>
                                    FireCMS <Typography variant={"h4"}
                                                        component={"span"}
                                                        className={"text-primary"}>CLOUD</Typography>
                                </>
                            )}
                        </Typography>
                    )}

                    {subtitle && (
                        <Typography color={"secondary"} className="mb-4 text-center">
                            {subtitle}
                        </Typography>
                    )}

                    <div className="w-full space-y-4">

                        <GoogleLoginButton
                            onClick={() => {
                                onAnalyticsEvent?.("google_attempt");
                                fireCMSBackend.googleLogin(includeGoogleAdminScopes).then((user) => {
                                    onAnalyticsEvent?.("google_success");
                                }).catch((error) => {
                                    onAnalyticsEvent?.("google_error", { error: error?.code });
                                });
                            }}/>

                        {fireCMSBackend.permissionsNotGrantedError &&
                            <ErrorView
                                error={t("auth_google_permissions_required")}/>}

                        {buildErrorView()}

                    </div>
                </div>
            </div>
        );
    }

    // Normal login mode - full view with marketing section
    return (
        <div className="fixed inset-0 flex flex-col lg:flex-row m-0 p-0 overflow-y-auto bg-gray-100 dark:bg-surface-900" style={fadeStyle}>
            {/* Marketing Section - Left Side (Desktop only) */}
            {!disableMarketing && <div
                className="hidden lg:flex lg:w-1/2 bg-primary text-white flex-col justify-center items-center p-12 m-0">
                <div className="max-w-md">
                    <Typography variant="h5" className="font-mono uppercase mb-8 text-white ">
                        {t("build_admin_panel_in_minutes")}
                    </Typography>
                    <ul className="space-y-3 text-left list-disc list-inside marker:text-white">
                        <li>
                            <Typography variant="body1" className="text-blue-50 inline">
                                {t("go_live_instantly")} <b>{t("create_production_ready_back_offices")}</b> {t("without_the_frontend_hassle")}
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body1" className="text-blue-50 inline">
                                <b>{t("automatic_setup")}</b> {t("from_your_existing_firestore_data")}
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body1" className="text-blue-50 inline">
                                {t("seamless_real_time_firebase_integration")}
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body1" className="text-blue-50 inline">
                                {t("intuitive_spreadsheet_like_ui")} {t("your_whole_team_can_use")}
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body1" className="text-blue-50 inline">
                                <b>{t("focus_on_your_app")}</b> {t("not_the_admin_panel")}
                            </Typography>
                        </li>
                    </ul>
                </div>
            </div>}

            {/* Login Content - Right Side */}
            <div
                className={`flex flex-col items-center justify-center w-full h-full min-h-screen lg:min-h-0 p-8 m-0 relative bg-gray-100 dark:bg-surface-900 ${disableMarketing ? "" : "lg:w-1/2"}`}>
                
                <div className="absolute top-4 right-4 flex gap-2">
                    <Menu
                        trigger={<IconButton
                            color="inherit"
                            aria-label="Toggle mode">
                            {mode === "dark"
                                ? <DarkModeIcon size="small" />
                                : <LightModeIcon size="small" />}
                        </IconButton>}>
                        <MenuItem onClick={() => setMode("dark")}><DarkModeIcon size={"smallest"} /> {t("dark_mode")}</MenuItem>
                        <MenuItem onClick={() => setMode("light")}><LightModeIcon size={"smallest"} /> {t("light_mode")}</MenuItem>
                        <MenuItem onClick={() => setMode("system")}> <BrightnessMediumIcon
                            size={"smallest"} />{t("system_mode")}</MenuItem>
                    </Menu>
                    <LanguageToggle />
                </div>

                {includeLogo && (
                    <div className="m-4" style={{
                        width: "160px",
                        height: "160px"
                    }}>
                        <FireCMSLogo/>
                    </div>
                )}

                {includeLogo && (
                    <Typography variant={"h4"}
                                color={"primary"}
                                className={subtitle ? "mb-2 text-center" : "mb-4 text-center"}>
                        {title || (
                            <>
                                FireCMS <Typography variant={"h4"}
                                                    component={"span"}
                                                    className={"text-primary"}>CLOUD</Typography>
                            </>
                        )}
                    </Typography>
                )}

                {subtitle && (
                    <Typography color={"secondary"} className="mb-4 text-center max-w-sm">
                        {subtitle}
                    </Typography>
                )}

                <div className={"w-full max-w-md"}>
                    {includeTermsAndNewsLetter &&
                        <div className={"mb-4"}>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="newsletter-checkbox"
                                    checked={subscribeToNewsletter}
                                    onCheckedChange={setSubscribeToNewsletter}
                                    size="small"
                                />
                                <Label htmlFor="newsletter-checkbox">
                                    <Typography variant={"caption"} color={"primary"}>
                                        {t("join_our_newsletter")}
                                    </Typography>
                                </Label>
                            </div>
                            {!passwordLoginSelected && <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="terms-checkbox"
                                    checked={termsAccepted}
                                    onCheckedChange={setTermsAccepted}
                                    size="small"
                                />
                                <Label htmlFor="terms-checkbox">
                                    <Typography variant={"caption"} color={"primary"}>
                                        {t("by_signing_in_you_agree_to_our")} <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href={"https://firecms.co/policy/terms_conditions"}>
                                        {t("terms_and_conditions")}</a> {t("and_our")} <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href={"https://firecms.co/policy/privacy_policy"}>
                                        {t("privacy_policy")}</a>
                                    </Typography>
                                </Label>
                            </div>}
                        </div>}

                    {!passwordLoginSelected && <GoogleLoginButton
                        disabled={!termsAccepted && includeTermsAndNewsLetter}
                        onClick={() => {
                            onAnalyticsEvent?.("google_attempt");
                            fireCMSBackend.googleLogin(includeGoogleAdminScopes).then((user) => {
                                onAnalyticsEvent?.("google_success");
                                if (subscribeToNewsletter && user?.email) {
                                    subscribeNewsletter(user.email);
                                }
                            }).catch((error) => {
                                onAnalyticsEvent?.("google_error", { error: error?.code });
                            });
                        }}/>}

                    {!passwordLoginSelected && <LoginButton
                        disabled={!termsAccepted && includeTermsAndNewsLetter}
                        text={t("email_password")}
                        icon={<MailIcon size={24}/>}
                        onClick={() => {
                            onAnalyticsEvent?.("password_method_selected");
                            setPasswordLoginSelected(true);
                        }}/>}

                    {passwordLoginSelected && <CloudUserPasswordForm
                        fireCMSBackend={fireCMSBackend}
                        onClose={() => setPasswordLoginSelected(false)}
                        onAnalyticsEvent={onAnalyticsEvent}
                    />}


                    {buildErrorView()}

                    {includeGoogleDisclosure && <Typography variant={"caption"} className={"mt-4"}>
                        {t("firecms_cloud_google_disclosure")} <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={"https://developers.google.com/terms/api-services-user-data-policy#additional_requirements_for_specific_api_scopes"}>
                        {t("google_api_services_user_data_policy")}</a>, {t("including_the_limited_use_requirements")}
                    </Typography>}
                </div>
            </div>
        </div>
    );

}

const subscribeNewsletter = (email: string) => {
    const url = "https://api.firecms.co/notifications/newsletter";
    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email_address: email,
            source: "saas"
        })
    }).then((res) => {
    });
}
