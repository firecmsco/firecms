/**
 * FireCMS PRO list prices, per month. Every Firebase project linked to a
 * license counts the same; the first one is billed at `first`, each further
 * project on the same license at `additional`.
 *
 * Shown on /pro and /pricing through `PriceText.astro`, which switches between
 * the two currencies with `CurrencyToggle.astro`. The Stripe prices live on
 * product prod_QzJTxkIu85uGDD; keep these in sync by hand.
 */
export const PRO_PRICES = {
    first: { eur: "€99", usd: "$119" },
    additional: { eur: "€49", usd: "$59" },
} as const;

export type CurrencyPrice = { eur: string; usd: string };
