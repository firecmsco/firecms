import * as schema from "./schema";
import { backendCollections } from "./collections";
import { collectionRegistry } from "../collections/registry";

backendCollections.forEach(collection => collectionRegistry.register(collection));

export const tables = schema;

