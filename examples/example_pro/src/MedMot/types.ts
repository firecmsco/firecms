import { EntityReference } from "@firecms/core";

export type Product = {
    name: string;
    category:string;
    available: boolean;
    price: number;
    currency: string;
    public: boolean;
    brand: string;
    description: string;
    amazon_link: string;
    images: string[];
    related_products: EntityReference[];
    publisher: {
        name: string;
        external_id: string;
    },
    added_on: Date;
    tags: string[];
}

export type Locale = {
    name: string,
    description: string,
    selectable?: boolean,
    video: string
}
