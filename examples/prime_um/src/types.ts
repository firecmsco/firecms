import { EntityReference } from "@firecms/core";

export type Client = {
    name: string;
    created_on: Date;
}

export type ClientSet = {
    name: string;
    created_on: Date;
    asins: string[];
}

export type Zone = 'A' | 'B' | 'C';

export type Shelf = {
    name: string;
    keywords: string[];
    created_on: Date;
    amazon_domain: "amazon.com" | "amazon.co.uk" | "amazon.de" | "amazon.fr" | "amazon.it" | "amazon.es";
}

export type SingleShareOfShelfQuery = {
    keyword: string;
    zones: Record<Zone, ShareOfShelfZone>;
    products: (AmazonProduct | IncompleteAmazonProduct)[];
}

export type ShareOfShelfQueryResult = {
    client: EntityReference<Client>;
    client_set: EntityReference<ClientSet>
    shelf: EntityReference<Shelf>;
    keywords: string[];
    updated_on: Date;
    created_on: Date;
    client_asins: string[];
    zones: Record<Zone, ShareOfShelfZone>,
    products?: (AmazonProduct | IncompleteAmazonProduct)[];
    subqueries?: SingleShareOfShelfQuery[];
    amazon_domain: "amazon.com" | "amazon.co.uk" | "amazon.de" | "amazon.fr" | "amazon.it" | "amazon.es";
}

export type ShareOfShelfZone = {
    shareOfShelf: number;
    products: (AmazonProduct | IncompleteAmazonProduct)[];
    client_asins: string[];
};

export interface AmazonProduct {
    pos: number
    url: string
    asin: string
    price: number
    title: string
    rating: number
    currency: string
    is_prime: boolean
    url_image: string
    best_seller: boolean
    price_upper: number
    is_sponsored: boolean
    manufacturer: string
    pricing_count: number
    reviews_count: number
    is_amazons_choice: boolean
    shipping_information?: string
    price_strikethrough?: number
    sales_volume?: string
    no_price_reason?: string
}

export interface IncompleteAmazonProduct {
    asin: string;
}
