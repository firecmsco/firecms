
export const organizationSchema = {
    "@context": "http://schema.org",
    "@type": "Organization",
    "name": "FireCMS",
    "url": "https://firecms.co",
    "logo": "https://firecms.co/img/firecms_logo.svg",
    "sameAs": [
        "https://x.com/firecms",
        "https://www.linkedin.com/company/firecms"
    ],
    "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Service",
        "email": "hello@firecms.co"
    }
};

export const offers = [
    {
        "@type": "Offer",
        "url": "https://firecms.co",
        "priceCurrency": "USD",
        "price": "0.00",
        "priceValidUntil": "2025-12-31",
        "itemCondition": "http://schema.org/NewCondition",
        "availability": "http://schema.org/InStock",
        "seller": {
            "@type": "Organization",
            "name": "FireCMS"
        }
    },
    {
        "@type": "Offer",
        "url": "https://firecms.co/pro",
        "priceCurrency": "USD",
        "price": "9.99",
        "priceValidUntil": "2025-12-31",
        "itemCondition": "http://schema.org/NewCondition",
        "availability": "http://schema.org/InStock",
        "seller": {
            "@type": "Organization",
            "name": "FireCMS"
        }
    }
];
export const softwareApplicationSchema = {
    "@context": "http://schema.org",
    "@type": "SoftwareApplication",
    "name": "FireCMS",
    "operatingSystem": "All",
    "image": "https://firecms.co/img/firecms_logo.svg",
    "logo": "https://firecms.co/img/firecms_logo.svg",
    "applicationCategory": "WebApplication",
    "description": "FireCMS is a powerful content management system, based on Firebase/MongoDB, React and tailwind",
    "softwareVersion": "3.0",
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "24"
    },
    "offers": offers
};


export const product = {
    "@type": "Product",
    "name": "FireCMS",
    "description": "FireCMS is a powerful content management system, based on Firebase/MongoDB, React and tailwind",
    offers: offers
};
