import React from "react";
import { CurrencyOption, getCurrencyString, ProductPrice } from "../../index";
import { Chip, Select, SelectItem } from "@firecms/ui";

export interface SubscriptionPriceSelectParams {
    currencies: Record<"eur" | "usd", CurrencyOption>;
    selectedCurrency?: string;
    setSelectedCurrency: (currency: string) => void;
    largePriceLabel: boolean;
    fullWidth?: boolean;
    price: ProductPrice;
}

export function CurrencyPriceSelect({
                                        currencies,
                                        setSelectedCurrency,
                                        largePriceLabel,
                                        selectedCurrency,
                                        fullWidth = true,
                                        price
                                    }: SubscriptionPriceSelectParams) {

    return <Select
        size={"medium"}
        padding={false}
        fullWidth={false}
        onChange={(e) => {
            setSelectedCurrency(e.target.value);
        }}
        className={fullWidth ? "w-full" : "w-fit"}
        position={"item-aligned"}
        // label={"Choose pricing plan"}
        renderValue={(value) => {
            const data = Object.entries(currencies).find(([key, option]) => key === value);
            if (!data) return null;
            const currencyString = getCurrencyString({
                key: data[0],
                option: data[1],
                price
            });
            if (largePriceLabel) {
                return <span
                    className={"ml-4 mb-4 text-xl font-bold text-primary text-center my-8"}>{currencyString}</span>
            }
            return <Chip>
                {data ? currencyString : ""}
            </Chip>;
        }}
        value={selectedCurrency ?? ""}>
        {currencies && Object.entries(currencies).map((([key, option]) =>
                <SelectItem key={key} value={key}>
                    {getCurrencyString({
                        key,
                        option,
                        price
                    })}
                </SelectItem>
        ))}
    </Select>;
}
