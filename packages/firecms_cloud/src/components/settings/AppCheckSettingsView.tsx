import {
    BooleanSwitchWithLabel,
    Button,
    Label,
    Paper,
    RadioGroup,
    RadioGroupItem,
    TextField,
    Typography
} from "@firecms/ui";
import { useProjectConfig } from "../../hooks";
import { useState } from "react";
import { useSnackbarController, useTranslation } from "@firecms/core";

export function AppCheckSettingsView() {

    const projectConfig = useProjectConfig();

    const snackbarController = useSnackbarController();
    const { t } = useTranslation();

    const [enabled, setEnabled] = useState<boolean>(Boolean(projectConfig.appCheck));

    const [provider, setProvider] = useState<"recaptcha_v3" | "recaptcha_enterprise" | null>(projectConfig.serializedAppCheck?.provider ?? null);
    const [siteKey, setSiteKey] = useState<string | null>(projectConfig.serializedAppCheck?.siteKey ?? null);

    const saveAppCheck = () => {
        console.debug("Saving app check", enabled, provider, siteKey);
        if (enabled && provider && siteKey) {
            try {
                projectConfig.updateAppCheck({
                    provider,
                    siteKey
                });
                snackbarController.open({
                    message: t("settings_appcheck_updated"),
                    type: "success"
                });
            } catch (e) {
                snackbarController.open({
                    message: t("settings_appcheck_error"),
                    type: "error"
                });
            }
        } else {
            projectConfig.updateAppCheck(null);
        }
    }

    return <form className={"flex flex-col gap-4"}
                 onSubmit={(e) => {
                     e.preventDefault();
                     saveAppCheck();
                 }}>
        <Typography variant={"h4"}>{t("settings_appcheck")}</Typography>

        <Typography>
            {t("settings_appcheck_description")}
        </Typography>

        <Typography>{t("settings_appcheck_add_domain", { domain: window.location.origin })}</Typography>

        <BooleanSwitchWithLabel value={enabled}
                                position={"start"}
                                size={"medium"}
                                label={t("settings_appcheck_enable")}
                                onValueChange={(value) => {
                                    setEnabled(value);
                                }}/>

        <Paper className={"p-4 flex flex-col gap-4"}>

            <div className={"flex flex-row gap-4 relative overflow-hidden"}>
                <RadioGroup
                    disabled={!enabled}
                    className={"grow shrink-0"}
                    value={provider ?? undefined}
                    onValueChange={(value) => {
                        setProvider(value as "recaptcha_v3" | "recaptcha_enterprise")
                    }}>
                    <Label
                        className="flex items-center gap-2"
                        htmlFor="recaptcha_v3">
                        <RadioGroupItem id="recaptcha_v3" value="recaptcha_v3"/>
                        ReCaptcha V3
                    </Label>
                    <Label
                        className="flex items-center gap-2"
                        htmlFor="recaptcha_enterprise">
                        <RadioGroupItem id="recaptcha_enterprise" value="recaptcha_enterprise"/>
                        ReCaptcha Enterprise
                    </Label>
                </RadioGroup>

                <TextField label={t("settings_appcheck_site_key")}
                           className={"w-full"}
                           value={siteKey ?? ""}
                           onChange={(e) => setSiteKey(e.target.value)}
                           disabled={!enabled}/>
            </div>

            <Button
                    type={"submit"}>
                {t("settings_appcheck_update")}
            </Button>

            <Typography variant={"caption"}>
                {t("settings_appcheck_refresh_note")}
            </Typography>
        </Paper>
    </form>

}
