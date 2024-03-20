export type ProjectSubscriptionPlan = "free" | "cloud_plus" | "cloud_pro";

export type FireCMSProject = {
    name: string,
    projectId: string,
    subscription_plan: ProjectSubscriptionPlan,
}
