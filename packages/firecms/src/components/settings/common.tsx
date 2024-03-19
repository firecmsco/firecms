import { ProductPrice, Subscription } from "../../types/subscriptions";
import { ProjectSubscriptionPlan } from "../../types/projects";

export function getPriceString(price: ProductPrice) {

    if(price.currency === "usd") {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: price.currency
        }).format(price.unit_amount / 100) + " user/" + price.interval;
    }

    return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: price.currency
    }).format(price.unit_amount / 100) + " user/" + price.interval;
}


export function getStatusText(subscription: Subscription) {
    if (subscription.status === "active") return "Active";
    if (subscription.status === "trialing") return "Trialing";
    if (subscription.status === "past_due") return "Past due";
    if (subscription.status === "canceled") return "Canceled";
    if (subscription.status === "unpaid") return "Unpaid";
    if (subscription.status === "incomplete") return "Incomplete";
    if (subscription.status === "incomplete_expired") return "Incomplete expired";
    return "Unknown";
}

export function getSubscriptionPlanName(subscriptionPlan: ProjectSubscriptionPlan) {
    switch (subscriptionPlan) {
        case "free":
            return "Free";
        case "cloud_plus":
            return "Plus";
        case "cloud_pro":
            return "Pro";
    }
}
