const { resolveCollectionRelations } = require('@firecms/common');

// Mock your exact collections configuration
const tagsCollection = {
    name: "Tags",
    slug: "tags",
    dbPath: "tags",
    properties: {
        id: { type: "number" },
        name: { type: "string" }
    },
    relations: [
        {
            relationName: "posts",
            target: () => postsCollection,
            cardinality: "many",
            direction: "inverse",
            inverseRelationName: "tags"
        }
    ]
};

const postsCollection = {
    name: "Posts",
    slug: "posts",
    dbPath: "posts",
    properties: {
        id: { type: "number" },
        title: { type: "string" }
    },
    relations: [
        {
            relationName: "tags",
            target: () => tagsCollection,
            cardinality: "many",
            direction: "owning",
            through: {
                table: "posts_tags",
                sourceColumn: "post_id",
                targetColumn: "tag_id"
            }
        }
    ]
};

console.log("=== DEBUGGING INVERSE MANY-TO-MANY RELATION ===");

// Step 1: What does the tags collection relation look like?
const tagsRelations = resolveCollectionRelations(tagsCollection);
console.log("1. Tags collection relations:", JSON.stringify(tagsRelations, null, 2));

// Step 2: What does the posts collection relation look like?
const postsRelations = resolveCollectionRelations(postsCollection);
console.log("2. Posts collection relations:", JSON.stringify(postsRelations, null, 2));

// Step 3: Simulate the findCorrespondingJunctionTable logic
const inverseRelation = tagsRelations.posts;
console.log("3. Inverse relation from tags:", JSON.stringify(inverseRelation, null, 2));

console.log("4. Looking for corresponding owning relation...");
console.log("   - inverseRelation.inverseRelationName:", inverseRelation.inverseRelationName);

// Step 4: Check each relation in posts collection
for (const [relationKey, targetRelation] of Object.entries(postsRelations)) {
    console.log(`   - Checking posts.${relationKey}:`, {
        relationName: targetRelation.relationName,
        cardinality: targetRelation.cardinality,
        direction: targetRelation.direction,
        hasThrough: !!targetRelation.through,
        through: targetRelation.through
    });

    const matches = targetRelation.cardinality === "many" &&
                   targetRelation.direction === "owning" &&
                   targetRelation.through &&
                   (targetRelation.relationName === inverseRelation.inverseRelationName || relationKey === inverseRelation.inverseRelationName);

    console.log(`   - Does it match? ${matches}`);

    if (matches) {
        console.log("   - FOUND MATCH! Junction info:");
        console.log("     - table:", targetRelation.through.table);
        console.log("     - sourceColumn (swapped):", targetRelation.through.targetColumn);
        console.log("     - targetColumn (swapped):", targetRelation.through.sourceColumn);
    }
}
