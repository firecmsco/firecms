import { CurrencyOption, ProductPrice, SubscriptionStatus } from "../../types/subscriptions";
import { ProjectSubscriptionPlan } from "../../types/projects";

export function getCurrencyString({
                                      key,
                                      option,
                                      price
                                  }: { key: string, option: CurrencyOption, price: ProductPrice }) {
    const type = price.metadata.type ?? "per_user";
    return formatPrice(option.unit_amount, key) + (type === "per_user" ? " user/" : " project/") + price.interval;

}

export function getPriceString(price: ProductPrice) {

    const type = price.metadata.type ?? "per_user";
    if (price.billing_scheme === "tiered") {
        const firstFlatPrice = price.tiers.find(p => p.flat_amount);
        if (firstFlatPrice)
            return "Starting at " + formatPrice(firstFlatPrice.flat_amount as number, price.currency);
        else
            return "Billing in " + price.currency;
    }

    return formatPrice(price.unit_amount, price.currency) + (type === "per_user" ? " user/" : " project/") + price.interval;

}

export function formatPrice(price: number, currency: string) {
    if (currency === "usd") {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency
        }).format(price / 100);
    }

    return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: currency
    }).format(price / 100);
}

export function getSubscriptionStatusText(status: SubscriptionStatus) {
    if (status === "active") return "Active";
    if (status === "trialing") return "Trialing";
    if (status === "past_due") return "Past due";
    if (status === "canceled") return "Canceled";
    if (status === "unpaid") return "Unpaid";
    if (status === "incomplete") return "Incomplete";
    if (status === "incomplete_expired") return "Incomplete expired";
    return "Unknown";
}

export function getSubscriptionPlanName(subscriptionPlan: ProjectSubscriptionPlan) {
    switch (subscriptionPlan) {
        case "free":
            return "Free";
        case "cloud_plus":
            return "Plus";
        case "pro":
            return "Pro";
    }
}
