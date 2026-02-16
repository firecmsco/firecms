/**
 * Extensive test suite for validation.ts
 *
 * This file tests all validation functions before the yup v1 upgrade.
 * It serves as a regression test to ensure the upgrade doesn't break existing behavior.
 */

import {
    getYupEntitySchema,
    mapPropertyToYup,
    getYupMapObjectSchema,
    CustomFieldValidator
} from "../src/form/validation";
import {
    ResolvedProperty,
    ResolvedProperties,
    ResolvedStringProperty,
    ResolvedNumberProperty,
    ResolvedBooleanProperty,
    ResolvedDateProperty,
    ResolvedArrayProperty,
    ResolvedMapProperty,
    ResolvedReferenceProperty,
    GeoPoint,
    EntityReference
} from "../src/types";

// Helper to create a minimal resolved property
function createStringProperty(overrides: Partial<ResolvedStringProperty> = {}): ResolvedStringProperty {
    return {
        dataType: "string",
        ...overrides
    } as ResolvedStringProperty;
}

function createNumberProperty(overrides: Partial<ResolvedNumberProperty> = {}): ResolvedNumberProperty {
    return {
        dataType: "number",
        ...overrides
    } as ResolvedNumberProperty;
}

function createBooleanProperty(overrides: Partial<ResolvedBooleanProperty> = {}): ResolvedBooleanProperty {
    return {
        dataType: "boolean",
        ...overrides
    } as ResolvedBooleanProperty;
}

function createDateProperty(overrides: Partial<ResolvedDateProperty> = {}): ResolvedDateProperty {
    return {
        dataType: "date",
        ...overrides
    } as ResolvedDateProperty;
}

function createArrayProperty(of: ResolvedProperty, overrides: Partial<ResolvedArrayProperty> = {}): ResolvedArrayProperty {
    return {
        dataType: "array",
        of,
        ...overrides
    } as ResolvedArrayProperty;
}

function createMapProperty(properties: ResolvedProperties, overrides: Partial<ResolvedMapProperty> = {}): ResolvedMapProperty {
    return {
        dataType: "map",
        properties,
        ...overrides
    } as ResolvedMapProperty;
}

function createReferenceProperty(path: string, overrides: Partial<ResolvedReferenceProperty> = {}): ResolvedReferenceProperty {
    return {
        dataType: "reference",
        path,
        ...overrides
    } as ResolvedReferenceProperty;
}

function createGeoPointProperty(overrides: Partial<ResolvedProperty> = {}): ResolvedProperty {
    return {
        dataType: "geopoint",
        ...overrides
    } as ResolvedProperty;
}

// ============================================================================
// STRING VALIDATION TESTS
// ============================================================================

describe("String Validation", () => {

    describe("Basic string validation", () => {
        it("should accept any string when no validation is set", async () => {
            const property = createStringProperty();
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate("hello")).resolves.toBe("hello");
            await expect(schema.validate("")).resolves.toBe("");
            await expect(schema.validate(null)).resolves.toBe(null);
            await expect(schema.validate(undefined)).resolves.toBe(undefined);
        });

        it("should accept null when not required", async () => {
            const property = createStringProperty({
                validation: { required: false }
            });
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate(null)).resolves.toBe(null);
        });
    });

    describe("Required string validation", () => {
        it("should reject empty/null when required", async () => {
            const property = createStringProperty({
                validation: { required: true }
            });
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate("hello")).resolves.toBe("hello");
            await expect(schema.validate("")).rejects.toThrow();
            await expect(schema.validate(null)).rejects.toThrow();
            await expect(schema.validate(undefined)).rejects.toThrow();
        });

        it("should use custom required message", async () => {
            const property = createStringProperty({
                validation: {
                    required: true,
                    requiredMessage: "This field is mandatory"
                }
            });
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            try {
                await schema.validate(undefined);
                fail("Should have thrown");
            } catch (e: any) {
                expect(e.message).toBe("This field is mandatory");
            }
        });
    });

    describe("String length validation", () => {
        it("should validate min length", async () => {
            const property = createStringProperty({
                name: "Title",
                validation: { min: 5 }
            });
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate("hello")).resolves.toBe("hello");
            await expect(schema.validate("12345")).resolves.toBe("12345");
            await expect(schema.validate("hi")).rejects.toThrow();
        });

        it("should validate max length", async () => {
            const property = createStringProperty({
                name: "Title",
                validation: { max: 10 }
            });
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate("hello")).resolves.toBe("hello");
            await expect(schema.validate("this is too long")).rejects.toThrow();
        });

        it("should validate min length of 0", async () => {
            const property = createStringProperty({
                name: "Title",
                validation: { min: 0 }
            });
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate("")).resolves.toBe("");
        });

        it("should validate max length of 0", async () => {
            const property = createStringProperty({
                name: "Title",
                validation: { max: 0 }
            });
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate("")).resolves.toBe("");
            await expect(schema.validate("a")).rejects.toThrow();
        });
    });

    describe("String pattern validation (matches)", () => {
        it("should validate against regex pattern", async () => {
            const property = createStringProperty({
                name: "Code",
                validation: { matches: /^[A-Z]{3}$/ }
            });
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate("ABC")).resolves.toBe("ABC");
            await expect(schema.validate("abc")).rejects.toThrow();
            await expect(schema.validate("ABCD")).rejects.toThrow();
        });

        it("should use custom matches message", async () => {
            const property = createStringProperty({
                name: "Code",
                validation: {
                    matches: /^[A-Z]{3}$/,
                    matchesMessage: "Must be exactly 3 uppercase letters"
                }
            });
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            try {
                await schema.validate("abc");
                fail("Should have thrown");
            } catch (e: any) {
                expect(e.message).toBe("Must be exactly 3 uppercase letters");
            }
        });

        it("should handle serialized regex string", async () => {
            const property = createStringProperty({
                name: "Code",
                validation: { matches: "/^[A-Z]{3}$/" }
            });
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate("ABC")).resolves.toBe("ABC");
            await expect(schema.validate("abc")).rejects.toThrow();
        });
    });

    describe("String transforms", () => {
        it("should trim strings when trim is enabled", async () => {
            const property = createStringProperty({
                validation: { trim: true }
            });
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate("  hello  ")).resolves.toBe("hello");
        });

        it("should convert to lowercase when lowercase is enabled", async () => {
            const property = createStringProperty({
                validation: { lowercase: true }
            });
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate("HeLLo")).resolves.toBe("hello");
        });

        it("should convert to uppercase when uppercase is enabled", async () => {
            const property = createStringProperty({
                validation: { uppercase: true }
            });
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate("HeLLo")).resolves.toBe("HELLO");
        });
    });

    describe("Email validation", () => {
        it("should validate email format", async () => {
            const property = createStringProperty({
                name: "Email",
                email: true,
                validation: {} // Need validation object for email check to apply
            });
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate("test@example.com")).resolves.toBe("test@example.com");
            await expect(schema.validate("not-an-email")).rejects.toThrow();
        });
    });

    describe("URL validation", () => {
        it("should validate URL format", async () => {
            const property = createStringProperty({
                name: "Website",
                url: true,
                validation: {} // Need validation object for URL check to apply
            });
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate("https://example.com")).resolves.toBe("https://example.com");
            await expect(schema.validate("not-a-url")).rejects.toThrow();
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
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            // Should not validate as URL when storage.storeUrl is false
            await expect(schema.validate("not-a-url")).resolves.toBe("not-a-url");
        });
    });

    describe("Enum validation", () => {
        it("should validate against enum values", async () => {
            const property = createStringProperty({
                enumValues: [
                    { id: "draft", label: "Draft" },
                    { id: "published", label: "Published" },
                    { id: "archived", label: "Archived" }
                ]
            });
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate("draft")).resolves.toBe("draft");
            await expect(schema.validate("published")).resolves.toBe("published");
            await expect(schema.validate("invalid")).rejects.toThrow();
        });

        it("should allow null for non-required enum", async () => {
            const property = createStringProperty({
                enumValues: [
                    { id: "draft", label: "Draft" },
                    { id: "published", label: "Published" }
                ]
            });
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate(null)).resolves.toBe(null);
        });

        it("should reject null for required enum", async () => {
            const property = createStringProperty({
                enumValues: [
                    { id: "draft", label: "Draft" },
                    { id: "published", label: "Published" }
                ],
                validation: { required: true }
            });
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate(null)).rejects.toThrow();
        });
    });

    describe("Unique validation", () => {
        it("should call custom validator for unique fields", async () => {
            const customValidator: CustomFieldValidator = jest.fn().mockResolvedValue(true);

            const property = createStringProperty({
                validation: { unique: true }
            });
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity",
                customFieldValidator: customValidator,
                name: "slug"
            });

            await schema.validate("unique-value");

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
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity",
                customFieldValidator: customValidator,
                name: "slug"
            });

            await expect(schema.validate("duplicate-value")).rejects.toThrow("This value already exists and should be unique");
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
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate(42)).resolves.toBe(42);
            await expect(schema.validate(0)).resolves.toBe(0);
            await expect(schema.validate(-10)).resolves.toBe(-10);
            await expect(schema.validate(3.14)).resolves.toBe(3.14);
            await expect(schema.validate(null)).resolves.toBe(null);
        });

        it("should reject non-numbers", async () => {
            const property = createNumberProperty();
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate("not a number")).rejects.toThrow("Must be a number");
        });
    });

    describe("Required number validation", () => {
        it("should reject null when required", async () => {
            const property = createNumberProperty({
                validation: { required: true }
            });
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate(42)).resolves.toBe(42);
            await expect(schema.validate(0)).resolves.toBe(0);
            await expect(schema.validate(null)).rejects.toThrow();
            await expect(schema.validate(undefined)).rejects.toThrow();
        });
    });

    describe("Number range validation", () => {
        it("should validate min value", async () => {
            const property = createNumberProperty({
                name: "Age",
                validation: { min: 18 }
            });
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate(18)).resolves.toBe(18);
            await expect(schema.validate(25)).resolves.toBe(25);
            await expect(schema.validate(17)).rejects.toThrow();
        });

        it("should validate max value", async () => {
            const property = createNumberProperty({
                name: "Quantity",
                validation: { max: 100 }
            });
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate(100)).resolves.toBe(100);
            await expect(schema.validate(50)).resolves.toBe(50);
            await expect(schema.validate(101)).rejects.toThrow();
        });

        it("should validate min of 0", async () => {
            const property = createNumberProperty({
                name: "Count",
                validation: { min: 0 }
            });
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate(0)).resolves.toBe(0);
            await expect(schema.validate(-1)).rejects.toThrow();
        });

        it("should validate max of 0", async () => {
            const property = createNumberProperty({
                name: "Temperature",
                validation: { max: 0 }
            });
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate(0)).resolves.toBe(0);
            await expect(schema.validate(-10)).resolves.toBe(-10);
            await expect(schema.validate(1)).rejects.toThrow();
        });
    });

    describe("Number comparison validation", () => {
        it("should validate lessThan", async () => {
            const property = createNumberProperty({
                name: "Score",
                validation: { lessThan: 100 }
            });
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate(99)).resolves.toBe(99);
            await expect(schema.validate(100)).rejects.toThrow();
        });

        it("should validate moreThan", async () => {
            const property = createNumberProperty({
                name: "Price",
                validation: { moreThan: 0 }
            });
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate(1)).resolves.toBe(1);
            await expect(schema.validate(0)).rejects.toThrow();
        });

        it("should validate lessThan 0", async () => {
            const property = createNumberProperty({
                name: "Negative",
                validation: { lessThan: 0 }
            });
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate(-1)).resolves.toBe(-1);
            await expect(schema.validate(0)).rejects.toThrow();
        });

        it("should validate moreThan 0", async () => {
            const property = createNumberProperty({
                name: "Positive",
                validation: { moreThan: 0 }
            });
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate(0.001)).resolves.toBe(0.001);
            await expect(schema.validate(0)).rejects.toThrow();
        });
    });

    describe("Number type validation", () => {
        it("should validate positive numbers", async () => {
            const property = createNumberProperty({
                name: "Amount",
                validation: { positive: true }
            });
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate(1)).resolves.toBe(1);
            await expect(schema.validate(0)).rejects.toThrow();
            await expect(schema.validate(-1)).rejects.toThrow();
        });

        it("should validate negative numbers", async () => {
            const property = createNumberProperty({
                name: "Debt",
                validation: { negative: true }
            });
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate(-1)).resolves.toBe(-1);
            await expect(schema.validate(0)).rejects.toThrow();
            await expect(schema.validate(1)).rejects.toThrow();
        });

        it("should validate integers", async () => {
            const property = createNumberProperty({
                name: "Count",
                validation: { integer: true }
            });
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate(42)).resolves.toBe(42);
            await expect(schema.validate(0)).resolves.toBe(0);
            await expect(schema.validate(-10)).resolves.toBe(-10);
            await expect(schema.validate(3.14)).rejects.toThrow();
        });
    });
});

// ============================================================================
// BOOLEAN VALIDATION TESTS
// ============================================================================

describe("Boolean Validation", () => {

    it("should accept boolean values", async () => {
        const property = createBooleanProperty();
        const schema = mapPropertyToYup({
            property,
            entityId: "test-entity"
        });

        await expect(schema.validate(true)).resolves.toBe(true);
        await expect(schema.validate(false)).resolves.toBe(false);
        await expect(schema.validate(null)).resolves.toBe(null);
    });

    it("should reject null when required", async () => {
        const property = createBooleanProperty({
            validation: { required: true }
        });
        const schema = mapPropertyToYup({
            property,
            entityId: "test-entity"
        });

        await expect(schema.validate(true)).resolves.toBe(true);
        await expect(schema.validate(false)).resolves.toBe(false);
        await expect(schema.validate(null)).rejects.toThrow();
    });
});

// ============================================================================
// DATE VALIDATION TESTS
// ============================================================================

describe("Date Validation", () => {

    it("should accept Date objects", async () => {
        const property = createDateProperty();
        const schema = mapPropertyToYup({
            property,
            entityId: "test-entity"
        });

        const now = new Date();
        await expect(schema.validate(now)).resolves.toEqual(now);
        await expect(schema.validate(null)).resolves.toBe(null);
    });

    it("should reject null when required", async () => {
        const property = createDateProperty({
            validation: { required: true }
        });
        const schema = mapPropertyToYup({
            property,
            entityId: "test-entity"
        });

        const now = new Date();
        await expect(schema.validate(now)).resolves.toEqual(now);
        await expect(schema.validate(null)).rejects.toThrow();
    });

    it("should validate min date", async () => {
        const minDate = new Date("2024-01-01");
        const property = createDateProperty({
            name: "StartDate",
            validation: { min: minDate }
        });
        const schema = mapPropertyToYup({
            property,
            entityId: "test-entity"
        });

        await expect(schema.validate(new Date("2024-06-01"))).resolves.toBeDefined();
        await expect(schema.validate(new Date("2023-06-01"))).rejects.toThrow();
    });

    it("should validate max date", async () => {
        const maxDate = new Date("2024-12-31");
        const property = createDateProperty({
            name: "EndDate",
            validation: { max: maxDate }
        });
        const schema = mapPropertyToYup({
            property,
            entityId: "test-entity"
        });

        await expect(schema.validate(new Date("2024-06-01"))).resolves.toBeDefined();
        await expect(schema.validate(new Date("2025-01-01"))).rejects.toThrow();
    });

    it("should skip validation for autoValue dates", async () => {
        const property = createDateProperty({
            autoValue: "on_create"
        });
        const schema = mapPropertyToYup({
            property,
            entityId: "test-entity"
        });

        // autoValue dates should accept anything (they're auto-generated)
        await expect(schema.validate(null)).resolves.toBe(null);
    });

    it("should reject non-Date values", async () => {
        const property = createDateProperty();
        const schema = mapPropertyToYup({
            property,
            entityId: "test-entity"
        });

        // Non-Date strings that yup can't parse should be rejected
        await expect(schema.validate("not-a-date")).rejects.toThrow();
    });
});

// ============================================================================
// ARRAY VALIDATION TESTS
// ============================================================================

describe("Array Validation", () => {

    describe("Basic array validation", () => {
        it("should accept arrays", async () => {
            const property = createArrayProperty(createStringProperty());
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate(["a", "b", "c"])).resolves.toEqual(["a", "b", "c"]);
            await expect(schema.validate([])).resolves.toEqual([]);
            await expect(schema.validate(null)).resolves.toBe(null);
        });

        it("should reject null when required", async () => {
            const property = createArrayProperty(createStringProperty(), {
                validation: { required: true }
            });
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate(["a"])).resolves.toEqual(["a"]);
            await expect(schema.validate(null)).rejects.toThrow();
        });
    });

    describe("Array length validation", () => {
        it("should validate min length", async () => {
            const property = createArrayProperty(createStringProperty(), {
                name: "Tags",
                validation: { min: 2 }
            });
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate(["a", "b"])).resolves.toEqual(["a", "b"]);
            await expect(schema.validate(["a"])).rejects.toThrow();
        });

        it("should validate max length", async () => {
            const property = createArrayProperty(createStringProperty(), {
                name: "Tags",
                validation: { max: 3 }
            });
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate(["a", "b", "c"])).resolves.toEqual(["a", "b", "c"]);
            await expect(schema.validate(["a", "b", "c", "d"])).rejects.toThrow();
        });

        it("should validate min of 0", async () => {
            const property = createArrayProperty(createStringProperty(), {
                name: "Tags",
                validation: { min: 0 }
            });
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate([])).resolves.toEqual([]);
        });
    });

    describe("Array item validation", () => {
        it("should validate string items", async () => {
            const property = createArrayProperty(
                createStringProperty({ validation: { min: 2 } })
            );
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate(["ab", "cd"])).resolves.toEqual(["ab", "cd"]);
            await expect(schema.validate(["a"])).rejects.toThrow();
        });

        it("should validate number items", async () => {
            const property = createArrayProperty(
                createNumberProperty({ validation: { min: 0 } })
            );
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate([1, 2, 3])).resolves.toEqual([1, 2, 3]);
            await expect(schema.validate([-1])).rejects.toThrow();
        });
    });

    describe("Array uniqueInArray validation", () => {
        it("should reject duplicate primitive values", async () => {
            const property = createArrayProperty(
                createStringProperty({ validation: { uniqueInArray: true } }),
                { name: "Tags" }
            );
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate(["a", "b", "c"])).resolves.toEqual(["a", "b", "c"]);
            await expect(schema.validate(["a", "b", "a"])).rejects.toThrow();
        });

        it("should reject duplicate values in map property", async () => {
            const property = createArrayProperty(
                createMapProperty({
                    key: createStringProperty({ validation: { uniqueInArray: true }, name: "Key" }),
                    value: createStringProperty()
                }),
                { name: "Items" }
            );
            const schema = mapPropertyToYup({
                property,
                entityId: "test-entity"
            });

            await expect(schema.validate([
                { key: "a", value: "1" },
                { key: "b", value: "2" }
            ])).resolves.toBeDefined();

            await expect(schema.validate([
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
        const schema = mapPropertyToYup({
            property,
            entityId: "test-entity"
        });

        await expect(schema.validate({ name: "John", age: 30 })).resolves.toEqual({ name: "John", age: 30 });
        await expect(schema.validate({ name: "", age: 30 })).rejects.toThrow();
        await expect(schema.validate({ name: "John", age: -1 })).rejects.toThrow();
    });

    it("should accept null when not required", async () => {
        const property = createMapProperty({
            name: createStringProperty()
        });
        const schema = mapPropertyToYup({
            property,
            entityId: "test-entity"
        });

        await expect(schema.validate(null)).resolves.toBe(null);
    });

    it("should allow null for required map (original behavior)", async () => {
        const property = createMapProperty(
            { name: createStringProperty() },
            { validation: { required: true } }
        );
        const schema = mapPropertyToYup({
            property,
            entityId: "test-entity"
        });

        await expect(schema.validate({ name: "test" })).resolves.toBeDefined();
        // In yup v0.x, .required().nullable(true) allowed null values
        // This was the original behavior - null was considered valid for required fields
        await expect(schema.validate(null)).resolves.toBe(null);
    });

    it("should validate deeply nested maps", async () => {
        const property = createMapProperty({
            address: createMapProperty({
                street: createStringProperty({ validation: { required: true } }),
                city: createStringProperty({ validation: { required: true } })
            })
        });
        const schema = mapPropertyToYup({
            property,
            entityId: "test-entity"
        });

        await expect(schema.validate({
            address: { street: "123 Main St", city: "NYC" }
        })).resolves.toBeDefined();

        await expect(schema.validate({
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
        const schema = mapPropertyToYup({
            property,
            entityId: "test-entity"
        });

        const ref = { id: "user123", path: "users" };
        await expect(schema.validate(ref)).resolves.toEqual(ref);
        await expect(schema.validate(null)).resolves.toBe(null);
    });

    it("should reject null when required", async () => {
        const property = createReferenceProperty("users", {
            validation: { required: true }
        });
        const schema = mapPropertyToYup({
            property,
            entityId: "test-entity"
        });

        await expect(schema.validate({ id: "user123", path: "users" })).resolves.toBeDefined();
        await expect(schema.validate(null)).rejects.toThrow();
    });
});

// ============================================================================
// GEOPOINT VALIDATION TESTS
// ============================================================================

describe("GeoPoint Validation", () => {

    it("should accept geopoint objects", async () => {
        const property = createGeoPointProperty();
        const schema = mapPropertyToYup({
            property,
            entityId: "test-entity"
        });

        const geo = { latitude: 40.7128, longitude: -74.0060 };
        await expect(schema.validate(geo)).resolves.toEqual(geo);
        await expect(schema.validate(null)).resolves.toBe(null);
    });

    it("should reject null when required", async () => {
        const property = createGeoPointProperty({
            validation: { required: true }
        });
        const schema = mapPropertyToYup({
            property,
            entityId: "test-entity"
        });

        await expect(schema.validate({ latitude: 40.7128, longitude: -74.0060 })).resolves.toBeDefined();
        await expect(schema.validate(null)).rejects.toThrow();
    });
});

// ============================================================================
// ENTITY SCHEMA TESTS
// ============================================================================

describe("getYupEntitySchema", () => {

    it("should create a complete entity schema", async () => {
        const properties: ResolvedProperties = {
            title: createStringProperty({ validation: { required: true } }),
            count: createNumberProperty({ validation: { min: 0 } }),
            active: createBooleanProperty(),
            tags: createArrayProperty(createStringProperty())
        };

        const schema = getYupEntitySchema("entity-id", properties);

        await expect(schema.validate({
            title: "Test",
            count: 10,
            active: true,
            tags: ["a", "b"]
        })).resolves.toBeDefined();

        await expect(schema.validate({
            title: "",
            count: 10,
            active: true,
            tags: []
        })).rejects.toThrow();
    });

    it("should validate complex nested entities", async () => {
        const properties: ResolvedProperties = {
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

        const schema = getYupEntitySchema("entity-id", properties);

        await expect(schema.validate({
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

        const properties: ResolvedProperties = {
            slug: createStringProperty({ validation: { unique: true } })
        };

        const schema = getYupEntitySchema("entity-id", properties, customValidator);

        await schema.validate({ slug: "test-slug" });

        expect(customValidator).toHaveBeenCalled();
    });
});

// ============================================================================
// ERROR HANDLING TESTS
// ============================================================================

describe("Error Handling", () => {

    it("should throw for unsupported data types", () => {
        const property = { dataType: "unsupported" } as any;

        expect(() => mapPropertyToYup({
            property,
            entityId: "test-entity"
        })).toThrow("Unsupported data type in yup mapping");
    });

    it("should throw for property builders (unresolved properties)", () => {
        const propertyBuilder = () => ({ dataType: "string" });

        expect(() => mapPropertyToYup({
            property: propertyBuilder as any,
            entityId: "test-entity"
        })).toThrow("Trying to create a yup mapping from a property builder");
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
        const schema = mapPropertyToYup({
            property,
            entityId: "test-entity"
        });

        // Valid: lowercase, within length, matches pattern
        await expect(schema.validate("  john_doe123  ")).resolves.toBe("john_doe123");

        // Invalid: too short
        await expect(schema.validate("ab")).rejects.toThrow();

        // Invalid: contains invalid chars
        await expect(schema.validate("John-Doe")).rejects.toThrow();
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
        const schema = mapPropertyToYup({
            property,
            entityId: "test-entity"
        });

        await expect(schema.validate(50)).resolves.toBe(50);
        await expect(schema.validate(0)).resolves.toBe(0);
        await expect(schema.validate(100)).resolves.toBe(100);
        await expect(schema.validate(-1)).rejects.toThrow();
        await expect(schema.validate(101)).rejects.toThrow();
        await expect(schema.validate(50.5)).rejects.toThrow();
        await expect(schema.validate(null)).rejects.toThrow();
    });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe("Edge Cases", () => {

    it("should handle empty properties object", async () => {
        const schema = getYupEntitySchema("entity-id", {});

        await expect(schema.validate({})).resolves.toEqual({});
    });

    it("should handle undefined validation object", async () => {
        const property = createStringProperty({
            validation: undefined
        });
        const schema = mapPropertyToYup({
            property,
            entityId: "test-entity"
        });

        await expect(schema.validate("anything")).resolves.toBe("anything");
        await expect(schema.validate(null)).resolves.toBe(null);
    });

    it("should handle empty array of enum values", async () => {
        const property = createStringProperty({
            enumValues: []
        });
        const schema = mapPropertyToYup({
            property,
            entityId: "test-entity"
        });

        // Empty enum should only accept null
        await expect(schema.validate(null)).resolves.toBe(null);
        await expect(schema.validate("anything")).rejects.toThrow();
    });

    it("should handle array with undefined of property", async () => {
        const property: ResolvedArrayProperty = {
            dataType: "array",
            of: undefined as any
        };
        const schema = mapPropertyToYup({
            property,
            entityId: "test-entity"
        });

        // Should still work as a basic array
        await expect(schema.validate(["anything"])).resolves.toEqual(["anything"]);
    });
});
