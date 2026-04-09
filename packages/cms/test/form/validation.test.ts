/**
 * @jest-environment jsdom
 */
import {
    getEntitySchema,
    mapPropertyToZod,
    getZodMapObjectSchema,
} from "../../src/form/validation";
import type { StringProperty, NumberProperty, BooleanProperty, DateProperty, MapProperty, ArrayProperty, ReferenceProperty, RelationProperty, Property, Properties, GeopointProperty } from "@rebasepro/types";

// ---------------------------------------------------------------------------
// String validation
// ---------------------------------------------------------------------------
describe("String property validation", () => {
    it("accepts valid string values", async () => {
        const property: StringProperty = { type: "string", name: "Name" } as StringProperty;
        const schema = mapPropertyToZod({ property });
        const result = await schema.safeParseAsync("hello");
        expect(result.success).toBe(true);
    });

    it("accepts null for optional strings", async () => {
        const property: StringProperty = { type: "string", name: "Name" } as StringProperty;
        const schema = mapPropertyToZod({ property });
        const result = await schema.safeParseAsync(null);
        expect(result.success).toBe(true);
    });

    it("accepts undefined for optional strings", async () => {
        const property: StringProperty = { type: "string", name: "Name" } as StringProperty;
        const schema = mapPropertyToZod({ property });
        const result = await schema.safeParseAsync(undefined);
        expect(result.success).toBe(true);
    });

    it("rejects empty string for required strings", async () => {
        const property: StringProperty = {
            type: "string",
            name: "Name",
            validation: { required: true }
        } as StringProperty;
        const schema = mapPropertyToZod({ property });
        const result = await schema.safeParseAsync("");
        expect(result.success).toBe(false);
    });

    it("rejects null for required strings", async () => {
        const property: StringProperty = {
            type: "string",
            name: "Name",
            validation: { required: true }
        } as StringProperty;
        const schema = mapPropertyToZod({ property });
        const result = await schema.safeParseAsync(null);
        expect(result.success).toBe(false);
    });

    it("uses custom required message", async () => {
        const property: StringProperty = {
            type: "string",
            name: "Name",
            validation: { required: true, requiredMessage: "Please fill this field" }
        } as StringProperty;
        const schema = mapPropertyToZod({ property });
        const result = await schema.safeParseAsync("");
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toBe("Please fill this field");
        }
    });

    it("enforces min length validation", async () => {
        const property: StringProperty = {
            type: "string",
            name: "Name",
            validation: { min: 3 }
        } as StringProperty;
        const schema = mapPropertyToZod({ property });

        const tooShort = await schema.safeParseAsync("ab");
        expect(tooShort.success).toBe(false);

        const justRight = await schema.safeParseAsync("abc");
        expect(justRight.success).toBe(true);
    });

    it("enforces max length validation", async () => {
        const property: StringProperty = {
            type: "string",
            name: "Name",
            validation: { max: 5 }
        } as StringProperty;
        const schema = mapPropertyToZod({ property });

        const tooLong = await schema.safeParseAsync("123456");
        expect(tooLong.success).toBe(false);

        const justRight = await schema.safeParseAsync("12345");
        expect(justRight.success).toBe(true);
    });

    it("enforces regex matches validation", async () => {
        const property: StringProperty = {
            type: "string",
            name: "Code",
            validation: { matches: /^[A-Z]{3}$/ }
        } as StringProperty;
        const schema = mapPropertyToZod({ property });

        const valid = await schema.safeParseAsync("ABC");
        expect(valid.success).toBe(true);

        const invalid = await schema.safeParseAsync("abc");
        expect(invalid.success).toBe(false);
    });

    it("validates email format when property.email is set", async () => {
        const property: StringProperty = {
            type: "string",
            name: "Email",
            email: true,
            validation: {}
        } as unknown as StringProperty;
        const schema = mapPropertyToZod({ property });

        const valid = await schema.safeParseAsync("test@example.com");
        expect(valid.success).toBe(true);

        const invalid = await schema.safeParseAsync("not-an-email");
        expect(invalid.success).toBe(false);
    });

    it("validates URL format when property.url is set", async () => {
        const property: StringProperty = {
            type: "string",
            name: "Website",
            url: true,
            validation: {}
        } as unknown as StringProperty;
        const schema = mapPropertyToZod({ property });

        const valid = await schema.safeParseAsync("https://example.com");
        expect(valid.success).toBe(true);

        const invalid = await schema.safeParseAsync("not a url");
        expect(invalid.success).toBe(false);
    });

    it("validates isId=true fields as required", async () => {
        const property: StringProperty = {
            type: "string",
            name: "ID",
            isId: true,
        } as unknown as StringProperty;
        const schema = mapPropertyToZod({ property });

        const empty = await schema.safeParseAsync("");
        expect(empty.success).toBe(false);

        const valid = await schema.safeParseAsync("my-id");
        expect(valid.success).toBe(true);
    });

    it("validates isId='manual' fields as required", async () => {
        const property: StringProperty = {
            type: "string",
            name: "ID",
            isId: "manual",
        } as unknown as StringProperty;
        const schema = mapPropertyToZod({ property });

        const empty = await schema.safeParseAsync(null);
        expect(empty.success).toBe(false);
    });

    it("allows null for null min values (null passes through)", async () => {
        const property: StringProperty = {
            type: "string",
            name: "Test",
            validation: { min: 3 }
        } as StringProperty;
        const schema = mapPropertyToZod({ property });
        const result = await schema.safeParseAsync(null);
        expect(result.success).toBe(true);
    });

    it("applies trim pre-processing", async () => {
        const property: StringProperty = {
            type: "string",
            name: "Name",
            validation: { trim: true, required: true }
        } as StringProperty;
        const schema = mapPropertyToZod({ property });

        // A whitespace-only value should fail after trimming
        const result = await schema.safeParseAsync("   ");
        expect(result.success).toBe(false);
    });

    it("applies lowercase pre-processing", async () => {
        const property: StringProperty = {
            type: "string",
            name: "code",
            validation: { lowercase: true }
        } as StringProperty;
        const schema = mapPropertyToZod({ property });
        const result = await schema.safeParseAsync("UPPER");
        expect(result.success).toBe(true);
    });

    it("applies uppercase pre-processing", async () => {
        const property: StringProperty = {
            type: "string",
            name: "code",
            validation: { uppercase: true }
        } as StringProperty;
        const schema = mapPropertyToZod({ property });
        const result = await schema.safeParseAsync("lower");
        expect(result.success).toBe(true);
    });

    it("validates enum constraints", async () => {
        const property: StringProperty = {
            type: "string",
            name: "Status",
            enum: [
                { id: "active", label: "Active" },
                { id: "inactive", label: "Inactive" }
            ],
        } as unknown as StringProperty;
        const schema = mapPropertyToZod({ property });

        const valid = await schema.safeParseAsync("active");
        expect(valid.success).toBe(true);

        const invalid = await schema.safeParseAsync("deleted");
        expect(invalid.success).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Number validation
// ---------------------------------------------------------------------------
describe("Number property validation", () => {
    it("accepts valid numbers", async () => {
        const property: NumberProperty = { type: "number", name: "Age" } as NumberProperty;
        const schema = mapPropertyToZod({ property });
        const result = await schema.safeParseAsync(25);
        expect(result.success).toBe(true);
    });

    it("accepts null for optional numbers", async () => {
        const property: NumberProperty = { type: "number", name: "Age" } as NumberProperty;
        const schema = mapPropertyToZod({ property });
        const result = await schema.safeParseAsync(null);
        expect(result.success).toBe(true);
    });

    it("rejects null for required numbers", async () => {
        const property: NumberProperty = {
            type: "number",
            name: "Age",
            validation: { required: true }
        } as NumberProperty;
        const schema = mapPropertyToZod({ property });
        const result = await schema.safeParseAsync(null);
        expect(result.success).toBe(false);
    });

    it("enforces min constraint", async () => {
        const property: NumberProperty = {
            type: "number",
            name: "Age",
            validation: { min: 0 }
        } as NumberProperty;
        const schema = mapPropertyToZod({ property });

        const negative = await schema.safeParseAsync(-1);
        expect(negative.success).toBe(false);

        const zero = await schema.safeParseAsync(0);
        expect(zero.success).toBe(true);
    });

    it("enforces max constraint", async () => {
        const property: NumberProperty = {
            type: "number",
            name: "Score",
            validation: { max: 100 }
        } as NumberProperty;
        const schema = mapPropertyToZod({ property });

        const tooHigh = await schema.safeParseAsync(101);
        expect(tooHigh.success).toBe(false);

        const atMax = await schema.safeParseAsync(100);
        expect(atMax.success).toBe(true);
    });

    it("enforces lessThan constraint", async () => {
        const property: NumberProperty = {
            type: "number",
            name: "Score",
            validation: { lessThan: 10 }
        } as NumberProperty;
        const schema = mapPropertyToZod({ property });

        const atBoundary = await schema.safeParseAsync(10);
        expect(atBoundary.success).toBe(false);

        const below = await schema.safeParseAsync(9);
        expect(below.success).toBe(true);
    });

    it("enforces moreThan constraint", async () => {
        const property: NumberProperty = {
            type: "number",
            name: "Score",
            validation: { moreThan: 0 }
        } as NumberProperty;
        const schema = mapPropertyToZod({ property });

        const atBoundary = await schema.safeParseAsync(0);
        expect(atBoundary.success).toBe(false);

        const above = await schema.safeParseAsync(1);
        expect(above.success).toBe(true);
    });

    it("enforces positive constraint", async () => {
        const property: NumberProperty = {
            type: "number",
            name: "Amount",
            validation: { positive: true }
        } as NumberProperty;
        const schema = mapPropertyToZod({ property });

        const zero = await schema.safeParseAsync(0);
        expect(zero.success).toBe(false);

        const positive = await schema.safeParseAsync(1);
        expect(positive.success).toBe(true);
    });

    it("enforces negative constraint", async () => {
        const property: NumberProperty = {
            type: "number",
            name: "Offset",
            validation: { negative: true }
        } as NumberProperty;
        const schema = mapPropertyToZod({ property });

        const positive = await schema.safeParseAsync(1);
        expect(positive.success).toBe(false);

        const negative = await schema.safeParseAsync(-1);
        expect(negative.success).toBe(true);
    });

    it("enforces integer constraint", async () => {
        const property: NumberProperty = {
            type: "number",
            name: "Count",
            validation: { integer: true }
        } as NumberProperty;
        const schema = mapPropertyToZod({ property });

        const decimal = await schema.safeParseAsync(1.5);
        expect(decimal.success).toBe(false);

        const integer = await schema.safeParseAsync(2);
        expect(integer.success).toBe(true);
    });

    it("coerces string numbers", async () => {
        const property: NumberProperty = { type: "number", name: "Age" } as NumberProperty;
        const schema = mapPropertyToZod({ property });
        const result = await schema.safeParseAsync("42");
        expect(result.success).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// Boolean validation
// ---------------------------------------------------------------------------
describe("Boolean property validation", () => {
    it("accepts boolean values", async () => {
        const property: BooleanProperty = { type: "boolean", name: "Active" } as BooleanProperty;
        const schema = mapPropertyToZod({ property });

        expect((await schema.safeParseAsync(true)).success).toBe(true);
        expect((await schema.safeParseAsync(false)).success).toBe(true);
    });

    it("accepts null for optional booleans", async () => {
        const property: BooleanProperty = { type: "boolean", name: "Active" } as BooleanProperty;
        const schema = mapPropertyToZod({ property });
        const result = await schema.safeParseAsync(null);
        expect(result.success).toBe(true);
    });

    it("rejects null for required booleans", async () => {
        const property: BooleanProperty = {
            type: "boolean",
            name: "Active",
            validation: { required: true }
        } as BooleanProperty;
        const schema = mapPropertyToZod({ property });
        const result = await schema.safeParseAsync(null);
        expect(result.success).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Date validation
// ---------------------------------------------------------------------------
describe("Date property validation", () => {
    it("accepts Date objects", async () => {
        const property: DateProperty = { type: "date", name: "Created" } as DateProperty;
        const schema = mapPropertyToZod({ property });
        const result = await schema.safeParseAsync(new Date());
        expect(result.success).toBe(true);
    });

    it("accepts null for optional dates", async () => {
        const property: DateProperty = { type: "date", name: "Created" } as DateProperty;
        const schema = mapPropertyToZod({ property });
        const result = await schema.safeParseAsync(null);
        expect(result.success).toBe(true);
    });

    it("rejects null for required dates", async () => {
        const property: DateProperty = {
            type: "date",
            name: "Created",
            validation: { required: true }
        } as DateProperty;
        const schema = mapPropertyToZod({ property });
        const result = await schema.safeParseAsync(null);
        expect(result.success).toBe(false);
    });

    it("skips validation for autoValue dates", async () => {
        const property: DateProperty = {
            type: "date",
            name: "Updated",
            autoValue: "on_create"
        } as DateProperty;
        const schema = mapPropertyToZod({ property });
        // autoValue fields always pass
        const result = await schema.safeParseAsync(null);
        expect(result.success).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// Map/Object validation
// ---------------------------------------------------------------------------
describe("Map property validation", () => {
    it("validates nested properties", async () => {
        const property: MapProperty = {
            type: "map",
            name: "Address",
            properties: {
                street: {
                    type: "string",
                    name: "Street",
                    validation: { required: true }
                } as StringProperty,
                city: {
                    type: "string",
                    name: "City"
                } as StringProperty
            }
        } as MapProperty;

        const schema = mapPropertyToZod({ property });

        const valid = await schema.safeParseAsync({ street: "123 Main St", city: "NYC" });
        expect(valid.success).toBe(true);

        const invalid = await schema.safeParseAsync({ street: "", city: "NYC" });
        expect(invalid.success).toBe(false);
    });

    it("accepts null for optional maps", async () => {
        const property: MapProperty = {
            type: "map",
            name: "Meta",
            properties: {
                key: { type: "string", name: "Key" } as StringProperty
            }
        } as MapProperty;

        const schema = mapPropertyToZod({ property });
        const result = await schema.safeParseAsync(null);
        expect(result.success).toBe(true);
    });

    it("rejects undefined for required maps", async () => {
        const property: MapProperty = {
            type: "map",
            name: "Meta",
            properties: {},
            validation: { required: true }
        } as MapProperty;

        const schema = mapPropertyToZod({ property });
        const result = await schema.safeParseAsync(undefined);
        expect(result.success).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Array validation
// ---------------------------------------------------------------------------
describe("Array property validation", () => {
    it("accepts valid arrays", async () => {
        const property: ArrayProperty = {
            type: "array",
            name: "Tags",
            of: { type: "string", name: "Tag" } as StringProperty
        } as ArrayProperty;

        const schema = mapPropertyToZod({ property });
        const result = await schema.safeParseAsync(["tag1", "tag2"]);
        expect(result.success).toBe(true);
    });

    it("accepts null for optional arrays", async () => {
        const property: ArrayProperty = {
            type: "array",
            name: "Tags",
            of: { type: "string", name: "Tag" } as StringProperty
        } as ArrayProperty;

        const schema = mapPropertyToZod({ property });
        const result = await schema.safeParseAsync(null);
        expect(result.success).toBe(true);
    });

    it("rejects empty arrays for required arrays", async () => {
        const property: ArrayProperty = {
            type: "array",
            name: "Tags",
            of: { type: "string", name: "Tag" } as StringProperty,
            validation: { required: true }
        } as ArrayProperty;

        const schema = mapPropertyToZod({ property });

        const empty = await schema.safeParseAsync([]);
        expect(empty.success).toBe(false);

        const withItems = await schema.safeParseAsync(["tag1"]);
        expect(withItems.success).toBe(true);
    });

    it("enforces min length", async () => {
        const property: ArrayProperty = {
            type: "array",
            name: "Tags",
            of: { type: "string", name: "Tag" } as StringProperty,
            validation: { min: 2 }
        } as ArrayProperty;

        const schema = mapPropertyToZod({ property });

        const tooFew = await schema.safeParseAsync(["one"]);
        expect(tooFew.success).toBe(false);

        const enough = await schema.safeParseAsync(["one", "two"]);
        expect(enough.success).toBe(true);
    });

    it("enforces max length", async () => {
        const property: ArrayProperty = {
            type: "array",
            name: "Tags",
            of: { type: "string", name: "Tag" } as StringProperty,
            validation: { max: 2 }
        } as ArrayProperty;

        const schema = mapPropertyToZod({ property });

        const tooMany = await schema.safeParseAsync(["a", "b", "c"]);
        expect(tooMany.success).toBe(false);

        const ok = await schema.safeParseAsync(["a", "b"]);
        expect(ok.success).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// Reference validation
// ---------------------------------------------------------------------------
describe("Reference property validation", () => {
    it("accepts object references", async () => {
        const property: ReferenceProperty = {
            type: "reference",
            name: "Author",
            path: "users"
        } as ReferenceProperty;

        const schema = mapPropertyToZod({ property });
        const result = await schema.safeParseAsync({ id: "abc", path: "users" });
        expect(result.success).toBe(true);
    });

    it("accepts null for optional references", async () => {
        const property: ReferenceProperty = {
            type: "reference",
            name: "Author",
            path: "users"
        } as ReferenceProperty;

        const schema = mapPropertyToZod({ property });
        const result = await schema.safeParseAsync(null);
        expect(result.success).toBe(true);
    });

    it("rejects null for required references", async () => {
        const property: ReferenceProperty = {
            type: "reference",
            name: "Author",
            path: "users",
            validation: { required: true }
        } as ReferenceProperty;

        const schema = mapPropertyToZod({ property });
        const result = await schema.safeParseAsync(null);
        expect(result.success).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Relation validation
// ---------------------------------------------------------------------------
describe("Relation property validation", () => {
    it("accepts null for optional relations", async () => {
        const property: RelationProperty = {
            type: "relation",
            name: "Tags",
        } as RelationProperty;

        const schema = mapPropertyToZod({ property });
        const result = await schema.safeParseAsync(null);
        expect(result.success).toBe(true);
    });

    it("rejects null for required one-to-one relations", async () => {
        const property: RelationProperty = {
            type: "relation",
            name: "Category",
            validation: { required: true }
        } as RelationProperty;

        const schema = mapPropertyToZod({ property });
        const result = await schema.safeParseAsync(null);
        expect(result.success).toBe(false);
    });

    it("rejects empty array for required many-cardinality relations", async () => {
        const property: RelationProperty = {
            type: "relation",
            name: "Categories",
            relation: { cardinality: "many" },
            validation: { required: true }
        } as unknown as RelationProperty;

        const schema = mapPropertyToZod({ property });

        const empty = await schema.safeParseAsync([]);
        expect(empty.success).toBe(false);

        const withItems = await schema.safeParseAsync([{ id: "1" }]);
        expect(withItems.success).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// GeoPoint validation
// ---------------------------------------------------------------------------
describe("GeoPoint property validation", () => {
    it("accepts geopoint objects", async () => {
        const property: GeopointProperty = {
            type: "geopoint",
            name: "Location"
        } as GeopointProperty;

        const schema = mapPropertyToZod({ property });
        const result = await schema.safeParseAsync({ lat: 40.7, lng: -74.0 });
        expect(result.success).toBe(true);
    });

    it("accepts null for optional geopoints", async () => {
        const property: GeopointProperty = {
            type: "geopoint",
            name: "Location"
        } as GeopointProperty;

        const schema = mapPropertyToZod({ property });
        const result = await schema.safeParseAsync(null);
        expect(result.success).toBe(true);
    });

    it("rejects null for required geopoints", async () => {
        const property: GeopointProperty = {
            type: "geopoint",
            name: "Location",
            validation: { required: true }
        } as GeopointProperty;

        const schema = mapPropertyToZod({ property });
        const result = await schema.safeParseAsync(null);
        expect(result.success).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// getEntitySchema (composite)
// ---------------------------------------------------------------------------
describe("getEntitySchema", () => {
    it("creates a schema from multiple properties and validates", async () => {
        const properties: Properties = {
            title: {
                type: "string",
                name: "Title",
                validation: { required: true }
            } as StringProperty,
            count: {
                type: "number",
                name: "Count",
                validation: { min: 0 }
            } as NumberProperty,
            active: {
                type: "boolean",
                name: "Active"
            } as BooleanProperty,
        };

        const schema = getEntitySchema("entity1", properties);

        const valid = await schema.safeParseAsync({ title: "Hello", count: 5, active: true });
        expect(valid.success).toBe(true);

        const invalid = await schema.safeParseAsync({ title: "", count: -1, active: true });
        expect(invalid.success).toBe(false);
    });

    it("skips auto-generated id fields for new entities", async () => {
        const properties: Properties = {
            id: {
                type: "string",
                name: "ID",
                isId: "uuid",
            } as unknown as Property,
            title: {
                type: "string",
                name: "Title",
            } as StringProperty,
        };

        // For new entities (entityId undefined), auto-id fields are skipped entirely
        const schema = getEntitySchema(undefined, properties);
        const result = await schema.safeParseAsync({ title: "Test" });
        expect(result.success).toBe(true);
    });

    it("validates id field for existing entities", async () => {
        const properties: Properties = {
            id: {
                type: "string",
                name: "ID",
                isId: true,
            } as unknown as Property,
            title: {
                type: "string",
                name: "Title",
            } as StringProperty,
        };

        // For existing entities, id is required since isId=true
        const schema = getEntitySchema("existing-entity", properties);
        const result = await schema.safeParseAsync({ id: "", title: "Test" });
        expect(result.success).toBe(false);
    });

    it("passes through extra properties via passthrough()", async () => {
        const properties: Properties = {
            title: { type: "string", name: "Title" } as StringProperty,
        };

        const schema = getEntitySchema("e1", properties);
        const result = await schema.safeParseAsync({ title: "Hello", extra: "world" });
        expect(result.success).toBe(true);
    });
});
