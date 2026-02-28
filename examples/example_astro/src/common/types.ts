import { EntityReference } from "@firecms/core";

export type ProductCategory = "home_storage" | "cameras" | "furniture" | "kitchen" | "sunglasses";

export type Product = {
    name: string;
    category: ProductCategory;
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

export type ProductWithId = Product & { id: string };

export type Locale = {
    name: string,
    description: string,
}

export type BlogEntry = {
    name: string,
    header_image: string,
    content: (BlogEntryImages | BlogEntryText | BlogEntryProducts | BlogQuote)[];
    created_on: Date,
    publish_date: Date,
    reviewed: boolean,
    status: string,
    tags: string[]
}

export type BlogEntryWithId = BlogEntry & { id: string };

export type BlogEntryImages = {
    type: "images";
    value: string[];
}

export type BlogEntryText = {
    type: "text";
    value: string;
}

export type BlogEntryProducts = {
    type: "products";
    value: ProductWithId[];
}

export type BlogQuote = {
    type: "quote";
    value: string;
}
