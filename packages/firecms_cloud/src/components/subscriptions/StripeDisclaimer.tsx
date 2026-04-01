import { Typography } from "@firecms/ui";
import { useTranslation } from "@firecms/core";

export function StripeDisclaimer() {
    const { t } = useTranslation();
    return <Typography variant={"caption"} className={"mt-4"}>
        {t("settings_stripe_disclaimer")}
    </Typography>;
}
