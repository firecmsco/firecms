
export function getCurrencySymbol(currency: string) {
    switch (currency) {
        case "USD":
            return "$";
        case "EUR":
            return "€";
        case "JPY":
            return "¥";
        case "GBP":
            return "£";
        default:
            return currency;
    }
}
