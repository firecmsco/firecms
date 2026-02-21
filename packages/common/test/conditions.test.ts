import {
    applyPropertyConditions,
    buildConditionContext,
    evaluateCondition,
    registerConditionOperations
} from "../conditions";
import { ConditionContext, ResolvedProperty } from "../../types";

describe("Property Conditions", () => {

    beforeAll(() => {
        registerConditionOperations();
    });

    describe("evaluateCondition", () => {

        it("should evaluate simple equality", () => {
            const context: ConditionContext = {
                values: { status: "archived" },
                previousValues: {},
                propertyValue: undefined,
                path: "products",
                entityId: "123",
                isNew: false,
                user: { uid: "user1", email: null, displayName: null, photoURL: null, roles: [] },
                now: Date.now()
            };

            const rule = { "==": [{ "var": "values.status" }, "archived"] };
            expect(evaluateCondition(rule, context)).toBe(true);
        });

        it("should evaluate var access to nested values", () => {
            const context: ConditionContext = {
                values: { shipping: { method: "pickup" } },
                previousValues: {},
                propertyValue: undefined,
                path: "orders",
                isNew: false,
                user: { uid: "user1", email: null, displayName: null, photoURL: null, roles: [] },
                now: Date.now()
            };

            const rule = { "==": [{ "var": "values.shipping.method" }, "pickup"] };
            expect(evaluateCondition(rule, context)).toBe(true);
        });

        it("should check isNew status", () => {
            const contextNew: ConditionContext = {
                values: {},
                previousValues: {},
                propertyValue: undefined,
                path: "products",
                isNew: true,
                user: { uid: "user1", email: null, displayName: null, photoURL: null, roles: [] },
                now: Date.now()
            };

            const rule = { "var": "isNew" };
            expect(evaluateCondition(rule, contextNew)).toBe(true);

            const contextExisting: ConditionContext = {
                ...contextNew,
                entityId: "123",
                isNew: false
            };
            expect(evaluateCondition(rule, contextExisting)).toBe(false);
        });

        it("should handle if/then/else with object values (Firestore workaround)", () => {
            const context: ConditionContext = {
                values: { status: "active" },
                previousValues: {},
                propertyValue: undefined,
                path: "products",
                isNew: false,
                user: { uid: "user1", email: null, displayName: null, photoURL: null, roles: [] },
                now: Date.now()
            };

            // Firestore stores arrays as objects like {"0": "a", "1": "b"}
            const rule = {
                "if": [
                    { "==": [{ "var": "values.status" }, "active"] },
                    { "0": "electronics", "1": "clothing" },
                    { "0": "electronics", "1": "clothing", "2": "food" }
                ]
            };

            const result = evaluateCondition(rule, context);
            expect(result).toEqual({ "0": "electronics", "1": "clothing" });
        });

        it("should evaluate truthy operator (!!)", () => {
            const context: ConditionContext = {
                values: { name: "Product", emptyField: "" },
                previousValues: {},
                propertyValue: undefined,
                path: "products",
                isNew: false,
                user: { uid: "user1", email: null, displayName: null, photoURL: null, roles: [] },
                now: Date.now()
            };

            expect(evaluateCondition({ "!!": { "var": "values.name" } }, context)).toBe(true);
            expect(evaluateCondition({ "!!": { "var": "values.emptyField" } }, context)).toBe(false);
        });

        it("should evaluate falsy operator (!)", () => {
            const context: ConditionContext = {
                values: { name: "Product", emptyField: "" },
                previousValues: {},
                propertyValue: undefined,
                path: "products",
                isNew: false,
                user: { uid: "user1", email: null, displayName: null, photoURL: null, roles: [] },
                now: Date.now()
            };

            expect(evaluateCondition({ "!": { "var": "values.name" } }, context)).toBe(false);
            expect(evaluateCondition({ "!": { "var": "values.emptyField" } }, context)).toBe(true);
        });

        it("should evaluate greater than operator", () => {
            const context: ConditionContext = {
                values: { price: 100 },
                previousValues: {},
                propertyValue: undefined,
                path: "products",
                isNew: false,
                user: { uid: "user1", email: null, displayName: null, photoURL: null, roles: [] },
                now: Date.now()
            };

            expect(evaluateCondition({ ">": [{ "var": "values.price" }, 50] }, context)).toBe(true);
            expect(evaluateCondition({ ">": [{ "var": "values.price" }, 100] }, context)).toBe(false);
        });

        it("should evaluate in operator with array", () => {
            const context: ConditionContext = {
                values: { category: "electronics" },
                previousValues: {},
                propertyValue: undefined,
                path: "products",
                isNew: false,
                user: { uid: "user1", email: null, displayName: null, photoURL: null, roles: [] },
                now: Date.now()
            };

            expect(evaluateCondition({ "in": [{ "var": "values.category" }, ["electronics", "clothing"]] }, context)).toBe(true);
            expect(evaluateCondition({ "in": [{ "var": "values.category" }, ["food", "toys"]] }, context)).toBe(false);
        });
    });

    describe("Custom operations", () => {

        it("isPast should check if timestamp is in the past", () => {
            const context: ConditionContext = {
                values: {},
                previousValues: {},
                propertyValue: undefined,
                path: "products",
                isNew: false,
                user: { uid: "user1", email: null, displayName: null, photoURL: null, roles: [] },
                now: Date.now()
            };

            const pastTimestamp = Date.now() - 86400000;
            const futureTimestamp = Date.now() + 86400000;

            expect(evaluateCondition({ "isPast": pastTimestamp }, context)).toBe(true);
            expect(evaluateCondition({ "isPast": futureTimestamp }, context)).toBe(false);
        });

        it("isFuture should check if timestamp is in the future", () => {
            const context: ConditionContext = {
                values: {},
                previousValues: {},
                propertyValue: undefined,
                path: "products",
                isNew: false,
                user: { uid: "user1", email: null, displayName: null, photoURL: null, roles: [] },
                now: Date.now()
            };

            const pastTimestamp = Date.now() - 86400000;
            const futureTimestamp = Date.now() + 86400000;

            expect(evaluateCondition({ "isFuture": futureTimestamp }, context)).toBe(true);
            expect(evaluateCondition({ "isFuture": pastTimestamp }, context)).toBe(false);
        });
    });

    describe("applyPropertyConditions", () => {

        const baseContext: ConditionContext = {
            values: { status: "archived" },
            previousValues: {},
            propertyValue: undefined,
            path: "products",
            entityId: "123",
            isNew: false,
            user: { uid: "user1", email: null, displayName: null, photoURL: null, roles: ["admin"] },
            now: Date.now()
        };

        it("should apply disabled condition", () => {
            const property = {
                dataType: "string",
                name: "Title",
                resolved: true,
                fromBuilder: false,
                conditions: {
                    disabled: { "==": [{ "var": "values.status" }, "archived"] },
                    disabledMessage: "Cannot edit archived items"
                }
            } as ResolvedProperty<string>;

            const result = applyPropertyConditions(property, baseContext);

            expect(result.disabled).toEqual({
                clearOnDisabled: false,
                disabledMessage: "Cannot edit archived items",
                hidden: false
            });
        });

        it("should apply hidden condition", () => {
            const property = {
                dataType: "string",
                name: "Internal Notes",
                resolved: true,
                fromBuilder: false,
                conditions: {
                    hidden: { "==": [{ "var": "values.status" }, "archived"] }
                }
            } as ResolvedProperty<string>;

            const result = applyPropertyConditions(property, baseContext);

            expect(result.disabled).toEqual(expect.objectContaining({
                hidden: true
            }));
        });

        it("should apply required condition", () => {
            const property = {
                dataType: "string",
                name: "Email",
                resolved: true,
                fromBuilder: false,
                conditions: {
                    required: { "!!": { "var": "values.status" } }
                }
            } as ResolvedProperty<string>;

            const result = applyPropertyConditions(property, baseContext);

            expect(result.validation?.required).toBe(true);
        });

        it("should not apply disabled when condition is false", () => {
            const property = {
                dataType: "string",
                name: "Title",
                resolved: true,
                fromBuilder: false,
                conditions: {
                    disabled: { "==": [{ "var": "values.status" }, "draft"] }
                }
            } as ResolvedProperty<string>;

            const result = applyPropertyConditions(property, baseContext);

            expect(result.disabled).toBeUndefined();
        });

        it("should apply enum conditions to filter values", () => {
            const property = {
                dataType: "string",
                name: "Category",
                resolved: true,
                fromBuilder: false,
                enumValues: [
                    { id: "electronics", label: "Electronics" },
                    { id: "clothing", label: "Clothing" },
                    { id: "food", label: "Food" }
                ],
                conditions: {
                    allowedEnumValues: ["electronics", "clothing"]
                }
            } as any;

            const result = applyPropertyConditions(property, baseContext) as any;

            expect(result.enumValues).toHaveLength(2);
            expect(result.enumValues.map((e: any) => e.id)).toEqual(["electronics", "clothing"]);
        });

        it("should apply enum conditions with object format (Firestore workaround)", () => {
            const property = {
                dataType: "string",
                name: "Category",
                resolved: true,
                fromBuilder: false,
                enumValues: [
                    { id: "electronics", label: "Electronics" },
                    { id: "clothing", label: "Clothing" },
                    { id: "food", label: "Food" }
                ],
                conditions: {
                    allowedEnumValues: {
                        "if": [
                            { "!!": { "var": "values.status" } },
                            { "0": "electronics", "1": "clothing" },
                            { "0": "electronics", "1": "clothing", "2": "food" }
                        ]
                    }
                }
            } as any;

            const result = applyPropertyConditions(property, baseContext) as any;

            expect(result.enumValues).toHaveLength(2);
            expect(result.enumValues.map((e: any) => e.id)).toEqual(["electronics", "clothing"]);
        });

        it("should apply excludedEnumValues to remove specific values", () => {
            const property = {
                dataType: "string",
                name: "Status",
                resolved: true,
                fromBuilder: false,
                enumValues: [
                    { id: "draft", label: "Draft" },
                    { id: "published", label: "Published" },
                    { id: "archived", label: "Archived" }
                ],
                conditions: {
                    // Simple array of excluded values
                    excludedEnumValues: ["published"]
                }
            } as any;

            const result = applyPropertyConditions(property, baseContext) as any;

            expect(result.enumValues).toHaveLength(2);
            expect(result.enumValues.map((e: any) => e.id)).toEqual(["draft", "archived"]);
        });

        it("should apply enum conditions to disable specific values", () => {
            const property = {
                dataType: "string",
                name: "Status",
                resolved: true,
                fromBuilder: false,
                enumValues: [
                    { id: "draft", label: "Draft" },
                    { id: "published", label: "Published" },
                    { id: "archived", label: "Archived" }
                ],
                conditions: {
                    enumConditions: {
                        archived: {
                            disabled: { "!=": [{ "var": "values.status" }, "archived"] }
                        }
                    }
                }
            } as any;

            const result = applyPropertyConditions(property, baseContext) as any;
            const archivedOption = result.enumValues.find((e: any) => e.id === "archived");
            expect(archivedOption.disabled).toBeFalsy();

            const contextDraft = { ...baseContext, values: { status: "draft" } };
            const resultDraft = applyPropertyConditions(property, contextDraft) as any;
            const archivedOptionDraft = resultDraft.enumValues.find((e: any) => e.id === "archived");
            expect(archivedOptionDraft.disabled).toBe(true);
        });

        it("should handle multiple conditions together", () => {
            const property = {
                dataType: "string",
                name: "Notes",
                resolved: true,
                fromBuilder: false,
                conditions: {
                    disabled: { "==": [{ "var": "values.status" }, "archived"] },
                    required: { "==": [{ "var": "values.status" }, "published"] },
                    disabledMessage: "Cannot edit notes on archived items"
                }
            } as ResolvedProperty<string>;

            const resultArchived = applyPropertyConditions(property, baseContext);
            expect(resultArchived.disabled).toBeDefined();
            expect(resultArchived.validation?.required).toBeFalsy();

            const contextPublished = { ...baseContext, values: { status: "published" } };
            const resultPublished = applyPropertyConditions(property, contextPublished);
            expect(resultPublished.disabled).toBeUndefined();
            expect(resultPublished.validation?.required).toBe(true);
        });

        it("should handle clearOnDisabled option", () => {
            const property = {
                dataType: "string",
                name: "Title",
                resolved: true,
                fromBuilder: false,
                conditions: {
                    disabled: { "==": [{ "var": "values.status" }, "archived"] },
                    clearOnDisabled: true
                }
            } as ResolvedProperty<string>;

            const result = applyPropertyConditions(property, baseContext);

            expect(result.disabled).toEqual(expect.objectContaining({
                clearOnDisabled: true
            }));
        });
    });

    describe("buildConditionContext", () => {

        it("should build context with serialized dates", () => {
            const mockAuthController = {
                user: {
                    uid: "user123",
                    email: "test@example.com",
                    displayName: "Test User",
                    photoURL: null,
                    providerId: "google.com",
                    isAnonymous: false,
                    roles: [{ id: "admin", name: "Admin" }, { id: "editor", name: "Editor" }]
                }
            };

            const now = new Date();
            const context = buildConditionContext({
                propertyKey: "title",
                values: { title: "Hello", createdAt: now },
                path: "products",
                entityId: "123",
                authController: mockAuthController as any
            });

            expect(context.values.createdAt).toBe(now.getTime());
            expect(context.user.uid).toBe("user123");
            expect(context.user.roles).toEqual(["admin", "editor"]);
            expect(context.isNew).toBe(false);
            expect(context.entityId).toBe("123");
        });

        it("should mark isNew as true when no entityId", () => {
            const mockAuthController = {
                user: null
            };

            const context = buildConditionContext({
                path: "products",
                authController: mockAuthController as any
            });

            expect(context.isNew).toBe(true);
            expect(context.entityId).toBeUndefined();
        });

        it("should handle user with Role object roles", () => {
            const mockAuthController = {
                user: {
                    uid: "user123",
                    email: "test@example.com",
                    displayName: "Test User",
                    photoURL: null,
                    roles: [{ id: "admin", name: "Admin" }, { id: "editor", name: "Editor" }]
                }
            };

            const context = buildConditionContext({
                path: "products",
                entityId: "123",
                authController: mockAuthController as any
            });

            // Roles are mapped from Role.id
            expect(context.user.roles).toEqual(["admin", "editor"]);
        });

        it("should handle null user", () => {
            const mockAuthController = {
                user: null
            };

            const context = buildConditionContext({
                path: "products",
                authController: mockAuthController as any
            });

            expect(context.user).toBeDefined();
            // uid defaults to empty string when user is null
            expect(context.user.uid).toBe("");
            expect(context.user.roles).toEqual([]);
        });
    });
});
