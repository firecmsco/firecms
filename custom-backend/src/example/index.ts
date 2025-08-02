import * as schema from "./schema";
import { backendCollections } from "./collections";
import { collectionRegistry } from "../lib/collections/registry";

backendCollections.forEach(collection => collectionRegistry.register(collection));

export const tables = {
    customers: schema.customers,
    machinery: schema.machinery,
    machineryImages: schema.machineryImages,
    maintenanceHistory: schema.maintenanceHistory,
    media: schema.media,
    offers: schema.offers,
    paymentHistory: schema.paymentHistory,
    rentals: schema.rentals,
    users: schema.users,
    usersSessions: schema.usersSessions
};
