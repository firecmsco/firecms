/**
 * Extensive test suite for validation.ts
 *
 * This file tests all validation functions after the zod migration.
 * It serves as a regression test to ensure the migration doesn't break existing behavior.
 */

import {
    getEntitySchema,
    mapPropertyToZod,
    CustomFieldValidator
} from "../src/form/validation";
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
    GeoPoint,
    EntityReference
} from "@rebasepro/types";

// Helper to create a minimal resolved property
function createStringProperty(overrides: Partial<StringProperty> = {}): StringProperty {
    return {
        type: "string",
        ...overrides
    } as StringProperty;
}

function createNumberProperty(overrides: Partial<NumberProperty> = {}): NumberProperty {
    return {
        type: "number",
        ...overrides
    } as NumberProperty;
}

function createBooleanProperty(overrides: Partial<BooleanProperty> = {}): BooleanProperty {
    return {
        type: "boolean",
        ...overrides
    } as BooleanProperty;
}

function createDateProperty(overrides: Partial<DateProperty> = {}): DateProperty {
    return {
        type: "date",
        ...overrides
    } as DateProperty;
}

function createArrayProperty(of: Property, overrides: Partial<ArrayProperty> = {}): ArrayProperty {
    return {
        type: "array",
        of,
        ...overrides
    } as ArrayProperty;
}

function createMapProperty(properties: Properties, overrides: Partial<MapProperty> = {}): MapProperty {
    return {
        type: "map",
        properties,
        ...overrides
    } as MapProperty;
}

function createReferenceProperty(path: string, overrides: Partial<ReferenceProperty> = {}): ReferenceProperty {
    return {
        type: "reference",
        path,
        ...overrides
    } as ReferenceProperty;
}

function createGeoPointProperty(overrides: Partial<Property> = {}): Property {
    return {
        type: "geopoint",
        ...overrides
    } as Property;
}

// ============================================================================
// STRING VALIDATION TESTS
// ============================================================================

describe("String Validation", () => {

    describe("Basic string validation", () => {
        it("should accept any string when no validation is set", async () => {
            const property = createStringProperty();
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync("hello")).resolves.toBe("hello");
            await expect(schema.parseAsync("")).resolves.toBe("");
            await expect(schema.parseAsync(null)).resolves.toBe(null);
            await expect(schema.parseAsync(undefined)).resolves.toBe(undefined);
        });

        it("should accept null when not required", async () => {
            const property = createStringProperty({
                validation: { required: false }
            });
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync(null)).resolves.toBe(null);
        });
    });

    describe("Required string validation", () => {
        it("should reject empty/null when required", async () => {
            const property = createStringProperty({
                validation: { required: true }
            });
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync("hello")).resolves.toBe("hello");
            await expect(schema.parseAsync("")).rejects.toThrow();
            await expect(schema.parseAsync(null)).rejects.toThrow();
            await expect(schema.parseAsync(undefined)).rejects.toThrow();
        });

        it("should use custom required message", async () => {
            const property = createStringProperty({
                validation: {
                    required: true,
                    requiredMessage: "This field is mandatory"
                }
            });
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            try {
                await schema.parseAsync(undefined);
                fail("Should have thrown");
            } catch (e: any) {
                expect(e.issues[0].message).toBe("This field is mandatory");
            }
        });
    });

    describe("String length validation", () => {
        it("should validate min length", async () => {
            const property = createStringProperty({
                name: "Title",
                validation: { min: 5 }
            });
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync("hello")).resolves.toBe("hello");
            await expect(schema.parseAsync("12345")).resolves.toBe("12345");
            await expect(schema.parseAsync("hi")).rejects.toThrow();
        });

        it("should validate max length", async () => {
            const property = createStringProperty({
                name: "Title",
                validation: { max: 10 }
            });
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync("hello")).resolves.toBe("hello");
            await expect(schema.parseAsync("this is too long")).rejects.toThrow();
        });

        it("should validate min length of 0", async () => {
            const property = createStringProperty({
                name: "Title",
                validation: { min: 0 }
            });
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync("")).resolves.toBe("");
        });

        it("should validate max length of 0", async () => {
            const property = createStringProperty({
                name: "Title",
                validation: { max: 0 }
            });
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync("")).resolves.toBe("");
            await expect(schema.parseAsync("a")).rejects.toThrow();
        });
    });

    describe("String pattern validation (matches)", () => {
        it("should validate against regex pattern", async () => {
            const property = createStringProperty({
                name: "Code",
                validation: { matches: /^[A-Z]{3}$/ }
            });
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync("ABC")).resolves.toBe("ABC");
            await expect(schema.parseAsync("abc")).rejects.toThrow();
            await expect(schema.parseAsync("ABCD")).rejects.toThrow();
        });

        it("should use custom matches message", async () => {
            const property = createStringProperty({
                name: "Code",
                validation: {
                    matches: /^[A-Z]{3}$/,
                    matchesMessage: "Must be exactly 3 uppercase letters"
                }
            });
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            try {
                await schema.parseAsync("abc");
                fail("Should have thrown");
            } catch (e: any) {
                expect(e.issues[0].message).toBe("Must be exactly 3 uppercase letters");
            }
        });

        it("should handle serialized regex string", async () => {
            const property = createStringProperty({
                name: "Code",
                validation: { matches: "/^[A-Z]{3}$/" }
            });
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync("ABC")).resolves.toBe("ABC");
            await expect(schema.parseAsync("abc")).rejects.toThrow();
        });
    });

    describe("String transforms", () => {
        it("should trim strings when trim is enabled", async () => {
            const property = createStringProperty({
                validation: { trim: true }
            });
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync("  hello  ")).resolves.toBe("hello");
        });

        it("should convert to lowercase when lowercase is enabled", async () => {
            const property = createStringProperty({
                validation: { lowercase: true }
            });
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync("HeLLo")).resolves.toBe("hello");
        });

        it("should convert to uppercase when uppercase is enabled", async () => {
            const property = createStringProperty({
                validation: { uppercase: true }
            });
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync("HeLLo")).resolves.toBe("HELLO");
        });
    });

    describe("Email validation", () => {
        it("should validate email format", async () => {
            const property = createStringProperty({
                name: "Email",
                email: true,
                validation: {} // Need validation object for email check to apply
            });
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync("test@example.com")).resolves.toBe("test@example.com");
            await expect(schema.parseAsync("not-an-email")).rejects.toThrow();
        });
    });

    describe("URL validation", () => {
        it("should validate URL format", async () => {
            const property = createStringProperty({
                name: "Website",
                url: true,
                validation: {} // Need validation object for URL check to apply
            });
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync("https://example.com")).resolves.toBe("https://example.com");
            await expect(schema.parseAsync("not-a-url")).rejects.toThrow();
        });

        it("should skip URL validation when storage.storeUrl is false", async () => {
            const property = createStringProperty({
                name: "Website",
                url: true,
                storage: {
                    storeUrl: false,
                    storagePath: "images"
                }
            });
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            // Should not validate as URL when storage.storeUrl is false
            await expect(schema.parseAsync("not-a-url")).resolves.toBe("not-a-url");
        });
    });

    describe("Enum validation", () => {
        it("should validate against enum values", async () => {
            const property = createStringProperty({
                enum: [
                    { id: "draft", label: "Draft" },
                    { id: "published", label: "Published" },
                    { id: "archived", label: "Archived" }
                ]
            });
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync("draft")).resolves.toBe("draft");
            await expect(schema.parseAsync("published")).resolves.toBe("published");
            await expect(schema.parseAsync("invalid")).rejects.toThrow();
        });

        it("should allow null for non-required enum", async () => {
            const property = createStringProperty({
                enum: [
                    { id: "draft", label: "Draft" },
                    { id: "published", label: "Published" }
                ]
            });
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync(null)).resolves.toBe(null);
        });

        it("should reject null for required enum", async () => {
            const property = createStringProperty({
                enum: [
                    { id: "draft", label: "Draft" },
                    { id: "published", label: "Published" }
                ],
                validation: { required: true }
            });
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync(null)).rejects.toThrow();
        });
    });

    describe("Unique validation", () => {
        it("should call custom validator for unique fields", async () => {
            const customValidator: CustomFieldValidator = jest.fn().mockResolvedValue(true);

            const property = createStringProperty({
                validation: { unique: true }
            });
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity",
                customFieldValidator: customValidator,
                name: "slug"
            });

            await schema.parseAsync("unique-value");

            expect(customValidator).toHaveBeenCalledWith(expect.objectContaining({
                name: "slug",
                value: "unique-value",
                entityId: "test-entity"
            }));
        });

        it("should fail when custom validator returns false", async () => {
            const customValidator: CustomFieldValidator = jest.fn().mockResolvedValue(false);

            const property = createStringProperty({
                validation: { unique: true }
            });
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity",
                customFieldValidator: customValidator,
                name: "slug"
            });

            await expect(schema.parseAsync("duplicate-value")).rejects.toThrow("This value already exists and should be unique");
        });
    });
});

// ============================================================================
// NUMBER VALIDATION TESTS
// ============================================================================

describe("Number Validation", () => {

    describe("Basic number validation", () => {
        it("should accept any number when no validation is set", async () => {
            const property = createNumberProperty();
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync(42)).resolves.toBe(42);
            await expect(schema.parseAsync(0)).resolves.toBe(0);
            await expect(schema.parseAsync(-10)).resolves.toBe(-10);
            await expect(schema.parseAsync(3.14)).resolves.toBe(3.14);
            await expect(schema.parseAsync(null)).resolves.toBe(null);
        });

        it("should reject non-numbers", async () => {
            const property = createNumberProperty();
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync("not a number")).rejects.toThrow("Must be a number");
        });
    });

    describe("Required number validation", () => {
        it("should reject null when required", async () => {
            const property = createNumberProperty({
                validation: { required: true }
            });
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync(42)).resolves.toBe(42);
            await expect(schema.parseAsync(0)).resolves.toBe(0);
            await expect(schema.parseAsync(null)).rejects.toThrow();
            await expect(schema.parseAsync(undefined)).rejects.toThrow();
        });
    });

    describe("Number range validation", () => {
        it("should validate min value", async () => {
            const property = createNumberProperty({
                name: "Age",
                validation: { min: 18 }
            });
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync(18)).resolves.toBe(18);
            await expect(schema.parseAsync(25)).resolves.toBe(25);
            await expect(schema.parseAsync(17)).rejects.toThrow();
        });

        it("should validate max value", async () => {
            const property = createNumberProperty({
                name: "Quantity",
                validation: { max: 100 }
            });
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync(100)).resolves.toBe(100);
            await expect(schema.parseAsync(50)).resolves.toBe(50);
            await expect(schema.parseAsync(101)).rejects.toThrow();
        });

        it("should validate min of 0", async () => {
            const property = createNumberProperty({
                name: "Count",
                validation: { min: 0 }
            });
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync(0)).resolves.toBe(0);
            await expect(schema.parseAsync(-1)).rejects.toThrow();
        });

        it("should validate max of 0", async () => {
            const property = createNumberProperty({
                name: "Temperature",
                validation: { max: 0 }
            });
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync(0)).resolves.toBe(0);
            await expect(schema.parseAsync(-10)).resolves.toBe(-10);
            await expect(schema.parseAsync(1)).rejects.toThrow();
        });
    });

    describe("Number comparison validation", () => {
        it("should validate lessThan", async () => {
            const property = createNumberProperty({
                name: "Score",
                validation: { lessThan: 100 }
            });
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync(99)).resolves.toBe(99);
            await expect(schema.parseAsync(100)).rejects.toThrow();
        });

        it("should validate moreThan", async () => {
            const property = createNumberProperty({
                name: "Price",
                validation: { moreThan: 0 }
            });
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync(1)).resolves.toBe(1);
            await expect(schema.parseAsync(0)).rejects.toThrow();
        });

        it("should validate lessThan 0", async () => {
            const property = createNumberProperty({
                name: "Negative",
                validation: { lessThan: 0 }
            });
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync(-1)).resolves.toBe(-1);
            await expect(schema.parseAsync(0)).rejects.toThrow();
        });

        it("should validate moreThan 0", async () => {
            const property = createNumberProperty({
                name: "Positive",
                validation: { moreThan: 0 }
            });
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync(0.001)).resolves.toBe(0.001);
            await expect(schema.parseAsync(0)).rejects.toThrow();
        });
    });

    describe("Number type validation", () => {
        it("should validate positive numbers", async () => {
            const property = createNumberProperty({
                name: "Amount",
                validation: { positive: true }
            });
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync(1)).resolves.toBe(1);
            await expect(schema.parseAsync(0)).rejects.toThrow();
            await expect(schema.parseAsync(-1)).rejects.toThrow();
        });

        it("should validate negative numbers", async () => {
            const property = createNumberProperty({
                name: "Debt",
                validation: { negative: true }
            });
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync(-1)).resolves.toBe(-1);
            await expect(schema.parseAsync(0)).rejects.toThrow();
            await expect(schema.parseAsync(1)).rejects.toThrow();
        });

        it("should validate integers", async () => {
            const property = createNumberProperty({
                name: "Count",
                validation: { integer: true }
            });
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync(42)).resolves.toBe(42);
            await expect(schema.parseAsync(0)).resolves.toBe(0);
            await expect(schema.parseAsync(-10)).resolves.toBe(-10);
            await expect(schema.parseAsync(3.14)).rejects.toThrow();
        });
    });
});

// ============================================================================
// BOOLEAN VALIDATION TESTS
// ============================================================================

describe("Boolean Validation", () => {

    it("should accept boolean values", async () => {
        const property = createBooleanProperty();
        const schema = mapPropertyToZod({
            property,
            entityId: "test-entity"
        });

        await expect(schema.parseAsync(true)).resolves.toBe(true);
        await expect(schema.parseAsync(false)).resolves.toBe(false);
        await expect(schema.parseAsync(null)).resolves.toBe(null);
    });

    it("should reject null when required", async () => {
        const property = createBooleanProperty({
            validation: { required: true }
        });
        const schema = mapPropertyToZod({
            property,
            entityId: "test-entity"
        });

        await expect(schema.parseAsync(true)).resolves.toBe(true);
        await expect(schema.parseAsync(false)).resolves.toBe(false);
        await expect(schema.parseAsync(null)).rejects.toThrow();
    });
});

// ============================================================================
// DATE VALIDATION TESTS
// ============================================================================

describe("Date Validation", () => {

    it("should accept Date objects", async () => {
        const property = createDateProperty();
        const schema = mapPropertyToZod({
            property,
            entityId: "test-entity"
        });

        const now = new Date();
        await expect(schema.parseAsync(now)).resolves.toEqual(now);
        await expect(schema.parseAsync(null)).resolves.toBe(null);
    });

    it("should reject null when required", async () => {
        const property = createDateProperty({
            validation: { required: true }
        });
        const schema = mapPropertyToZod({
            property,
            entityId: "test-entity"
        });

        const now = new Date();
        await expect(schema.parseAsync(now)).resolves.toEqual(now);
        await expect(schema.parseAsync(null)).rejects.toThrow();
    });

    it("should validate min date", async () => {
        const minDate = new Date("2024-01-01");
        const property = createDateProperty({
            name: "StartDate",
            validation: { min: minDate }
        });
        const schema = mapPropertyToZod({
            property,
            entityId: "test-entity"
        });

        await expect(schema.parseAsync(new Date("2024-06-01"))).resolves.toBeDefined();
        await expect(schema.parseAsync(new Date("2023-06-01"))).rejects.toThrow();
    });

    it("should validate max date", async () => {
        const maxDate = new Date("2024-12-31");
        const property = createDateProperty({
            name: "EndDate",
            validation: { max: maxDate }
        });
        const schema = mapPropertyToZod({
            property,
            entityId: "test-entity"
        });

        await expect(schema.parseAsync(new Date("2024-06-01"))).resolves.toBeDefined();
        await expect(schema.parseAsync(new Date("2025-01-01"))).rejects.toThrow();
    });

    it("should skip validation for autoValue dates", async () => {
        const property = createDateProperty({
            autoValue: "on_create"
        });
        const schema = mapPropertyToZod({
            property,
            entityId: "test-entity"
        });

        // autoValue dates should accept anything (they're auto-generated)
        await expect(schema.parseAsync(null)).resolves.toBe(null);
    });

    it("should reject non-Date values", async () => {
        const property = createDateProperty();
        const schema = mapPropertyToZod({
            property,
            entityId: "test-entity"
        });

        // Non-Date strings that yup can't parse should be rejected
        await expect(schema.parseAsync("not-a-date")).rejects.toThrow();
    });
});

// ============================================================================
// ARRAY VALIDATION TESTS
// ============================================================================

describe("Array Validation", () => {

    describe("Basic array validation", () => {
        it("should accept arrays", async () => {
            const property = createArrayProperty(createStringProperty());
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync(["a", "b", "c"])).resolves.toEqual(["a", "b", "c"]);
            await expect(schema.parseAsync([])).resolves.toEqual([]);
            await expect(schema.parseAsync(null)).resolves.toBe(null);
        });

        it("should reject null when required", async () => {
            const property = createArrayProperty(createStringProperty(), {
                validation: { required: true }
            });
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync(["a"])).resolves.toEqual(["a"]);
            await expect(schema.parseAsync(null)).rejects.toThrow();
        });
    });

    describe("Array length validation", () => {
        it("should validate min length", async () => {
            const property = createArrayProperty(createStringProperty(), {
                name: "Tags",
                validation: { min: 2 }
            });
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync(["a", "b"])).resolves.toEqual(["a", "b"]);
            await expect(schema.parseAsync(["a"])).rejects.toThrow();
        });

        it("should validate max length", async () => {
            const property = createArrayProperty(createStringProperty(), {
                name: "Tags",
                validation: { max: 3 }
            });
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync(["a", "b", "c"])).resolves.toEqual(["a", "b", "c"]);
            await expect(schema.parseAsync(["a", "b", "c", "d"])).rejects.toThrow();
        });

        it("should validate min of 0", async () => {
            const property = createArrayProperty(createStringProperty(), {
                name: "Tags",
                validation: { min: 0 }
            });
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync([])).resolves.toEqual([]);
        });
    });

    describe("Array item validation", () => {
        it("should validate string items", async () => {
            const property = createArrayProperty(
                createStringProperty({ validation: { min: 2 } })
            );
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync(["ab", "cd"])).resolves.toEqual(["ab", "cd"]);
            await expect(schema.parseAsync(["a"])).rejects.toThrow();
        });

        it("should validate number items", async () => {
            const property = createArrayProperty(
                createNumberProperty({ validation: { min: 0 } })
            );
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync([1, 2, 3])).resolves.toEqual([1, 2, 3]);
            await expect(schema.parseAsync([-1])).rejects.toThrow();
        });
    });

    describe("Array uniqueInArray validation", () => {
        it("should reject duplicate primitive values", async () => {
            const property = createArrayProperty(
                createStringProperty({ validation: { uniqueInArray: true } }),
                { name: "Tags" }
            );
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync(["a", "b", "c"])).resolves.toEqual(["a", "b", "c"]);
            await expect(schema.parseAsync(["a", "b", "a"])).rejects.toThrow();
        });

        it("should reject duplicate values in map property", async () => {
            const property = createArrayProperty(
                createMapProperty({
                    key: createStringProperty({ validation: { uniqueInArray: true }, name: "Key" }),
                    value: createStringProperty()
                }),
                { name: "Items" }
            );
            const schema = mapPropertyToZod({
                property,
                entityId: "test-entity"
            });

            await expect(schema.parseAsync([
                { key: "a", value: "1" },
                { key: "b", value: "2" }
            ])).resolves.toBeDefined();

            await expect(schema.parseAsync([
                { key: "a", value: "1" },
                { key: "a", value: "2" }
            ])).rejects.toThrow();
        });
    });
});

// ============================================================================
// MAP (OBJECT) VALIDATION TESTS
// ============================================================================

describe("Map Validation", () => {

    it("should validate nested properties", async () => {
        const property = createMapProperty({
            name: createStringProperty({ validation: { required: true } }),
            age: createNumberProperty({ validation: { min: 0 } })
        });
        const schema = mapPropertyToZod({
            property,
            entityId: "test-entity"
        });

        await expect(schema.parseAsync({ name: "John", age: 30 })).resolves.toEqual({ name: "John", age: 30 });
        await expect(schema.parseAsync({ name: "", age: 30 })).rejects.toThrow();
        await expect(schema.parseAsync({ name: "John", age: -1 })).rejects.toThrow();
    });

    it("should accept null when not required", async () => {
        const property = createMapProperty({
            name: createStringProperty()
        });
        const schema = mapPropertyToZod({
            property,
            entityId: "test-entity"
        });

        await expect(schema.parseAsync(null)).resolves.toBe(null);
    });

    it("should allow null for required map (original behavior)", async () => {
        const property = createMapProperty(
            { name: createStringProperty() },
            { validation: { required: true } }
        );
        const schema = mapPropertyToZod({
            property,
            entityId: "test-entity"
        });

        await expect(schema.parseAsync({ name: "test" })).resolves.toBeDefined();
        // In yup v0.x, .required().nullable(true) allowed null values
        // This was the original behavior - null was considered valid for required fields
        await expect(schema.parseAsync(null)).resolves.toBe(null);
    });

    it("should validate deeply nested maps", async () => {
        const property = createMapProperty({
            address: createMapProperty({
                street: createStringProperty({ validation: { required: true } }),
                city: createStringProperty({ validation: { required: true } })
            })
        });
        const schema = mapPropertyToZod({
            property,
            entityId: "test-entity"
        });

        await expect(schema.parseAsync({
            address: { street: "123 Main St", city: "NYC" }
        })).resolves.toBeDefined();

        await expect(schema.parseAsync({
            address: { street: "", city: "NYC" }
        })).rejects.toThrow();
    });
});

// ============================================================================
// REFERENCE VALIDATION TESTS
// ============================================================================

describe("Reference Validation", () => {

    it("should accept reference objects", async () => {
        const property = createReferenceProperty("users");
        const schema = mapPropertyToZod({
            property,
            entityId: "test-entity"
        });

        const ref = { id: "user123", path: "users" };
        await expect(schema.parseAsync(ref)).resolves.toEqual(ref);
        await expect(schema.parseAsync(null)).resolves.toBe(null);
    });

    it("should reject null when required", async () => {
        const property = createReferenceProperty("users", {
            validation: { required: true }
        });
        const schema = mapPropertyToZod({
            property,
            entityId: "test-entity"
        });

        await expect(schema.parseAsync({ id: "user123", path: "users" })).resolves.toBeDefined();
        await expect(schema.parseAsync(null)).rejects.toThrow();
    });
});

// ============================================================================
// GEOPOINT VALIDATION TESTS
// ============================================================================

describe("GeoPoint Validation", () => {

    it("should accept geopoint objects", async () => {
        const property = createGeoPointProperty();
        const schema = mapPropertyToZod({
            property,
            entityId: "test-entity"
        });

        const geo = { latitude: 40.7128, longitude: -74.0060 };
        await expect(schema.parseAsync(geo)).resolves.toEqual(geo);
        await expect(schema.parseAsync(null)).resolves.toBe(null);
    });

    it("should reject null when required", async () => {
        const property = createGeoPointProperty({
            validation: { required: true }
        });
        const schema = mapPropertyToZod({
            property,
            entityId: "test-entity"
        });

        await expect(schema.parseAsync({ latitude: 40.7128, longitude: -74.0060 })).resolves.toBeDefined();
        await expect(schema.parseAsync(null)).rejects.toThrow();
    });
});

// ============================================================================
// ENTITY SCHEMA TESTS
// ============================================================================

describe("getEntitySchema", () => {

    it("should create a complete entity schema", async () => {
        const properties: Properties = {
            title: createStringProperty({ validation: { required: true } }),
            count: createNumberProperty({ validation: { min: 0 } }),
            active: createBooleanProperty(),
            tags: createArrayProperty(createStringProperty())
        };

        const schema = getEntitySchema("entity-id", properties);

        await expect(schema.parseAsync({
            title: "Test",
            count: 10,
            active: true,
            tags: ["a", "b"]
        })).resolves.toBeDefined();

        await expect(schema.parseAsync({
            title: "",
            count: 10,
            active: true,
            tags: []
        })).rejects.toThrow();
    });

    it("should validate complex nested entities", async () => {
        const properties: Properties = {
            name: createStringProperty({ validation: { required: true } }),
            profile: createMapProperty({
                bio: createStringProperty({ validation: { max: 500 } }),
                socialLinks: createArrayProperty(
                    createStringProperty({ url: true })
                )
            }),
            metadata: createMapProperty({
                createdAt: createDateProperty(),
                tags: createArrayProperty(createStringProperty())
            })
        };

        const schema = getEntitySchema("entity-id", properties);

        await expect(schema.parseAsync({
            name: "John Doe",
            profile: {
                bio: "A short bio",
                socialLinks: ["https://twitter.com/johndoe"]
            },
            metadata: {
                createdAt: new Date(),
                tags: ["developer", "designer"]
            }
        })).resolves.toBeDefined();
    });

    it("should pass custom field validator to nested properties", async () => {
        const customValidator = jest.fn().mockResolvedValue(true);

        const properties: Properties = {
            slug: createStringProperty({ validation: { unique: true } })
        };

        const schema = getEntitySchema("entity-id", properties, customValidator);

        await schema.parseAsync({ slug: "test-slug" });

        expect(customValidator).toHaveBeenCalled();
    });
});

// ============================================================================
// ERROR HANDLING TESTS
// ============================================================================

describe("Error Handling", () => {

    it("should return a failing schema for unsupported data types", async () => {
        const property = { type: "unsupported" } as any;

        const schema = mapPropertyToZod({
            property,
            entityId: "test-entity"
        });

        await expect(schema.parseAsync("anything")).rejects.toThrow("Unsupported data type: unknown");
    });

    it("should return a failing schema for property builders (unresolved properties)", async () => {
        const propertyBuilder = {
            type: "string",
            dynamicProps: () => ({ validation: { required: true } })
        } as any;

        const schema = mapPropertyToZod({
            property: propertyBuilder as any,
            entityId: "test-entity"
        });

        await expect(schema.parseAsync("anything")).rejects.toThrow("Invalid property configuration: property builder should be resolved");
    });
});

// ============================================================================
// COMBINED VALIDATION TESTS
// ============================================================================

describe("Combined Validations", () => {

    it("should apply multiple string validations together", async () => {
        const property = createStringProperty({
            name: "Username",
            validation: {
                required: true,
                min: 3,
                max: 20,
                matches: /^[a-z0-9_]+$/,
                lowercase: true,
                trim: true
            }
        });
        const schema = mapPropertyToZod({
            property,
            entityId: "test-entity"
        });

        // Valid: lowercase, within length, matches pattern
        await expect(schema.parseAsync("  john_doe123  ")).resolves.toBe("john_doe123");

        // Invalid: too short
        await expect(schema.parseAsync("ab")).rejects.toThrow();

        // Invalid: contains invalid chars
        await expect(schema.parseAsync("John-Doe")).rejects.toThrow();
    });

    it("should apply multiple number validations together", async () => {
        const property = createNumberProperty({
            name: "Percentage",
            validation: {
                required: true,
                min: 0,
                max: 100,
                integer: true
            }
        });
        const schema = mapPropertyToZod({
            property,
            entityId: "test-entity"
        });

        await expect(schema.parseAsync(50)).resolves.toBe(50);
        await expect(schema.parseAsync(0)).resolves.toBe(0);
        await expect(schema.parseAsync(100)).resolves.toBe(100);
        await expect(schema.parseAsync(-1)).rejects.toThrow();
        await expect(schema.parseAsync(101)).rejects.toThrow();
        await expect(schema.parseAsync(50.5)).rejects.toThrow();
        await expect(schema.parseAsync(null)).rejects.toThrow();
    });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe("Edge Cases", () => {

    it("should handle empty properties object", async () => {
        const schema = getEntitySchema("entity-id", {});

        await expect(schema.parseAsync({})).resolves.toEqual({});
    });

    it("should handle undefined validation object", async () => {
        const property = createStringProperty({
            validation: undefined
        });
        const schema = mapPropertyToZod({
            property,
            entityId: "test-entity"
        });

        await expect(schema.parseAsync("anything")).resolves.toBe("anything");
        await expect(schema.parseAsync(null)).resolves.toBe(null);
    });

    it("should handle empty array of enum values", async () => {
        const property = createStringProperty({
            enum: []
        });
        const schema = mapPropertyToZod({
            property,
            entityId: "test-entity"
        });

        // Empty enum should only accept null
        await expect(schema.parseAsync(null)).resolves.toBe(null);
        await expect(schema.parseAsync("anything")).rejects.toThrow();
    });

    it("should handle array with undefined of property", async () => {
        const property: ArrayProperty = {
            type: "array",
            of: undefined as any
        };
        const schema = mapPropertyToZod({
            property,
            entityId: "test-entity"
        });

        // Should still work as a basic array
        await expect(schema.parseAsync(["anything"])).resolves.toEqual(["anything"]);
    });
});

// ============================================================================
// ID VALIDATION TESTS
// ============================================================================

describe("ID Validation", () => {
    it("should ignore required validation when isId is a generator string like 'uuid'", async () => {
        const property = createStringProperty({
            isId: "uuid",
            validation: { required: true }
        });
        const schema = getEntitySchema(undefined, { custom_id: property });

        // Because isId is a string, getYupEntitySchema skips generating validation for it
        await expect(schema.parseAsync({ custom_id: null })).resolves.toEqual({ custom_id: null });
        await expect(schema.parseAsync({})).resolves.toEqual({});
        await expect(schema.parseAsync({ custom_id: "my-uuid" })).resolves.toEqual({ custom_id: "my-uuid" });
    });

    it("should ignore required validation when isId is a custom generator SQL string", async () => {
        const property = createStringProperty({
            isId: "sql`gen_random_uuid()`",
            validation: { required: true }
        });
        const schema = getEntitySchema(undefined, { event_id: property });

        await expect(schema.parseAsync({})).resolves.toEqual({});
    });

    it("should ignore required validation for number ID properties when isId is 'increment'", async () => {
        const property = createNumberProperty({
            isId: "increment",
            validation: { required: true }
        });
        const schema = getEntitySchema(undefined, { ticket_id: property });

        await expect(schema.parseAsync({})).resolves.toEqual({});
        await expect(schema.parseAsync({ ticket_id: 10 })).resolves.toEqual({ ticket_id: 10 });
    });

    it("should enforce required validation when isId is simply true, even without validation config", async () => {
        const property = createStringProperty({
            isId: true
        });
        const schema = getEntitySchema(undefined, { user_name: property });

        // The property must be provided manually since isId is just 'true'
        await expect(schema.parseAsync({})).rejects.toThrow();
        await expect(schema.parseAsync({ user_name: "manual-id" })).resolves.toEqual({ user_name: "manual-id" });
    });
});
