import { Chip } from "@firecms/ui";
import { ProjectSubscriptionPlan } from "../../types/index.js";
import { getSubscriptionPlanName } from "../settings/common.js";
import { useTranslation } from "@firecms/core";

export function PlanChip({ subscriptionPlan }: { subscriptionPlan: ProjectSubscriptionPlan }) {

    const { t } = useTranslation();
    const color = subscriptionPlan === "free" ? "grayLighter" : "blueDark";
    return <Chip className="uppercase font-medium"
                 colorScheme={color}
                 size={"small"}>
        {getSubscriptionPlanName(subscriptionPlan, t)}
    </Chip>
}
