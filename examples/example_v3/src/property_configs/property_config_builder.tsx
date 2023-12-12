import { PropertyConfig } from "firecms";

export const pricePropertyConfig: PropertyConfig = {
    name: "Price builder",
    key: "price_builder",
    property: ({ values }) => ({
        dataType: "number",
        name: "Price",
        validation: {
            requiredMessage: "You must set a price between 0 and 1000",
            min: 0,
            max: 1000
        },
        disabled: !values.available && {
            clearOnDisabled: true,
            disabledMessage: "You can only set the price on available items"
        },
        description: "Price with range validation"
    }),
}
