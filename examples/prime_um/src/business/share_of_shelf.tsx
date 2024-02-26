import { ShareOfShelfZone, AmazonProduct, Zone, IncompleteAmazonProduct } from "../types";

export function calculateShareOfShelfZones(products: (AmazonProduct | IncompleteAmazonProduct)[], clientAsins: string[]): Record<Zone, ShareOfShelfZone> {
    // Define the zone boundaries
    const ZONE_A_LIMIT = 20;
    const ZONE_B_LIMIT = 40;

    // Initialize the result structure
    let zones: Record<Zone, ShareOfShelfZone> = {
        A: { shareOfShelf: 0, products: [], client_asins: [] },
        B: { shareOfShelf: 0, products: [], client_asins: [] },
        C: { shareOfShelf: 0, products: [], client_asins: [] },
    };
    // Process each product and assign it to a zone
    products.forEach((product, index) => {
        let zoneKey: Zone;
        if (index < ZONE_A_LIMIT) {
            zoneKey = "A";
        } else if (index < ZONE_B_LIMIT) {
            zoneKey = "B";
        } else {
            zoneKey = "C";
        }

        zones[zoneKey].products.push(product);

        // Check if ASIN belongs to the client and count it
        if (clientAsins.includes(product.asin)) {
            zones[zoneKey].client_asins.push(product.asin);
        }
    });

    // Calculate the Share of Shelf for each zone
    for (const zone of ["A", "B", "C"] satisfies Zone[]) {
        const clientCount = zones[zone].client_asins.length;
        const totalCount = zones[zone].products.length;
        zones[zone].shareOfShelf = totalCount > 0 ? (clientCount / totalCount) : 0;
    }

    console.log("Calculated zones", zones);

    return zones;
}

export function mergeShareOfShelfZones(zones: Record<Zone, ShareOfShelfZone>[]): Record<Zone, ShareOfShelfZone> {
    let mergedZones: Record<Zone, ShareOfShelfZone> = {
        A: { shareOfShelf: 0, products: [], client_asins: [] },
        B: { shareOfShelf: 0, products: [], client_asins: [] },
        C: { shareOfShelf: 0, products: [], client_asins: [] },
    };

    zones.forEach((zone) => {
        for (const zoneKey of ["A", "B", "C"] satisfies Zone[]) {
            mergedZones[zoneKey].products = mergedZones[zoneKey].products.concat(zone[zoneKey].products);
            mergedZones[zoneKey].client_asins = mergedZones[zoneKey].client_asins.concat(zone[zoneKey].client_asins);

            // Calculate the Share of Shelf for the merged zone
            const clientCount = mergedZones[zoneKey].client_asins.length;
            const totalCount = mergedZones[zoneKey].products.length;
            mergedZones[zoneKey].shareOfShelf = totalCount > 0 ? (clientCount / totalCount) : 0;

        }
    });

    console.log("Merged zones", zones);

    return mergedZones;
}
