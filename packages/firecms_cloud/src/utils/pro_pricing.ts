import type { PriceInterval } from "../types/subscriptions";

/**
 * Pricing arithmetic for FireCMS PRO licenses. Pure: no React, no Firebase, so
 * the sign-in screen, the purchase form and the license view all compute the
 * same numbers from the same place.
 *
 * Amounts are in minor units (cents), as Stripe stores them.
 */

export type PriceCurrency = "eur" | "usd";

/**
 * The PRO list prices: the first project on a license, then every further
 * project on the same license.
 *
 * Used only when there is no Stripe price to read them from: on the sign-in
 * screen, which shows the price before anything is loaded, and for a graduated
 * price that arrives without its `tiers`. A price that has tiers is always
 * billed, and so shown, from the tiers.
 */
export const PRO_GRADUATED_FALLBACK: Record<PriceCurrency, Record<PriceInterval, {
    first: number,
    additional: number
}>> = {
    eur: {
        month: {
            first: 9900,
            additional: 4900
        },
        year: {
            first: 99000,
            additional: 49000
        }
    },
    usd: {
        month: {
            first: 11900,
            additional: 5900
        },
        year: {
            first: 119000,
            additional: 59000
        }
    }
};

type TierLike = {
    /** `null` means infinity: the last tier. */
    up_to: number | null;
    unit_amount: number | null;
    flat_amount?: number | null;
};

/**
 * The fields of a Stripe price (as the Stripe Firestore extension syncs it
 * into `products/{id}/prices/{id}`) that the arithmetic needs. A full
 * `ProductPrice` fits; so does a bare `{ currency, interval, metadata }` when
 * there is no price document at hand.
 */
export type PriceLike = {
    currency: string;
    interval?: string | null;
    recurring?: { interval?: string | null } | null;
    billing_scheme?: string | null;
    tiers_mode?: string | null;
    tiers?: TierLike[] | null;
    /** Null on tiered prices. */
    unit_amount?: number | null;
    metadata?: { type?: string } | null;
};

export type GraduatedPriceDescription = {
    /**
     * `graduated`: the first project costs `first`, every further one
     * `additional`. `per_unit`: every project costs the same (the legacy flat
     * per-project prices), so `first === additional`.
     */
    kind: "graduated" | "per_unit";
    currency: string;
    interval: PriceInterval;
    first: number;
    additional: number;
    /** False when the amounts came from {@link PRO_GRADUATED_FALLBACK}. */
    fromPrice: boolean;
};

export function isGraduatedProPrice(price: PriceLike): boolean {
    return price.metadata?.type === "per_project_graduated";
}

export function priceInterval(price: Pick<PriceLike, "interval" | "recurring">): PriceInterval {
    const interval = price.interval ?? price.recurring?.interval;
    return interval === "year" ? "year" : "month";
}

function fallbackTiers(price: PriceLike): TierLike[] {
    // Only EUR and USD prices exist. An unknown currency would have no right
    // answer here, and EUR is the one the website shows by default.
    const currency: PriceCurrency = price.currency?.toLowerCase() === "usd" ? "usd" : "eur";
    const { first, additional } = PRO_GRADUATED_FALLBACK[currency][priceInterval(price)];
    return [
        {
            up_to: 1,
            unit_amount: first
        },
        {
            up_to: null,
            unit_amount: additional
        }
    ];
}

/**
 * The tiers the price bills by: its own, or the section 1 amounts for a
 * graduated PRO price that arrived without them. Undefined for a per-unit
 * price.
 */
function tiersOf(price: PriceLike): TierLike[] | undefined {
    if (price.tiers && price.tiers.length > 0)
        return [...price.tiers].sort((a, b) => (a.up_to ?? Infinity) - (b.up_to ?? Infinity));
    if (isGraduatedProPrice(price))
        return fallbackTiers(price);
    return undefined;
}

/**
 * What Stripe bills for `quantity` units of `price`, per interval, before tax
 * and discounts.
 *
 * Graduated tiers bill each unit at the rate of the tier it falls in (so with
 * tiers `[{ up_to: 1, 9900 }, { up_to: null, 4900 }]`, 3 projects cost
 * 9900 + 4900 × 2). A per-unit price is `unit_amount × quantity`.
 *
 * PRO licenses are billed for at least one project; pass `max(1, projects)`
 * for what the customer will pay. This function itself returns 0 for 0.
 */
export function graduatedTotal(price: PriceLike, quantity: number): number {
    const units = Math.max(0, Math.floor(quantity));
    if (units === 0) return 0;

    const tiers = tiersOf(price);
    if (!tiers)
        return (price.unit_amount ?? 0) * units;

    if (price.tiers_mode === "volume") {
        // Every unit at the rate of the tier the whole quantity lands in.
        const tier = tiers.find(t => t.up_to === null || units <= t.up_to) ?? tiers[tiers.length - 1];
        return (tier.unit_amount ?? 0) * units + (tier.flat_amount ?? 0);
    }

    let total = 0;
    let previousUpTo = 0;
    for (const tier of tiers) {
        if (units <= previousUpTo) break;
        const upTo = tier.up_to ?? Infinity;
        const unitsInTier = Math.min(units, upTo) - previousUpTo;
        if (unitsInTier > 0)
            total += unitsInTier * (tier.unit_amount ?? 0) + (tier.flat_amount ?? 0);
        previousUpTo = upTo;
    }
    return total;
}

/**
 * The two numbers a PRO price is advertised with: what the first project
 * costs and what each further one adds. Read from the price's tiers when it
 * has them; see {@link PRO_GRADUATED_FALLBACK} for when it does not.
 */
export function describeGraduatedPrice(price: PriceLike): GraduatedPriceDescription {
    const hasOwnTiers = Boolean(price.tiers && price.tiers.length > 0);
    const first = graduatedTotal(price, 1);
    return {
        kind: tiersOf(price) ? "graduated" : "per_unit",
        currency: price.currency.toLowerCase(),
        interval: priceInterval(price),
        first,
        additional: graduatedTotal(price, 2) - first,
        fromPrice: hasOwnTiers || !isGraduatedProPrice(price)
    };
}

/**
 * A currency amount for display, without decimals when it is a whole number
 * ("€99", "$1,190", "€149.99"), in the given locale's conventions.
 */
export function formatAmount(amount: number, currency: string, locale = "en"): string {
    const whole = amount % 100 === 0;
    const options: Intl.NumberFormatOptions = {
        style: "currency",
        currency: currency.toUpperCase(),
        minimumFractionDigits: whole ? 0 : 2,
        maximumFractionDigits: 2
    };
    try {
        return new Intl.NumberFormat(locale, options).format(amount / 100);
    } catch {
        // An unknown locale tag: fall back to English formatting.
        try {
            return new Intl.NumberFormat("en", options).format(amount / 100);
        } catch {
            return `${(amount / 100).toFixed(whole ? 0 : 2)} ${currency.toUpperCase()}`;
        }
    }
}

/**
 * The currency to show first when the visitor has not chosen one: USD in the
 * Americas, EUR everywhere else (the website's default).
 */
export function preferredCurrency(timeZone?: string): PriceCurrency {
    let zone = timeZone;
    if (zone === undefined) {
        try {
            zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch {
            zone = undefined;
        }
    }
    return zone?.startsWith("America/") ? "usd" : "eur";
}
