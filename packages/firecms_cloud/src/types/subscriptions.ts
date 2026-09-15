import { Timestamp } from "firebase/firestore";

export type Product = {
    id: string;
    active: boolean;
    description: string;
    name: string;
    tax_code: string;
    metadata: {
        type: SubscriptionType;
    }

}
export type ProductWithPrices = Product & {
    prices: ProductPrice[];
}

export type CurrencyOption = {
    custom_unit_amount: number | null;
    tax_behavior: string;
    unit_amount: number;
    unit_amount_decimal: string;
};

/**
 * What a PRO license price bills for, from the Stripe price's `metadata.type`.
 * - `per_user`: legacy, quantity = seats.
 * - `per_project`: legacy flat price per Firebase project.
 * - `per_project_graduated`: one price with graduated tiers (first project at
 *   one rate, every further project at a lower one); quantity = linked projects.
 */
export type ProLicensePriceType = "per_user" | "per_project" | "per_project_graduated";

export type PriceInterval = "month" | "year";

export type ProductPrice = {
    id: string;
    active: boolean;
    /** `tiered` prices carry their amounts in `tiers` and have a null `unit_amount`. */
    billing_scheme: "per_unit" | "tiered" | string;
    tiers_mode?: "graduated" | "volume" | null;
    currency: "eur" | "usd";
    description: string;
    interval: PriceInterval;
    interval_count: number;
    lookup_key?: string;
    metadata: {
        product: string;
        type: ProLicensePriceType;
    }
    currency_options: Record<"eur" | "usd", CurrencyOption>
    /**
     * Present on tiered prices, as synced by the Stripe extension; `null` or
     * missing on per-unit ones.
     */
    tiers?: ProductPriceTier[] | null;
    default: boolean;
    tax_behavior: string;
    type: "recurring" | "one_time";
    /** Null on tiered prices. */
    unit_amount: number | null;
    recurring: {
        aggregate_usage: "max";
        interval: PriceInterval;
        interval_count: number;
        trial_period_days: number;
        usage_type: "metered"
    }

}

export type ProductPriceTier = {
    flat_amount: number | null;
    unit_amount: number | null;
    /** Last unit this tier covers; `null` means infinity (the last tier). */
    up_to: number | null;
    unit_amount_decimal: string | null;
    flat_amount_decimal: string | null;
}

export type SubscriptionType = "openai" | "cloud_plus" | "pro";

export type SubscriptionStatus =
    "active"
    | "canceled"
    | "incomplete"
    | "incomplete_expired"
    | "past_due"
    | "trialing"
    | "unpaid";

export type Subscription = {
    id: string;
    price: ProductPrice;
    unit_amount: number;
    quantity: number;
    interval: string;
    interval_count: number;
    product: Product;
    stripeLink: string;
    status: SubscriptionStatus;
    items?: SubscriptionItem[];
    metadata: {
        projectId?: string;
        licenseId?: string;
        type: SubscriptionType
    },
    created: Timestamp;
    cancel_at_period_end: boolean;
    cancel_at: Timestamp;
    canceled_at: Timestamp;
    current_period_end?: Timestamp;
}

export type SubscriptionItem = {
    quantity: number;
    price?: {
        lookup_key?: string;
        unit_amount?: number;
        currency?: string;
    }
};
