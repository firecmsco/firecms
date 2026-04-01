import { Paper, Typography } from "@firecms/ui";
import { useTranslation } from "@firecms/core";

export function SecurityRulesInstructions({}: {}) {

    const { t } = useTranslation();

    return <>
        <Typography variant={"h4"}>{t("settings_security_rules")}</Typography>

        <Typography>
            {t("settings_security_rules_description")}
        </Typography>

        <Paper>
            <Typography component={"pre"}
                        className="m-0 p-4 text-sm font-mono">
                {
                    `match /{document=**} {
    allow read, write: if request.auth.token.fireCMSUser;
}`
                }
            </Typography>
        </Paper>
        <Typography variant={"caption"}>
            {t("settings_security_rules_caption")}
        </Typography>

    </>

}
