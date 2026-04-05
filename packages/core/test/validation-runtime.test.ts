/**
 * Runtime integration tests for the zod validation layer.
 *
 * These tests exercise the EXACT code paths used at runtime by:
 *   - EntityForm (validation callback → safeParseAsync → zodToFormErrors)
 *   - PopupFormField (same pattern)
 *   - PropertyTableCell (mapPropertyToZod → safeParseAsync inline)
 *
 * The goal is to catch any zod-specific behavior that differs from the
 * previous yup implementation and could cause silent runtime errors,
 * broken form submissions, or missing/misplaced error messages.
 */

import { z } from "zod";
import { getIn, setIn } from "@rebasepro/formex";
import {
    getEntitySchema,
    mapPropertyToZod,
    CustomFieldValidator
} from "../src/form/validation";
import { zodToFormErrors } from "../src/form/EntityForm";
import {
    Property,
    Properties,
    StringProperty,
    NumberProperty,
    BooleanProperty,
    DateProperty,
    ArrayProperty,
    MapProperty,
    ReferenceProperty,
    RelationProperty,
    Relation,
    EntityReference
} from "@rebasepro/types";

// ============================================================================
// HELPERS
// ============================================================================

function str(overrides: Partial<StringProperty> = {}): StringProperty {
    return { type: "string", ...overrides } as StringProperty;
}
function num(overrides: Partial<NumberProperty> = {}): NumberProperty {
    return { type: "number", ...overrides } as NumberProperty;
}
function bool(overrides: Partial<BooleanProperty> = {}): BooleanProperty {
    return { type: "boolean", ...overrides } as BooleanProperty;
}
function date(overrides: Partial<DateProperty> = {}): DateProperty {
    return { type: "date", ...overrides } as DateProperty;
}
function arr(of: Property, overrides: Partial<ArrayProperty> = {}): ArrayProperty {
    return { type: "array", of, ...overrides } as ArrayProperty;
}
function map(properties: Properties, overrides: Partial<MapProperty> = {}): MapProperty {
    return { type: "map", properties, ...overrides } as MapProperty;
}
function ref(path: string, overrides: Partial<ReferenceProperty> = {}): ReferenceProperty {
    return { type: "reference", path, ...overrides } as ReferenceProperty;
}
function rel(overrides: Partial<RelationProperty> = {}): RelationProperty {
    return { type: "relation", ...overrides } as RelationProperty;
}

/**
 * Simulates the exact validation callback used by EntityForm and PopupFormField.
 * This is the most critical runtime path.
 */
async function runFormValidation(
    properties: Properties,
    values: Record<string, unknown>,
    entityId?: string | number,
    customFieldValidator?: CustomFieldValidator
): Promise<Record<string, unknown>> {
    const schema = getEntitySchema(entityId ?? "test-entity", properties, customFieldValidator);
    const result = await schema.safeParseAsync(values);
    if (result.success) return {};
    return zodToFormErrors(result.error);
}

/**
 * Simulates the exact validation used by PropertyTableCell for inline editing.
 * mapPropertyToZod → safeParseAsync → check result
 */
async function runCellValidation(
    property: Property,
    value: unknown,
    entityId?: string | number
): Promise<{ success: boolean; error?: z.ZodError }> {
    const schema = mapPropertyToZod({ property, entityId: entityId ?? "test-entity" });
    const result = await schema.safeParseAsync(value);
    return result.success ? { success: true } : { success: false, error: result.error };
}

// ============================================================================
// 1. zodToFormErrors — ERROR FORMAT CORRECTNESS
//    These tests ensure errors are placed at the correct path so PropertyFieldBinding shows them.
// ============================================================================

describe("zodToFormErrors — error path mapping", () => {

    it("should map a top-level field error to a flat key", async () => {
        const errors = await runFormValidation(
            { title: str({ validation: { required: true } }) },
            { title: "" }
        );
        expect(errors).toHaveProperty("title");
        expect(typeof errors.title).toBe("string");
    });

    it("should map nested map field errors to dotted paths", async () => {
        const errors = await runFormValidation(
            {
                address: map({
                    street: str({ validation: { required: true } }),
                    city: str({ validation: { required: true } })
                })
            },
            { address: { street: "", city: "" } }
        );
        expect(errors).toHaveProperty("address.street");
        expect(errors).toHaveProperty("address.city");
    });

    it("should map deeply nested map errors (3 levels)", async () => {
        const errors = await runFormValidation(
            {
                level1: map({
                    level2: map({
                        level3: str({ validation: { required: true } })
                    })
                })
            },
            { level1: { level2: { level3: "" } } }
        );
        expect(errors).toHaveProperty("level1.level2.level3");
    });

    it("should map array item errors to indexed paths", async () => {
        const errors = await runFormValidation(
            { tags: arr(str({ validation: { min: 3 } })) },
            { tags: ["ok123", "x"] }
        );
        // The second item "x" should fail min: 3
        expect(errors).toHaveProperty("tags.1");
    });

    it("should return empty object when all fields are valid", async () => {
        const errors = await runFormValidation(
            {
                name: str({ validation: { required: true } }),
                age: num({ validation: { min: 0 } })
            },
            { name: "John", age: 25 }
        );
        expect(errors).toEqual({});
    });

    it("should not overwrite earlier errors at the same path", async () => {
        // A field with multiple refines. zodToFormErrors should keep the first error only.
        const errors = await runFormValidation(
            { username: str({ validation: { required: true, min: 5 } }) },
            { username: "" }
        );
        // Should have one error at "username", not be overwritten
        expect(errors).toHaveProperty("username");
        expect(typeof errors.username).toBe("string");
    });

    it("should handle multiple fields with errors simultaneously", async () => {
        const errors = await runFormValidation(
            {
                title: str({ validation: { required: true } }),
                count: num({ validation: { required: true } }),
                active: bool({ validation: { required: true } })
            },
            { title: "", count: null, active: null }
        );
        expect(Object.keys(errors).length).toBeGreaterThanOrEqual(3);
        expect(errors).toHaveProperty("title");
        expect(errors).toHaveProperty("count");
        expect(errors).toHaveProperty("active");
    });
});

// ============================================================================
// 2. safeParseAsync CONTRACT
//    These tests verify safeParseAsync never throws (critical for form stability).
// ============================================================================

describe("safeParseAsync — never throws", () => {

    const dangerousInputs = [
        undefined,
        null,
        0,
        "",
        false,
        NaN,
        Infinity,
        -Infinity,
        [],
        {},
        Symbol("test"),
        () => {},
        new Date("invalid"),
        /regex/,
        Promise.resolve("async"),
        new Error("error"),
    ];

    it.each(dangerousInputs)(
        "should not throw when validating entity schema with input: %p",
        async (input) => {
            const schema = getEntitySchema("test-entity", {
                title: str({ validation: { required: true } })
            });
            // The whole point: safeParseAsync must NEVER throw
            const result = await schema.safeParseAsync(input);
            expect(result).toBeDefined();
            expect(typeof result.success).toBe("boolean");
        }
    );

    it("should not throw when validating a string property with non-string input", async () => {
        const result = await runCellValidation(
            str({ validation: { required: true } }),
            12345
        );
        // Should fail validation but not crash
        expect(result).toBeDefined();
    });

    it("should not throw when validating a number property with a string", async () => {
        const result = await runCellValidation(
            num({ validation: { min: 0 } }),
            "not-a-number"
        );
        expect(result.success).toBe(false);
    });

    it("should not throw when validating a date property with a random object", async () => {
        const result = await runCellValidation(
            date(),
            { foo: "bar" }
        );
        expect(result.success).toBe(false);
    });

    it("should not throw when validating a boolean property with a number", async () => {
        const result = await runCellValidation(
            bool(),
            42
        );
        expect(result.success).toBe(false);
    });
});

// ============================================================================
// 3. PASSTHROUGH BEHAVIOR
//    getEntitySchema must NOT strip extra keys from entity values.
//    This is critical: entity values often contain keys not in the schema
//    (computed fields, metadata, etc.)
// ============================================================================

describe("Entity schema passthrough", () => {

    it("should preserve extra keys not defined in properties", async () => {
        const schema = getEntitySchema("test-entity", {
            title: str()
        });
        const result = await schema.safeParseAsync({
            title: "hello",
            _metadata: { source: "api" },
            createdAt: new Date()
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.title).toBe("hello");
            expect(result.data._metadata).toEqual({ source: "api" });
            expect(result.data.createdAt).toBeInstanceOf(Date);
        }
    });

    it("should preserve unknown nested keys in map properties", async () => {
        const schema = getEntitySchema("test-entity", {
            profile: map({ name: str() })
        });
        const result = await schema.safeParseAsync({
            profile: { name: "John", avatar: "url", extra: 42 }
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.profile.avatar).toBe("url");
            expect(result.data.profile.extra).toBe(42);
        }
    });
});

// ============================================================================
// 4. NULL / UNDEFINED HANDLING
//    Forms extensively use null (empty field) and undefined (field not yet set).
//    Each property type must handle these correctly without crashing.
// ============================================================================

describe("Null and undefined handling across all property types", () => {

    const propertyTypes: [string, Property][] = [
        ["string", str()],
        ["number", num()],
        ["boolean", bool()],
        ["date", date()],
        ["map", map({ child: str() })],
        ["array", arr(str())],
        ["reference", ref("users")],
        ["geopoint", { type: "geopoint" } as Property],
    ];

    describe.each(propertyTypes)("%s property", (typeName, property) => {
        it("should accept null when not required", async () => {
            const result = await runCellValidation(property, null);
            expect(result.success).toBe(true);
        });

        it("should not crash on undefined when not required", async () => {
            const result = await runCellValidation(property, undefined);
            // Different types may accept or reject undefined, but must never crash
            expect(result).toBeDefined();
        });
    });

    it("string: null should pass through as null (not coerced to '')", async () => {
        const schema = mapPropertyToZod({ property: str(), entityId: "e" });
        const result = await schema.safeParseAsync(null);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toBeNull();
        }
    });

    it("number: null should pass through as null (not coerced to 0)", async () => {
        const schema = mapPropertyToZod({ property: num(), entityId: "e" });
        const result = await schema.safeParseAsync(null);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toBeNull();
        }
    });

    it("boolean: null should pass through as null (not false)", async () => {
        const schema = mapPropertyToZod({ property: bool(), entityId: "e" });
        const result = await schema.safeParseAsync(null);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toBeNull();
        }
    });
});

// ============================================================================
// 5. REQUIRED VALIDATION — EXACT BEHAVIOR
//    These tests verify the exact values that trigger "required" failures.
// ============================================================================

describe("Required validation — exact trigger values", () => {

    it("string required: rejects null, undefined, and empty string", async () => {
        const schema = mapPropertyToZod({ property: str({ validation: { required: true } }), entityId: "e" });
        expect((await schema.safeParseAsync(null)).success).toBe(false);
        expect((await schema.safeParseAsync(undefined)).success).toBe(false);
        expect((await schema.safeParseAsync("")).success).toBe(false);
        expect((await schema.safeParseAsync("valid")).success).toBe(true);
    });

    it("number required: rejects null and undefined, accepts 0", async () => {
        const schema = mapPropertyToZod({ property: num({ validation: { required: true } }), entityId: "e" });
        expect((await schema.safeParseAsync(null)).success).toBe(false);
        expect((await schema.safeParseAsync(undefined)).success).toBe(false);
        expect((await schema.safeParseAsync(0)).success).toBe(true);
    });

    it("boolean required: rejects null, accepts false", async () => {
        const schema = mapPropertyToZod({ property: bool({ validation: { required: true } }), entityId: "e" });
        expect((await schema.safeParseAsync(null)).success).toBe(false);
        expect((await schema.safeParseAsync(false)).success).toBe(true);
        expect((await schema.safeParseAsync(true)).success).toBe(true);
    });

    it("date required: rejects null, accepts valid Date", async () => {
        const schema = mapPropertyToZod({ property: date({ validation: { required: true } }), entityId: "e" });
        expect((await schema.safeParseAsync(null)).success).toBe(false);
        expect((await schema.safeParseAsync(new Date())).success).toBe(true);
    });

    it("array required: rejects null and empty array", async () => {
        const schema = mapPropertyToZod({
            property: arr(str(), { validation: { required: true } }),
            entityId: "e"
        });
        expect((await schema.safeParseAsync(null)).success).toBe(false);
        expect((await schema.safeParseAsync([])).success).toBe(false);
        expect((await schema.safeParseAsync(["item"])).success).toBe(true);
    });

    it("reference required: rejects null", async () => {
        const schema = mapPropertyToZod({
            property: ref("users", { validation: { required: true } }),
            entityId: "e"
        });
        expect((await schema.safeParseAsync(null)).success).toBe(false);
        expect((await schema.safeParseAsync({ id: "u1", path: "users" })).success).toBe(true);
    });

    it("relation many required: rejects null and empty array", async () => {
        const schema = mapPropertyToZod({
            property: rel({ relation: { cardinality: "many" } as Partial<Relation> as Relation, validation: { required: true } }),
            entityId: "e"
        });
        expect((await schema.safeParseAsync(null)).success).toBe(false);
        expect((await schema.safeParseAsync([])).success).toBe(false);
        expect((await schema.safeParseAsync([{ id: 1 }])).success).toBe(true);
    });
});

// ============================================================================
// 6. CUSTOM REQUIRED MESSAGES
//    Ensures custom requiredMessage shows up in zodToFormErrors output.
// ============================================================================

describe("Custom required messages in form errors", () => {

    it("should propagate custom requiredMessage for string fields", async () => {
        const errors = await runFormValidation(
            { title: str({ validation: { required: true, requiredMessage: "Title is mandatory" } }) },
            { title: "" }
        );
        expect(errors.title).toBe("Title is mandatory");
    });

    it("should propagate custom requiredMessage for number fields", async () => {
        const errors = await runFormValidation(
            { count: num({ validation: { required: true, requiredMessage: "Count cannot be empty" } }) },
            { count: null }
        );
        expect(errors.count).toBe("Count cannot be empty");
    });

    it("should propagate custom requiredMessage for date fields", async () => {
        const errors = await runFormValidation(
            { startDate: date({ validation: { required: true, requiredMessage: "Please pick a date" } }) },
            { startDate: null }
        );
        expect(errors.startDate).toBe("Please pick a date");
    });
});

// ============================================================================
// 7. ENUM VALIDATION
//    Enum fields are common in table cells and forms.
// ============================================================================

describe("Enum validation runtime behavior", () => {

    it("string enum: accepts valid enum values", async () => {
        const result = await runCellValidation(
            str({ enum: [{ id: "draft", label: "D" }, { id: "published", label: "P" }] }),
            "draft"
        );
        expect(result.success).toBe(true);
    });

    it("string enum: rejects invalid values", async () => {
        const result = await runCellValidation(
            str({ enum: [{ id: "draft", label: "D" }, { id: "published", label: "P" }] }),
            "invalid"
        );
        expect(result.success).toBe(false);
    });

    it("string enum: accepts null when not required", async () => {
        const result = await runCellValidation(
            str({ enum: [{ id: "a", label: "A" }] }),
            null
        );
        expect(result.success).toBe(true);
    });

    it("string enum required: rejects null", async () => {
        const result = await runCellValidation(
            str({ enum: [{ id: "a", label: "A" }], validation: { required: true } }),
            null
        );
        expect(result.success).toBe(false);
    });

    it("string enum required: rejects empty string", async () => {
        const result = await runCellValidation(
            str({ enum: [{ id: "a", label: "A" }], validation: { required: true } }),
            ""
        );
        expect(result.success).toBe(false);
    });
});

// ============================================================================
// 8. PROPERTY TABLE CELL SIMULATION
//    PropertyTableCell validates individual values via mapPropertyToZod + safeParseAsync.
//    It assigns result.error directly to setValidationError(result.error).
//    The error must be a valid ZodError instance (not undefined, not null).
// ============================================================================

describe("PropertyTableCell validation simulation", () => {

    it("should return a ZodError instance on failure", async () => {
        const result = await runCellValidation(
            str({ validation: { required: true } }),
            ""
        );
        expect(result.success).toBe(false);
        expect(result.error).toBeInstanceOf(z.ZodError);
        expect(result.error!.issues.length).toBeGreaterThan(0);
    });

    it("should return success: true with no error on valid input", async () => {
        const result = await runCellValidation(
            str({ validation: { required: true } }),
            "valid"
        );
        expect(result.success).toBe(true);
        expect(result.error).toBeUndefined();
    });

    it("should validate number in table cell correctly", async () => {
        const successResult = await runCellValidation(
            num({ validation: { min: 0, max: 100 } }),
            50
        );
        expect(successResult.success).toBe(true);

        const failResult = await runCellValidation(
            num({ validation: { min: 0, max: 100 } }),
            -1
        );
        expect(failResult.success).toBe(false);
    });

    it("should validate boolean toggle in table cell", async () => {
        const trueResult = await runCellValidation(bool(), true);
        expect(trueResult.success).toBe(true);

        const falseResult = await runCellValidation(bool(), false);
        expect(falseResult.success).toBe(true);

        const nullResult = await runCellValidation(bool(), null);
        expect(nullResult.success).toBe(true);
    });

    it("should validate date picker in table cell", async () => {
        const validResult = await runCellValidation(date(), new Date());
        expect(validResult.success).toBe(true);

        const nullResult = await runCellValidation(date(), null);
        expect(nullResult.success).toBe(true);

        const stringResult = await runCellValidation(date(), "2024-01-01");
        expect(stringResult.success).toBe(false);
    });

    it("should validate reference selector in table cell", async () => {
        const validResult = await runCellValidation(
            ref("products"),
            { id: "prod1", path: "products" }
        );
        expect(validResult.success).toBe(true);

        const nullResult = await runCellValidation(ref("products"), null);
        expect(nullResult.success).toBe(true);
    });
});

// ============================================================================
// 9. ASYNC CUSTOM FIELD VALIDATOR (unique fields)
//    The uniqueFieldValidator is async and makes DB queries.
//    Tests ensure the schema correctly awaits and handles it.
// ============================================================================

describe("Async custom field validator", () => {

    it("should pass when validator returns true (field is unique)", async () => {
        const validator: CustomFieldValidator = jest.fn().mockResolvedValue(true);
        const errors = await runFormValidation(
            { slug: str({ validation: { unique: true } }) },
            { slug: "unique-value" },
            "test-entity",
            validator
        );
        expect(errors).toEqual({});
        expect(validator).toHaveBeenCalled();
    });

    it("should fail with correct error when validator returns false", async () => {
        const validator: CustomFieldValidator = jest.fn().mockResolvedValue(false);
        const errors = await runFormValidation(
            { slug: str({ validation: { unique: true } }) },
            { slug: "duplicate-slug" },
            "test-entity",
            validator
        );
        expect(errors.slug).toContain("unique");
    });

    it("should pass validator arguments correctly", async () => {
        const validator: CustomFieldValidator = jest.fn().mockResolvedValue(true);
        await runFormValidation(
            { slug: str({ validation: { unique: true } }) },
            { slug: "test-value" },
            "entity-42",
            validator
        );
        expect(validator).toHaveBeenCalledWith(
            expect.objectContaining({
                name: "slug",
                value: "test-value",
                entityId: "entity-42"
            })
        );
    });

    it("should still work when validator is not provided for unique: true", async () => {
        // This is an edge case: unique: true but no customFieldValidator passed.
        // It should NOT crash. The refine is only added when customFieldValidator is truthy.
        const errors = await runFormValidation(
            { slug: str({ validation: { unique: true } }) },
            { slug: "any-value" },
            "test-entity"
            // no validator
        );
        expect(errors).toEqual({});
    });
});

// ============================================================================
// 10. STRING TRANSFORMS (trim, lowercase, uppercase)
//     These must run BEFORE validation refines (matches, min, max).
// ============================================================================

describe("String transforms execute before validation", () => {

    it("trim should happen before min length check", async () => {
        const schema = mapPropertyToZod({
            property: str({ validation: { trim: true, min: 3 } }),
            entityId: "e"
        });
        // "  ab  " → trimmed to "ab" → fails min: 3
        const result = await schema.safeParseAsync("  ab  ");
        expect(result.success).toBe(false);

        // "  abc  " → trimmed to "abc" → passes min: 3
        const result2 = await schema.safeParseAsync("  abc  ");
        expect(result2.success).toBe(true);
    });

    it("lowercase should happen before matches check", async () => {
        const schema = mapPropertyToZod({
            property: str({ validation: { lowercase: true, matches: /^[a-z]+$/ } }),
            entityId: "e"
        });
        // "HELLO" → lowercased to "hello" → passes /^[a-z]+$/
        const result = await schema.safeParseAsync("HELLO");
        expect(result.success).toBe(true);
    });

    it("uppercase should happen before matches check", async () => {
        const schema = mapPropertyToZod({
            property: str({ validation: { uppercase: true, matches: /^[A-Z]+$/ } }),
            entityId: "e"
        });
        // "hello" → uppercased to "HELLO" → passes /^[A-Z]+$/
        const result = await schema.safeParseAsync("hello");
        expect(result.success).toBe(true);
    });

    it("trim + lowercase combined", async () => {
        const schema = mapPropertyToZod({
            property: str({ validation: { trim: true, lowercase: true, matches: /^[a-z]+$/ } }),
            entityId: "e"
        });
        const result = await schema.safeParseAsync("  HeLLo  ");
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toBe("hello");
        }
    });

    it("transforms should produce correct output through parseAsync", async () => {
        const schema = mapPropertyToZod({
            property: str({ validation: { trim: true, lowercase: true } }),
            entityId: "e"
        });
        const result = await schema.parseAsync("  Hello World  ");
        expect(result).toBe("hello world");
    });
});

// ============================================================================
// 11. FULL ENTITY FORM SIMULATION
//     Simulates a realistic entity with multiple property types, some optional.
// ============================================================================

describe("Full entity form validation simulation", () => {

    const blogPostProperties: Properties = {
        title: str({ name: "Title", validation: { required: true, min: 3, max: 200 } }),
        slug: str({ name: "Slug", validation: { required: true, matches: /^[a-z0-9-]+$/, matchesMessage: "Must be URL-safe" } }),
        content: str({ name: "Content", validation: { max: 50000 } }),
        status: str({
            name: "Status",
            enum: [
                { id: "draft", label: "Draft" },
                { id: "published", label: "Published" },
                { id: "archived", label: "Archived" }
            ],
            validation: { required: true }
        }),
        publishedAt: date({ name: "Published At" }),
        viewCount: num({ name: "View Count", validation: { min: 0, integer: true } }),
        featured: bool({ name: "Featured" }),
        tags: arr(str(), { name: "Tags", validation: { max: 10 } }),
        author: map({
            name: str({ name: "Name", validation: { required: true } }),
            email: str({ name: "Email", email: true, validation: {} }),
            avatar: str({ name: "Avatar", url: true, validation: {} })
        }),
        category: ref("categories"),
    };

    it("should pass with valid complete data", async () => {
        const errors = await runFormValidation(blogPostProperties, {
            title: "My Blog Post",
            slug: "my-blog-post",
            content: "Hello world",
            status: "published",
            publishedAt: new Date(),
            viewCount: 42,
            featured: true,
            tags: ["tech", "web"],
            author: {
                name: "John Doe",
                email: "john@example.com",
                avatar: "https://example.com/avatar.jpg"
            },
            category: { id: "cat1", path: "categories" }
        });
        expect(errors).toEqual({});
    });

    it("should pass with sparse data (optional fields null)", async () => {
        const errors = await runFormValidation(blogPostProperties, {
            title: "Minimal Post",
            slug: "minimal-post",
            status: "draft",
            content: null,
            publishedAt: null,
            viewCount: null,
            featured: null,
            tags: null,
            author: null,
            category: null
        });
        expect(errors).toEqual({});
    });

    it("should return multiple errors for invalid data", async () => {
        const errors = await runFormValidation(blogPostProperties, {
            title: "",          // required
            slug: "INVALID!",   // matches fails
            status: "unknown",  // invalid enum
            viewCount: -5,      // min: 0
            tags: null,
            author: { name: "", email: "not-email", avatar: "not-url" },
            category: null
        });
        expect(errors).toHaveProperty("title");
        expect(errors).toHaveProperty("slug");
        expect(errors.slug).toBe("Must be URL-safe");
        expect(errors).toHaveProperty("status");
        expect(errors).toHaveProperty("viewCount");
        expect(errors).toHaveProperty("author.name");
        expect(errors).toHaveProperty("author.email");
        expect(errors).toHaveProperty("author.avatar");
    });

    it("should handle extra properties in entity values (passthrough)", async () => {
        const errors = await runFormValidation(blogPostProperties, {
            title: "Valid",
            slug: "valid",
            status: "draft",
            content: null,
            publishedAt: null,
            viewCount: null,
            featured: null,
            tags: null,
            author: null,
            category: null,
            _internal_id: "abc123",       // extra field
            computed_score: 0.95,          // extra field
            __v: 3                         // extra field
        });
        expect(errors).toEqual({});
    });
});

// ============================================================================
// 12. ARRAY EDGE CASES
//     Arrays with uniqueInArray, nested maps, and mixed types.
// ============================================================================

describe("Array runtime edge cases", () => {

    it("should validate uniqueInArray for primitive arrays", async () => {
        const schema = mapPropertyToZod({
            property: arr(str({ validation: { uniqueInArray: true } }), { name: "Tags" }),
            entityId: "e"
        });
        expect((await schema.safeParseAsync(["a", "b", "c"])).success).toBe(true);
        expect((await schema.safeParseAsync(["a", "b", "a"])).success).toBe(false);
    });

    it("should validate uniqueInArray for map fields within arrays", async () => {
        const schema = mapPropertyToZod({
            property: arr(
                map({
                    key: str({ validation: { uniqueInArray: true }, name: "Key" }),
                    value: str()
                }),
                { name: "Items" }
            ),
            entityId: "e"
        });
        expect((await schema.safeParseAsync([
            { key: "a", value: "1" },
            { key: "b", value: "2" }
        ])).success).toBe(true);

        expect((await schema.safeParseAsync([
            { key: "a", value: "1" },
            { key: "a", value: "2" }
        ])).success).toBe(false);
    });

    it("should accept empty array when not required", async () => {
        const schema = mapPropertyToZod({
            property: arr(str()),
            entityId: "e"
        });
        expect((await schema.safeParseAsync([])).success).toBe(true);
    });

    it("should validate min/max array length in form context", async () => {
        const errors = await runFormValidation(
            { items: arr(str(), { name: "Items", validation: { min: 2, max: 5 } }) },
            { items: ["one"] }
        );
        expect(errors).toHaveProperty("items");
    });
});

// ============================================================================
// 13. ID PROPERTY BEHAVIOR
//     isId affects whether required validation is applied.
// ============================================================================

describe("isId property handling", () => {

    it("isId: true should make field required even without validation config", async () => {
        const schema = getEntitySchema(undefined, {
            user_id: str({ isId: true })
        });
        const result = await schema.safeParseAsync({});
        expect(result.success).toBe(false);
    });

    it("isId: 'uuid' should skip validation for new entities (entityId undefined)", async () => {
        const schema = getEntitySchema(undefined, {
            id: str({ isId: "uuid", validation: { required: true } })
        });
        const result = await schema.safeParseAsync({});
        expect(result.success).toBe(true);
    });

    it("isId: 'manual' should enforce required validation", async () => {
        const schema = getEntitySchema("existing", {
            code: str({ isId: "manual" })
        });
        const result = await schema.safeParseAsync({ code: "" });
        expect(result.success).toBe(false);
    });
});

// ============================================================================
// 14. DATE EDGE CASES
// ============================================================================

describe("Date runtime edge cases", () => {

    it("should accept Date objects", async () => {
        expect((await runCellValidation(date(), new Date())).success).toBe(true);
    });

    it("should reject string dates (they must be Date instances)", async () => {
        expect((await runCellValidation(date(), "2024-01-01")).success).toBe(false);
    });

    it("should reject numbers (timestamps)", async () => {
        expect((await runCellValidation(date(), Date.now())).success).toBe(false);
    });

    it("should accept null for autoValue dates", async () => {
        expect((await runCellValidation(date({ autoValue: "on_create" }), null)).success).toBe(true);
    });

    it("should validate date min/max correctly", async () => {
        const jan = new Date("2024-01-01");
        const dec = new Date("2024-12-31");
        const schema = mapPropertyToZod({
            property: date({ name: "Event", validation: { min: jan, max: dec } }),
            entityId: "e"
        });
        expect((await schema.safeParseAsync(new Date("2024-06-15"))).success).toBe(true);
        expect((await schema.safeParseAsync(new Date("2023-01-01"))).success).toBe(false);
        expect((await schema.safeParseAsync(new Date("2025-06-01"))).success).toBe(false);
    });
});

// ============================================================================
// 15. NUMBER EDGE CASES
// ============================================================================

describe("Number runtime edge cases", () => {

    it("should accept 0 when not required", async () => {
        expect((await runCellValidation(num(), 0)).success).toBe(true);
    });

    it("should accept 0 when required (0 is a valid number)", async () => {
        expect((await runCellValidation(num({ validation: { required: true } }), 0)).success).toBe(true);
    });

    it("should accept negative numbers", async () => {
        expect((await runCellValidation(num(), -42)).success).toBe(true);
    });

    it("should accept floats", async () => {
        expect((await runCellValidation(num(), 3.14159)).success).toBe(true);
    });

    it("should reject NaN", async () => {
        // NaN should be rejected because typeof NaN === "number" but it's not valid
        const result = await runCellValidation(num(), NaN);
        // NaN is not a valid number — preprocess should handle this
        expect(result.success).toBe(false);
    });

    it("should reject Infinity", async () => {
        const result = await runCellValidation(num({ validation: { max: 1000 } }), Infinity);
        expect(result.success).toBe(false);
    });

    it("should coerce numeric strings to numbers (like yup did)", async () => {
        const schema = mapPropertyToZod({ property: num(), entityId: "e" });
        const result = await schema.safeParseAsync("42");
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toBe(42);
        }
    });
});

// ============================================================================
// 16. RELATION PROPERTY
// ============================================================================

describe("Relation property validation", () => {

    it("relation one: accepts object, null", async () => {
        const schema = mapPropertyToZod({
            property: rel({ relation: { cardinality: "one" } as Partial<Relation> as Relation }),
            entityId: "e"
        });
        expect((await schema.safeParseAsync({ id: 1, name: "Test" })).success).toBe(true);
        expect((await schema.safeParseAsync(null)).success).toBe(true);
    });

    it("relation many: accepts array of objects, null", async () => {
        const schema = mapPropertyToZod({
            property: rel({ relation: { cardinality: "many" } as Partial<Relation> as Relation }),
            entityId: "e"
        });
        expect((await schema.safeParseAsync([{ id: 1 }, { id: 2 }])).success).toBe(true);
        expect((await schema.safeParseAsync(null)).success).toBe(true);
        expect((await schema.safeParseAsync([])).success).toBe(true);
    });

    it("relation many required: rejects empty array", async () => {
        const schema = mapPropertyToZod({
            property: rel({ relation: { cardinality: "many" } as Partial<Relation> as Relation, validation: { required: true } }),
            entityId: "e"
        });
        expect((await schema.safeParseAsync([])).success).toBe(false);
        expect((await schema.safeParseAsync([{ id: 1 }])).success).toBe(true);
    });
});

// ============================================================================
// 17. ERROR STRUCTURE — ZodError message contains useful text
//     PropertyTableCell assigns ZodError directly to error state.
//     ErrorBoundary and error displays may read .message.
// ============================================================================

describe("ZodError .message readability", () => {

    it("ZodError.message should contain the validation message text", async () => {
        const schema = mapPropertyToZod({
            property: str({ validation: { required: true, requiredMessage: "Title is required" } }),
            entityId: "e"
        });
        const result = await schema.safeParseAsync("");
        expect(result.success).toBe(false);
        if (!result.success) {
            // .message contains JSON-stringified issues, which includes the message text
            expect(result.error.message).toContain("Title is required");
            expect(result.error.issues[0].message).toBe("Title is required");
        }
    });

    it("ZodError should have correct issue count for multiple violations", async () => {
        const schema = getEntitySchema("e", {
            a: str({ validation: { required: true } }),
            b: num({ validation: { required: true } }),
            c: bool({ validation: { required: true } })
        });
        const result = await schema.safeParseAsync({ a: "", b: null, c: null });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues.length).toBeGreaterThanOrEqual(3);
        }
    });
});

// ============================================================================
// 18. MAP WITH OPTIONAL REQUIRED — important edge case
//     A map property with required: true should still accept null
//     (this was the original yup behavior — required + nullable)
// ============================================================================

describe("Map required + nullable original behavior", () => {

    it("required map should still accept null (original yup behavior)", async () => {
        const schema = mapPropertyToZod({
            property: map({ name: str() }, { validation: { required: true } }),
            entityId: "e"
        });
        // The original yup v0.x behavior: .required().nullable(true) allowed null
        const result = await schema.safeParseAsync(null);
        expect(result.success).toBe(true);
    });

    it("required map should accept valid object", async () => {
        const schema = mapPropertyToZod({
            property: map({ name: str() }, { validation: { required: true } }),
            entityId: "e"
        });
        const result = await schema.safeParseAsync({ name: "test" });
        expect(result.success).toBe(true);
    });
});
