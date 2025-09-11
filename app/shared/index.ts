/**
 * Shared collections index file
 * This file exports all collections to be used by both frontend and backend
 */

import { machinery_collections } from "./machinery_collections";
import { test_collections } from "./test_collections";

export const collections = [
    ...machinery_collections,
    ...test_collections
];

