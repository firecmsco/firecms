import { EntityReference } from "firecms";

export type Product = {
    name: string;
    main_image: string;
    available: boolean;
    price: number;
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
    uppercase_name: string,
    added_on: Date;
}

export type BlogEntry = {
    name: string;
    header_image: string;
    content: (BlogEntryImages | BlogEntryText | BlogEntryProducts)[];
    status: string;
    created_on: Date
}

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
    value: Product[];
}
