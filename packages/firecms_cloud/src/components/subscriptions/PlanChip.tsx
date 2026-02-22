import { Chip } from "@firecms/ui";
import { ProjectSubscriptionPlan } from "../../types";
import { getSubscriptionPlanName } from "../settings/common";

export function PlanChip({ subscriptionPlan }: { subscriptionPlan: ProjectSubscriptionPlan }) {

    const color = subscriptionPlan === "free" ? "grayLighter" : "blueDark";
    return <Chip className="uppercase font-medium"
                 colorScheme={color}
                 size={"small"}>
        {getSubscriptionPlanName(subscriptionPlan)}
    </Chip>
}
