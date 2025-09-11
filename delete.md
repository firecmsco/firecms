Great starting point. The cleanest way to integrate your Relation model into the existing FireCMS collection API is to:

- Declare relations at the collection level (single source of truth)
- Expose them in fields via small property builders (referenceProperty, referenceArrayProperty, lookupProperty)
- Re-use relations to generate subcollections (SQL equivalent of nested paths)
- Provide write semantics (owning vs inverse) so the CMS knows how to persist changes
- Allow many-to-many through a join table (through)

Below is a minimal, composable API that fits those goals and keeps EntityCollection backwards compatible.

1) Extend EntityCollection with relations
- relations is a registry of all the relations originating from this collection.
- direction/localKey/targetKey/through provide write semantics.
- joins is still supported for explicit multi-hop relations.

Type additions

export interface EntityCollection<T = any> {
// existing fields...
table: string;              // required for SQL provider
primaryKey: string;         // required for SQL provider
relations?: Record<string, SqlRelation>;
subcollections?: ((entityId: string, entity?: T) => EntityCollection[] ) | EntityCollection[];
}

export interface SqlRelation extends Relation {
/**
* Which side owns the persistence for this relationship.
* - "owning": the FK or junction updates are written from "this" collection
* - "inverse": FK exists on the target (typical 1:N reverse side). Edits are usually done
*   via a subcollection or a separate editor; the field on this entity is read-only.
    */
    direction: "owning" | "inverse";

/**
* Column on THIS table that stores the foreign key to target (for 1:1 or N:1).
* Required when direction = "owning" and cardinality = "one".
  */
  localKey?: string;

/**
* Column on TARGET table that stores the FK to this entity (for 1:N inverse side).
* Required when direction = "inverse" and cardinality = "many".
  */
  foreignKeyOnTarget?: string;

/**
* Defaults to target().primaryKey
  */
  targetKey?: string;

/**
* Many-to-many support through a junction table.
* Required when cardinality = "many" and neither side carries the FK.
  */
  through?: {
  table: string;
  sourceColumn: string; // FK to "this" collection PK
  targetColumn: string; // FK to target PK
  };

/**
* Optional helper to expose as a child table under the entity view.
  */
  ui?: {
  asSubcollection?: boolean;
  label?: string;
  };
  }

2) Field/property builders that consume relations
- referenceProperty: for 1:1 or N:1 on the owning side (writes the local FK)
- referenceArrayProperty: for N:M through a junction; or a read-only inverse 1:N list
- lookupProperty: read-only joined value for display (e.g. author.name)

Property builders

type ReferenceDisplay = {
previewField?: string;     // e.g. "name" on target
searchFields?: string[];   // used by autocomplete
};

export function referenceProperty(opts: {
relation: string | SqlRelation;
display?: ReferenceDisplay;
required?: boolean;
}) { /* returns Property config wiring fetch, save, validation */ }

export function referenceArrayProperty(opts: {
relation: string | SqlRelation;
display?: ReferenceDisplay;
editable?: boolean; // only true if relation.through is present or direction=owning with localKey as JSON array (if supported)
}) { /* returns array Property config */ }

export function lookupProperty<T = any>(opts: {
relation: string | SqlRelation;
pick: string;              // column on target to display
alias?: string;            // optional virtual column name
}) { /* read-only property that adds a JOIN in list/detail queries */ }

3) Subcollections from relations
- Reuse relations to render child tables/tabs under an entity page.
- This is the SQL counterpart to Firestore subcollections.

Helper to create subcollection from a relation:

export function subcollectionFromRelation(opts: {
relation: string | SqlRelation;
overrides?: Partial<EntityCollection>;
}): (parentId: string) => EntityCollection {
// returns a collection filtered by the relation,
// e.g. WHERE posts.author_id = :parentId or via junction
}

4) Example: authors, posts, tags with post_tags junction

const authors: EntityCollection = {
name: "Authors",
table: "authors",
primaryKey: "id",
properties: {
id: { dataType: "number", name: "ID" },
name: { dataType: "string", name: "Name" }
},
relations: {
// inverse side of 1:N (authors -> posts)
posts: {
relationName: "posts",
target: () => posts,
cardinality: "many",
direction: "inverse",
foreignKeyOnTarget: "author_id", // column on posts
targetKey: "id",
ui: { asSubcollection: true, label: "Posts" }
}
},
// show posts as a child table of an author
subcollections: (authorId) => [
subcollectionFromRelation({ relation: "posts" })(authorId)
]
};

const posts: EntityCollection = {
name: "Posts",
table: "posts",
primaryKey: "id",
relations: {
// owning side of N:1 (posts -> authors)
author: {
relationName: "author",
target: () => authors,
cardinality: "one",
direction: "owning",
localKey: "author_id",  // column on posts
targetKey: "id"
},
// many-to-many via junction
tags: {
relationName: "tags",
target: () => tags,
cardinality: "many",
direction: "owning",
through: {
table: "post_tags",
sourceColumn: "post_id",
targetColumn: "tag_id"
}
}
},
properties: {
id: { dataType: "number", name: "ID" },
title: { dataType: "string", name: "Title" },
author_id: { dataType: "number", name: "Author ID" },
// editable FK with autocomplete UI
author: referenceProperty({
relation: "author",
display: { previewField: "name", searchFields: ["name", "email"] },
required: true
}),
// read-only projection of author.name via JOIN (for list/detail)
author_name: lookupProperty({
relation: "author",
pick: "name",
alias: "author_name"
}),
// editable many-to-many via junction table
tags: referenceArrayProperty({
relation: "tags",
display: { previewField: "name", searchFields: ["name"] },
editable: true
})
}
};

const tags: EntityCollection = {
name: "Tags",
table: "tags",
primaryKey: "id",
properties: {
id: { dataType: "number", name: "ID" },
name: { dataType: "string", name: "Name" }
},
relations: {
posts: {
relationName: "posts",
target: () => posts,
cardinality: "many",
direction: "inverse", // inverse via the same junction (editable via posts.tags)
through: {
table: "post_tags",
sourceColumn: "tag_id",
targetColumn: "post_id"
},
ui: { asSubcollection: true }
}
},
subcollections: (tagId) => [
subcollectionFromRelation({ relation: "posts" })(tagId)
]
};

5) Multi-hop relations with joins
- Keep your JoinCondition for cases where target is several hops away.
- If joins is provided, it overrides inference from localKey/foreignKeyOnTarget/through.

Example multi-hop

relations: {
organization: {
relationName: "organization",
target: () => organizations,
cardinality: "one",
direction: "inverse",
joins: [
{ table: "authors", sourceColumn: "posts.author_id", targetColumn: "authors.id" },
{ table: "organizations", sourceColumn: "authors.org_id", targetColumn: "organizations.id" }
]
}
}

Then lookupProperty({ relation: "organization", pick: "name" }) will add those joins.

6) Read/write behavior
- referenceProperty on owning side writes localKey
- referenceArrayProperty with through updates the junction rows
- inverse relations are read-only at field level; editable via subcollection UI or through the owning relation
- validation.required plugs into the property builder

7) Migrations and onDelete/onUpdate
- onDelete/onUpdate in relation can be used by your migration/generator to emit FK constraints and actions.
- At runtime, they can be displayed as hints and optionally enforced by UI (e.g., block deleting parent if restrict).

8) Backwards compatibility
- Existing collections keep working.
- Firestore referenceProperty can be adapted internally to map to a SqlRelation-like shape in the SQL provider, but you don’t need to expose that publicly.

Why this works
- One source of truth for relationships at the collection level
- Minimal property API that reads from that source
- Subcollections reused from the same relation metadata
- Clear write semantics via direction/localKey/through
- Supports simple FK, inverse 1:N, many-to-many, and explicit multi-hop joins

If you share your current EntityCollection type, I can give you exact typings for the property builders so they infer target entity type and preview fields from the relation target.
