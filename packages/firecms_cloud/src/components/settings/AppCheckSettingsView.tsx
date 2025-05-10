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
import { useSnackbarController } from "@firecms/core";

export function AppCheckSettingsView() {

    const projectConfig = useProjectConfig();

    const snackbarController = useSnackbarController();

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
                    message: "AppCheck updated",
                    type: "success"
                });
            } catch (e) {
                snackbarController.open({
                    message: "Error updating AppCheck",
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
        <Typography variant={"h4"}>AppCheck</Typography>

        <Typography>
            You can enable AppCheck to protect your Firebase services from abuse.
            Check how to configure it in the <a href={"https://firebase.google.com/docs/app-check"}>Firebase
            documentation
        </a>.
            When you have a provider set, you can enable it here. You will need to provide
            a secret in your Firebase project settings, and a site key in the FireCMS config.
        </Typography>

        <Typography>Remember to add the domain <b>{window.location.origin}</b> to your provider allowed
            domains</Typography>

        <BooleanSwitchWithLabel value={enabled}
                                position={"start"}
                                size={"medium"}
                                label={"Enable AppCheck"}
                                onValueChange={(value) => {
                                    setEnabled(value);
                                }}/>

        <Paper className={"p-4 flex flex-col gap-4"}>

            <div className={"flex flex-row gap-4"}>
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

                <TextField label={"Site key"}
                           className={"w-full"}
                           value={siteKey ?? ""}
                           onChange={(e) => setSiteKey(e.target.value)}
                           disabled={!enabled}/>
            </div>

            <Button variant={"outlined"}
                    type={"submit"}>
                Update AppCheck
            </Button>

            <Typography variant={"caption"}>
                You might need to refresh the page to see the changes, after saving.
            </Typography>
        </Paper>
    </form>

}
