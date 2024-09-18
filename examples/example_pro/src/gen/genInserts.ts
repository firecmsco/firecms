import fs from 'fs';

interface Product {
    id: string;
    public: boolean;
    category: string;
    available: boolean;
    min_known_price: number;
    name: string;
    added_on: string;
    main_image: string;
    uppercase_name: string;
    feed_excluded: boolean;
    price: number | null;
    brand: string;
    available_locales: string[];
    amazon_link: string;
    liked_by_count: number;
    currency: string;
    description: string;
    related_products: string[];
}

function extractProductIds(array: string[]): string[] {
    if(!array) return [];
    return array.map(item => item.split('/').pop());
}

function escapeString(value: string): string {
    return value.replace(/'/g, "''");
}

function formatArray(array: string[]): string {
    return array.length > 0 ? `ARRAY[${array.map(item => `'${escapeString(item)}'`).join(', ')}]` : 'ARRAY[]::TEXT[]';
}

function formatValue(value: any): string {
    if (value === null || value === undefined) {
        return 'NULL';
    } else if (typeof value === 'boolean') {
        return value ? 'TRUE' : 'FALSE';
    } else if (typeof value === 'number') {
        return value.toString();
    } else if (Array.isArray(value)) {
        return formatArray(value);
    } else if (typeof value === 'string') {
        return `'${escapeString(value)}'`;
    } else {
        return `'${escapeString(value.toString())}'`;
    }
}

function generateInsertStatements(products: Product[]): string {
    const insertStatements: string[] = [];

    products.forEach((product) => {
        const values = [
            product.id,
            product.public,
            product.category,
            product.available,
            product.min_known_price,
            product.name,
            product.added_on,
            product.main_image,
            product.uppercase_name,
            product.feed_excluded,
            product.price,
            product.brand,
            product.available_locales,
            product.amazon_link,
            product.liked_by_count,
            product.currency,
            product.description,
            extractProductIds(product.related_products) // Extract only the IDs for related_products
        ];

        const formattedValues = values.map(formatValue).join(', ');
        const insertStatement = `INSERT INTO products (id, public, category, available, min_known_price, name, added_on, main_image, uppercase_name, feed_excluded, price, brand, available_locales, amazon_link, liked_by_count, currency, description) VALUES (${formattedValues});`;

        insertStatements.push(insertStatement);
    });

    return insertStatements.join('\n');
}

// Replace 'your_products.json' with the actual path to your JSON file
const productsData = JSON.parse(fs.readFileSync('./src/gen/Products.json', 'utf8'));
const insertStatements = generateInsertStatements(productsData);
const res =  "DELETE * FROM products;\n" + insertStatements;
console.log(res);


// save output to a file
fs.writeFileSync('./src/gen/inserts.sql', res);
