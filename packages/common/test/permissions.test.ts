import {
    canReadCollection,
    canEditEntity,
    canCreateEntity,
    canDeleteEntity,
} from "../src/util/permissions";
import { AuthController, Entity, EntityCollection, SecurityRule, User } from "@rebasepro/types";

// ── Helpers ──────────────────────────────────────────────────

function makeAuthController(overrides: Partial<{ uid: string; roles: string[] }> = {}): AuthController<User> {
    const user: User = {
        uid: overrides.uid ?? "user-1",
        email: "test@example.com",
        displayName: "Test",
        photoURL: null,
        roles: overrides.roles ?? [],
    };
    return { user } as AuthController<User>;
}

function noUser(): AuthController<User> {
    return { user: null } as AuthController<User>;
}

function makeCollection(securityRules?: SecurityRule[]): EntityCollection {
    return {
        name: "Products",
        slug: "products",
        dbPath: "products",
        properties: {},
        securityRules,
    };
}

function makeEntity(values: Record<string, unknown> = {}): Entity<any> {
    return { id: "ent-1", path: "products", values };
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

describe("Permissions — Security Rule Evaluation", () => {

    // ── No rules (default) ──────────────────────────────────
    describe("no security rules", () => {
        it("allows all operations when securityRules is undefined", () => {
            const col = makeCollection(undefined);
            const auth = makeAuthController();
            expect(canReadCollection(col, auth)).toBe(true);
            expect(canCreateEntity(col, auth, "products", null)).toBe(true);
            expect(canEditEntity(col, auth, "products", makeEntity())).toBe(true);
            expect(canDeleteEntity(col, auth, "products", makeEntity())).toBe(true);
        });

        it("allows all operations when securityRules is empty array", () => {
            const col = makeCollection([]);
            const auth = makeAuthController();
            expect(canReadCollection(col, auth)).toBe(true);
            expect(canCreateEntity(col, auth, "products", null)).toBe(true);
        });
    });

    // ── Public access ───────────────────────────────────────
    describe("public access rules", () => {
        it("allows reads for public access rule", () => {
            const col = makeCollection([
                { access: "public", operation: "select" } as SecurityRule,
            ]);
            expect(canReadCollection(col, noUser())).toBe(true);
        });

        it("allows writes for public access rule", () => {
            const col = makeCollection([
                { access: "public", operation: "all" } as SecurityRule,
            ]);
            expect(canCreateEntity(col, noUser(), "products", null)).toBe(true);
        });
    });

    // ── Role-based rules ────────────────────────────────────
    describe("role-based rules", () => {
        it("grants access when user has a matching role", () => {
            const col = makeCollection([
                { roles: ["admin"], operation: "all", mode: "permissive" } as SecurityRule,
            ]);
            const admin = makeAuthController({ roles: ["admin"] });
            expect(canReadCollection(col, admin)).toBe(true);
            expect(canCreateEntity(col, admin, "products", null)).toBe(true);
            expect(canEditEntity(col, admin, "products", makeEntity())).toBe(true);
            expect(canDeleteEntity(col, admin, "products", makeEntity())).toBe(true);
        });

        it("denies access when user lacks matching role", () => {
            const col = makeCollection([
                { roles: ["admin"], operation: "all", mode: "permissive" } as SecurityRule,
            ]);
            const viewer = makeAuthController({ roles: ["viewer"] });
            expect(canReadCollection(col, viewer)).toBe(false);
            expect(canCreateEntity(col, viewer, "products", null)).toBe(false);
        });

        it("handles multiple roles — grants if user matches any", () => {
            const col = makeCollection([
                { roles: ["admin", "editor"], operation: "all", mode: "permissive" } as SecurityRule,
            ]);
            const editor = makeAuthController({ roles: ["editor"] });
            expect(canReadCollection(col, editor)).toBe(true);
        });

        it("handles multi-operation rules via operations array", () => {
            const col = makeCollection([
                { roles: ["editor"], operations: ["select", "update"], mode: "permissive" } as SecurityRule,
            ]);
            const editor = makeAuthController({ roles: ["editor"] });
            expect(canReadCollection(col, editor)).toBe(true);
            expect(canEditEntity(col, editor, "products", makeEntity())).toBe(true);
            expect(canDeleteEntity(col, editor, "products", makeEntity())).toBe(false);
        });
    });

    // ── Owner-based rules ───────────────────────────────────
    describe("owner-based rules", () => {
        it("allows when entity owner matches user", () => {
            const col = makeCollection([
                { ownerField: "created_by", operation: "update", mode: "permissive" } as SecurityRule,
            ]);
            const auth = makeAuthController({ uid: "user-42" });
            const entity = makeEntity({ created_by: "user-42" });
            expect(canEditEntity(col, auth, "products", entity)).toBe(true);
        });

        it("denies when entity owner does not match user", () => {
            const col = makeCollection([
                { ownerField: "created_by", operation: "update", mode: "permissive" } as SecurityRule,
            ]);
            const auth = makeAuthController({ uid: "user-42" });
            const entity = makeEntity({ created_by: "other-user" });
            expect(canEditEntity(col, auth, "products", entity)).toBe(false);
        });

        it("optimistically allows when entity is null (new entity)", () => {
            const col = makeCollection([
                { ownerField: "created_by", operation: "select", mode: "permissive" } as SecurityRule,
            ]);
            const auth = makeAuthController({ uid: "user-42" });
            expect(canReadCollection(col, auth)).toBe(true);
        });
    });

    // ── Restrictive mode ────────────────────────────────────
    describe("restrictive mode", () => {
        it("denies when restrictive rule fails even if permissive passes", () => {
            const col = makeCollection([
                // Permissive: admin can do anything
                { roles: ["admin"], operation: "update", mode: "permissive" } as SecurityRule,
                // Restrictive: but only owner can update
                { ownerField: "created_by", operation: "update", mode: "restrictive" } as SecurityRule,
            ]);
            const admin = makeAuthController({ uid: "admin-1", roles: ["admin"] });
            const entity = makeEntity({ created_by: "someone-else" });
            expect(canEditEntity(col, admin, "products", entity)).toBe(false);
        });

        it("allows when both permissive AND restrictive pass", () => {
            const col = makeCollection([
                { roles: ["admin"], operation: "update", mode: "permissive" } as SecurityRule,
                { ownerField: "created_by", operation: "update", mode: "restrictive" } as SecurityRule,
            ]);
            const admin = makeAuthController({ uid: "admin-1", roles: ["admin"] });
            const entity = makeEntity({ created_by: "admin-1" });
            expect(canEditEntity(col, admin, "products", entity)).toBe(true);
        });
    });

    // ── RLS SQL AST evaluation ──────────────────────────────
    describe("RLS SQL USING/WITH CHECK evaluation", () => {
        it("evaluates simple auth.uid() comparison", () => {
            const col = makeCollection([
                {
                    operation: "update",
                    mode: "permissive",
                    using: "user_id = auth.uid()",
                } as SecurityRule,
            ]);
            const auth = makeAuthController({ uid: "user-99" });
            const entity = makeEntity({ user_id: "user-99" });
            expect(canEditEntity(col, auth, "products", entity)).toBe(true);
        });

        it("denies when auth.uid() does not match", () => {
            const col = makeCollection([
                {
                    operation: "update",
                    mode: "permissive",
                    using: "user_id = auth.uid()",
                } as SecurityRule,
            ]);
            const auth = makeAuthController({ uid: "user-99" });
            const entity = makeEntity({ user_id: "someone-else" });
            expect(canEditEntity(col, auth, "products", entity)).toBe(false);
        });

        it("evaluates current_setting('app.user_id') pattern", () => {
            const col = makeCollection([
                {
                    operation: "update",
                    mode: "permissive",
                    using: "owner_id = current_setting('app.user_id')",
                } as SecurityRule,
            ]);
            const auth = makeAuthController({ uid: "usr-123" });
            const entity = makeEntity({ owner_id: "usr-123" });
            expect(canEditEntity(col, auth, "products", entity)).toBe(true);
        });

        it("evaluates role intersection (&&)", () => {
            const col = makeCollection([
                {
                    operation: "update",
                    mode: "permissive",
                    using: "string_to_array(auth.roles(), ',') && ARRAY['admin', 'editor']",
                } as SecurityRule,
            ]);
            const entity = makeEntity({ some: "data" });
            const editor = makeAuthController({ roles: ["editor"] });
            expect(canEditEntity(col, editor, "products", entity)).toBe(true);

            const viewer = makeAuthController({ roles: ["viewer"] });
            expect(canEditEntity(col, viewer, "products", entity)).toBe(false);
        });

        it("evaluates role containment (@>)", () => {
            const col = makeCollection([
                {
                    operation: "update",
                    mode: "permissive",
                    using: "string_to_array(auth.roles(), ',') @> ARRAY['admin']",
                } as SecurityRule,
            ]);
            const entity = makeEntity({ some: "data" });
            const admin = makeAuthController({ roles: ["admin", "editor"] });
            expect(canEditEntity(col, admin, "products", entity)).toBe(true);

            const editor = makeAuthController({ roles: ["editor"] });
            expect(canEditEntity(col, editor, "products", entity)).toBe(false);
        });

        it("evaluates AND in SQL using", () => {
            const col = makeCollection([
                {
                    operation: "update",
                    mode: "permissive",
                    using: "user_id = auth.uid() AND status = 'draft'",
                } as SecurityRule,
            ]);
            const auth = makeAuthController({ uid: "u1" });
            const draftEntity = makeEntity({ user_id: "u1", status: "draft" });
            expect(canEditEntity(col, auth, "products", draftEntity)).toBe(true);

            const publishedEntity = makeEntity({ user_id: "u1", status: "published" });
            expect(canEditEntity(col, auth, "products", publishedEntity)).toBe(false);
        });

        it("evaluates OR in SQL using", () => {
            const col = makeCollection([
                {
                    operation: "update",
                    mode: "permissive",
                    using: "status = 'published' OR user_id = auth.uid()",
                } as SecurityRule,
            ]);
            const auth = makeAuthController({ uid: "u1" });
            // Published — anyone can edit
            const pub = makeEntity({ status: "published", user_id: "other" });
            expect(canEditEntity(col, auth, "products", pub)).toBe(true);
            // Draft owned by user
            const own = makeEntity({ status: "draft", user_id: "u1" });
            expect(canEditEntity(col, auth, "products", own)).toBe(true);
            // Draft not owned
            const other = makeEntity({ status: "draft", user_id: "x" });
            expect(canEditEntity(col, auth, "products", other)).toBe(false);
        });

        it("evaluates withCheck for insert operations", () => {
            const col = makeCollection([
                {
                    operation: "insert",
                    mode: "permissive",
                    withCheck: "user_id = auth.uid()",
                } as SecurityRule,
            ]);
            const auth = makeAuthController({ uid: "u1" });
            const entity = makeEntity({ user_id: "u1" });
            expect(canCreateEntity(col, auth, "products", entity)).toBe(true);

            const badEntity = makeEntity({ user_id: "other" });
            expect(canCreateEntity(col, auth, "products", badEntity)).toBe(false);
        });
    });

    // ── Edge cases ──────────────────────────────────────────
    describe("edge cases", () => {
        it("denies when rules exist for different operations", () => {
            const col = makeCollection([
                { operation: "select", mode: "permissive" } as SecurityRule,
            ]);
            const auth = makeAuthController();
            // select should pass
            expect(canReadCollection(col, auth)).toBe(true);
            // insert should fail (no applicable rule)
            expect(canCreateEntity(col, auth, "products", null)).toBe(false);
        });

        it("handles user with no roles (falls back to 'public')", () => {
            const col = makeCollection([
                { roles: ["public"], operation: "select", mode: "permissive" } as SecurityRule,
            ]);
            const auth = makeAuthController({ roles: [] });
            expect(canReadCollection(col, auth)).toBe(true);
        });

        it("handles complex nested parentheses in SQL", () => {
            const col = makeCollection([
                {
                    operation: "select",
                    mode: "permissive",
                    using: "((status = 'published'))",
                } as SecurityRule,
            ]);
            const auth = makeAuthController();
            const entity = makeEntity({ status: "published" });
            expect(canReadCollection(col, auth)).toBe(true);
        });

        it("optimistically allows IN / EXISTS queries (fallback)", () => {
            const col = makeCollection([
                {
                    operation: "select",
                    mode: "permissive",
                    using: "id IN (SELECT product_id FROM featured_products)",
                } as SecurityRule,
            ]);
            const auth = makeAuthController();
            // Should optimistically return true since we can't evaluate IN
            expect(canReadCollection(col, auth)).toBe(true);
        });
    });
});
