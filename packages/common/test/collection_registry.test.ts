import { EntityCollection } from "@firecms/types";
import { CollectionRegistry } from "../src/collections/CollectionRegistry";

describe("CollectionRegistry Dual-Layer Store", () => {
    it("preserves un-mutated definitions when resolving relations", () => {
        const postsCollection: EntityCollection = {
            id: "posts",
            name: "Posts",
            path: "posts", // `get()` resolves against dbPath or slug!
            dbPath: "posts",
            properties: {
                title: { type: "string" }
            }
        };

        const rawAuthorsCollection: EntityCollection = {
            id: "authors",
            name: "Authors",
            path: "authors",
            dbPath: "authors",
            properties: {
                author_posts: {
                    type: "relation",
                    relationName: "posts_link",
                    collectionPath: "posts"
                },
                map_field: {
                    type: "map",
                    properties: {
                        nested_relation: {
                            type: "relation",
                            relationName: "posts_link",
                            collectionPath: "posts"
                        }
                    }
                }
            },
            relations: [{
                relationName: "posts_link",
                collection: postsCollection
            }]
        };

        const registry = new CollectionRegistry([postsCollection, rawAuthorsCollection]);

        // 1. The normalized registry should inject the resolved relation directly onto the property
        const normalizedAuthors = registry.get("authors");
        expect(normalizedAuthors).toBeDefined();
        const authorPostsField = normalizedAuthors!.properties.author_posts as any;
        expect(authorPostsField.relation).toBeDefined();
        expect(authorPostsField.relation.collection.name).toBe("Posts");
        
        const nestedField = normalizedAuthors!.properties.map_field as any;
        expect(nestedField.properties.nested_relation.relation).toBeDefined();

        // 2. The raw registry should not be mutated! It must exactly match the initial input.
        const pristineAuthors = registry.getRaw("authors");
        expect(pristineAuthors).toBeDefined();
        const pristinePostsField = pristineAuthors!.properties.author_posts as any;
        expect(pristinePostsField.relation).toBeUndefined(); // It should strictly be a string map lookup
        
        const pristineNestedField = pristineAuthors!.properties.map_field as any;
        expect(pristineNestedField.properties.nested_relation.relation).toBeUndefined();

        // 3. getRawCollections array should also be protected
        const pristineArr = registry.getRawCollections().find(c => c.name === "Authors");
        const pristineArrField = pristineArr!.properties.author_posts as any;
        expect(pristineArrField.relation).toBeUndefined();
    });
});
