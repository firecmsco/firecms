import { Chip } from "@firecms/ui";
import { ProjectSubscriptionPlan } from "../../types";
import { getSubscriptionPlanName } from "../settings/common";

export function PlanChip({ subscriptionPlan }: { subscriptionPlan: ProjectSubscriptionPlan }) {

    const planName = getSubscriptionPlanName(subscriptionPlan);
    const color = subscriptionPlan === "free" ? "tealDarker" : "blueDark";
    return <Chip className="uppercase font-medium"
                 colorScheme={color}
                 size={"small"}>
        {planName + " plan"}
    </Chip>
}
