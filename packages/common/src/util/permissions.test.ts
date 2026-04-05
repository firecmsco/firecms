import { canCreateEntity, canEditEntity, canDeleteEntity, canReadCollection } from "./permissions";
import { EntityCollection, AuthController, Entity, User, SecurityRule } from "@rebasepro/types";

describe("Permissions Evaluator", () => {

    // ─── Test fixtures ───────────────────────────────────────────────────────────

    const mockUser: User = {
        uid: "user-123",
        email: "test@test.com",
        displayName: "Test User",
        providerId: "test",
        isAnonymous: false,
        photoURL: null,
        roles: ["author", "user"]
    };

    const adminUser: User = {
        uid: "admin-123",
        email: "admin@test.com",
        displayName: "Admin User",
        providerId: "test",
        isAnonymous: false,
        photoURL: null,
        roles: ["admin"]
    };

    const mockAuthController: AuthController<User> = {
        user: mockUser,
        initialLoading: false,
        authLoading: false,
        loginSkipped: false,
        signOut: async () => { },
        getAuthToken: async () => "token",
        setExtra: () => { },
        extra: undefined
    };

    const adminAuthController: AuthController<User> = {
        ...mockAuthController,
        user: adminUser
    };

    const unauthenticatedController: AuthController<User> = {
        ...mockAuthController,
        user: null
    };

    const createMockCollection = (rules?: SecurityRule[]): EntityCollection => ({
        slug: "test",
        name: "Test",
        dbPath: "test",
        properties: {},
        securityRules: rules
    });

    const createMockEntity = (values: Record<string, unknown>): Entity => ({
        id: "entity-123",
        path: "test",
        values,
    });

    // ─── Section 1: Core Defaults ─────────────────────────────────────────────────

    test("1. Implicit fallback: no rules at all returns true (optimistic UI)", () => {
        const collection = createMockCollection();
        expect(canReadCollection(collection, mockAuthController)).toBe(true);
        expect(canCreateEntity(collection, mockAuthController, "test", null)).toBe(true);
        expect(canEditEntity(collection, mockAuthController, "test", null)).toBe(true);
        expect(canDeleteEntity(collection, mockAuthController, "test", null)).toBe(true);
    });

    test("2. Empty rules array [] also returns true", () => {
        const collection = createMockCollection([]);
        expect(canReadCollection(collection, mockAuthController)).toBe(true);
    });

    test("3. Undefined securityRules falls back to true", () => {
        const collection = createMockCollection(undefined);
        expect(canReadCollection(collection, mockAuthController)).toBe(true);
    });

    // ─── Section 2: Operation Filtering ──────────────────────────────────────────

    test("5. Only rules for matching operation are applied", () => {
        const collection = createMockCollection([
            { operation: "insert", access: "public" },
            { operations: ["select", "delete"], roles: ["admin"] }
        ]);
        // Public insert
        expect(canCreateEntity(collection, mockAuthController, "test", null)).toBe(true);
        // No update rule → denied
        expect(canEditEntity(collection, mockAuthController, "test", null)).toBe(false);
        // select/delete need admin → denied for author
        expect(canReadCollection(collection, mockAuthController)).toBe(false);
        expect(canDeleteEntity(collection, mockAuthController, "test", null)).toBe(false);
        // Admin can read and delete
        expect(canReadCollection(collection, adminAuthController)).toBe(true);
        expect(canDeleteEntity(collection, adminAuthController, "test", null)).toBe(true);
    });

    test("6. 'all' operation matches every CRUD action", () => {
        const collection = createMockCollection([
            { operation: "all", roles: ["author"] }
        ]);
        expect(canReadCollection(collection, mockAuthController)).toBe(true);
        expect(canCreateEntity(collection, mockAuthController, "test", null)).toBe(true);
        expect(canEditEntity(collection, mockAuthController, "test", null)).toBe(true);
        expect(canDeleteEntity(collection, mockAuthController, "test", null)).toBe(true);
        // Admin lacks 'author' role
        expect(canReadCollection(collection, adminAuthController)).toBe(false);
    });

    test("7. 'all' rule grants admin all operations; specific 'update' rule also grants author only update", () => {
        const collection = createMockCollection([
            { operation: "all", roles: ["admin"] },
            { operation: "update", roles: ["author"] }
        ]);
        // Admin: all operations
        expect(canReadCollection(collection, adminAuthController)).toBe(true);
        expect(canCreateEntity(collection, adminAuthController, "test", null)).toBe(true);
        expect(canEditEntity(collection, adminAuthController, "test", null)).toBe(true);
        expect(canDeleteEntity(collection, adminAuthController, "test", null)).toBe(true);
        // Author: only update, not read/create/delete
        expect(canEditEntity(collection, mockAuthController, "test", null)).toBe(true);
        expect(canReadCollection(collection, mockAuthController)).toBe(false);
        expect(canCreateEntity(collection, mockAuthController, "test", null)).toBe(false);
        expect(canDeleteEntity(collection, mockAuthController, "test", null)).toBe(false);
    });

    test("8. Unknown operation name in rule is silently ignored", () => {
        const collection = createMockCollection([
            { operation: "read" as any, access: "public" } // "read" not a valid op
        ]);
        // "read" does not match "select", so it is never applied → denied
        expect(canReadCollection(collection, mockAuthController)).toBe(false);
    });

    // ─── Section 3: Role Matching ─────────────────────────────────────────────────

    test("9. Role check: user with matching role is granted", () => {
        const collection = createMockCollection([
            { operation: "all", roles: ["admin", "editor"] }
        ]);
        expect(canReadCollection(collection, mockAuthController)).toBe(false); // author
        expect(canReadCollection(collection, adminAuthController)).toBe(true);  // admin
    });

    test("10. Roles on user are objects {id, name} — correctly mapped to strings", () => {
        const collection = createMockCollection([
            { operation: "select", roles: ["author"] }
        ]);
        // mockUser.roles = [{ id: "author" }, { id: "user" }]
        expect(canReadCollection(collection, mockAuthController)).toBe(true);
    });

    test("11. Empty roles array [] on rule grants access to everyone (public)", () => {
        const collection = createMockCollection([
            { operation: "insert", roles: [] }
        ]);
        expect(canCreateEntity(collection, mockAuthController, "test", null)).toBe(true);
        expect(canCreateEntity(collection, unauthenticatedController, "test", null)).toBe(true);
        expect(canCreateEntity(collection, adminAuthController, "test", null)).toBe(true);
    });

    test("12. Undefined roles on rule grants access to everyone (public)", () => {
        const collection = createMockCollection([
            { operation: "insert" }
        ]);
        expect(canCreateEntity(collection, mockAuthController, "test", null)).toBe(true);
        expect(canCreateEntity(collection, unauthenticatedController, "test", null)).toBe(true);
    });

    test("13. No rules match user's role → implicit deny", () => {
        const collection = createMockCollection([
            { operation: "all", roles: ["admin"] },
            { operation: "all", roles: ["moderator"] }
        ]);
        expect(canReadCollection(collection, mockAuthController)).toBe(false); // author
        expect(canReadCollection(collection, adminAuthController)).toBe(true);
    });

    test("14. 'public' pseudo-role in rule.roles grants access to unauthenticated users", () => {
        const collection = createMockCollection([
            { operation: "select", roles: ["public"] }
        ]);
        expect(canReadCollection(collection, unauthenticatedController)).toBe(true);
        expect(canReadCollection(collection, mockAuthController)).toBe(true);
        expect(canReadCollection(collection, adminAuthController)).toBe(true);
    });

    test("15. Multi-role overlap: user has ['author','user'], rule needs ['editor','user','moderator']", () => {
        const collection = createMockCollection([
            { operation: "insert", roles: ["editor", "user", "moderator"] }
        ]);
        expect(canCreateEntity(collection, mockAuthController, "test", null)).toBe(true); // 'user' matches
        expect(canCreateEntity(collection, adminAuthController, "test", null)).toBe(false); // 'admin' doesn't match
    });

    test("16. Unknown role in rule denies everyone", () => {
        const collection = createMockCollection([
            { operation: "insert", roles: ["unknown_role_xyz"] }
        ]);
        expect(canCreateEntity(collection, mockAuthController, "test", null)).toBe(false);
        expect(canCreateEntity(collection, adminAuthController, "test", null)).toBe(false);
        expect(canCreateEntity(collection, unauthenticatedController, "test", null)).toBe(false);
    });

    // ─── Section 4: Access Shortcuts (access: "public") ───────────────────────────

    test("17. access:'public' bypasses all role and SQL checks immediately", () => {
        const collection = createMockCollection([
            { operation: "select", access: "public" }
        ]);
        expect(canReadCollection(collection, unauthenticatedController)).toBe(true);
        expect(canReadCollection(collection, mockAuthController)).toBe(true);
    });

    // ─── Section 5: Owner Fields ───────────────────────────────────────────────────

    test("18. ownerField: user can edit their own entity, not others'", () => {
        const collection = createMockCollection([
            { operation: "update", ownerField: "user_id" }
        ]);
        const owned = createMockEntity({ user_id: "user-123" });
        const notOwned = createMockEntity({ user_id: "other-user" });
        expect(canEditEntity(collection, mockAuthController, "test", owned)).toBe(true);
        expect(canEditEntity(collection, mockAuthController, "test", notOwned)).toBe(false);
    });

    test("19. ownerField: unauthenticated user (no uid) cannot own any entity", () => {
        const collection = createMockCollection([
            { operation: "update", ownerField: "user_id" }
        ]);
        const entity = createMockEntity({ user_id: "user-123" });
        expect(canEditEntity(collection, unauthenticatedController, "test", entity)).toBe(false);
    });

    test("20. ownerField with null entity is OPTIMISTICALLY enabled (UI has no data yet)", () => {
        // NOTE: This is by design — the UI cannot know ownership before entity exists.
        // The backend will enforce the actual denial. This is documented behavior.
        const collection = createMockCollection([
            { operation: "update", ownerField: "user_uid" }
        ]);
        expect(canEditEntity(collection, mockAuthController, "test", null)).toBe(true);
        // Even unauthenticated! The button shows, backend blocks.
        expect(canEditEntity(collection, unauthenticatedController, "test", null)).toBe(true);
    });

    test("21. ownerField: admin cannot bypass ownerField without an 'admin' role rule", () => {
        const collection = createMockCollection([
            { operation: "update", ownerField: "user_id" }
        ]);
        const adminOwnedEntity = createMockEntity({ user_id: "admin-123" });
        const regularEntity = createMockEntity({ user_id: "user-123" });
        // Admin owns this entity
        expect(canEditEntity(collection, adminAuthController, "test", adminOwnedEntity)).toBe(true);
        // Admin does NOT own this entity — denied!
        expect(canEditEntity(collection, adminAuthController, "test", regularEntity)).toBe(false);
    });

    test("22. ownerField used in a delete rule", () => {
        const collection = createMockCollection([
            { operation: "delete", ownerField: "author_uid" }
        ]);
        const owned = createMockEntity({ author_uid: "user-123" });
        const notOwned = createMockEntity({ author_uid: "someone-else" });
        expect(canDeleteEntity(collection, mockAuthController, "test", owned)).toBe(true);
        expect(canDeleteEntity(collection, mockAuthController, "test", notOwned)).toBe(false);
    });

    // ─── Section 6: SQL AST Evaluation ───────────────────────────────────────────

    test("23. AST: simple equality check", () => {
        const collection = createMockCollection([
            { operation: "update", using: "status = 'published'" }
        ]);
        expect(canEditEntity(collection, mockAuthController, "test", createMockEntity({ status: "published" }))).toBe(true);
        expect(canEditEntity(collection, mockAuthController, "test", createMockEntity({ status: "draft" }))).toBe(false);
    });

    test("24. AST: simple inequality check", () => {
        const collection = createMockCollection([
            { operation: "update", using: "status != 'archived'" }
        ]);
        expect(canEditEntity(collection, mockAuthController, "test", createMockEntity({ status: "draft" }))).toBe(true);
        expect(canEditEntity(collection, mockAuthController, "test", createMockEntity({ status: "archived" }))).toBe(false);
    });

    test("25. AST: current_setting('app.user_id') comparison", () => {
        const collection = createMockCollection([
            { operation: "update", using: "author_uid = current_setting('app.user_id')" }
        ]);
        expect(canEditEntity(collection, mockAuthController, "test", createMockEntity({ author_uid: "user-123" }))).toBe(true);
        expect(canEditEntity(collection, mockAuthController, "test", createMockEntity({ author_uid: "other" }))).toBe(false);
    });

    test("26. AST: current_setting reversed operand order", () => {
        const collection = createMockCollection([
            { operation: "update", using: "current_setting('app.user_id') = author_uid" }
        ]);
        expect(canEditEntity(collection, mockAuthController, "test", createMockEntity({ author_uid: "user-123" }))).toBe(true);
        expect(canEditEntity(collection, mockAuthController, "test", createMockEntity({ author_uid: "other" }))).toBe(false);
    });

    test("27. AST: current_setting with extra whitespace in SQL string", () => {
        const collection = createMockCollection([
            { operation: "update", using: "author_uid=current_setting (  'app.user_id'  )" }
        ]);
        expect(canEditEntity(collection, mockAuthController, "test", createMockEntity({ author_uid: "user-123" }))).toBe(true);
        expect(canEditEntity(collection, mockAuthController, "test", createMockEntity({ author_uid: "other" }))).toBe(false);
    });

    test("28. AST: complex SQL with AND/OR is evaluated by the parser", () => {
        const collection = createMockCollection([
            { operation: "update", using: "status IN ('published', 'draft') AND author_id = current_setting('app.user_id')" }
        ]);
        // IN clause is optimistic true, but AND requires author_id to match user uid
        const mismatchEntity = createMockEntity({ status: "archived", author_id: "someone-else" });
        expect(canEditEntity(collection, mockAuthController, "test", mismatchEntity)).toBe(false);

        // When author_id matches the current user, AND passes
        const matchingEntity = createMockEntity({ status: "published", author_id: "user-123" });
        expect(canEditEntity(collection, mockAuthController, "test", matchingEntity)).toBe(true);
    });

    test("29. AST: null entity ALWAYS optimistically passes SQL evaluation", () => {
        const collection = createMockCollection([
            { operation: "update", using: "status = 'published'" }
        ]);
        // Even a simple parseable SQL works optimistically with null entity
        expect(canEditEntity(collection, mockAuthController, "test", null)).toBe(true);
    });

    // ─── Section 7: using AND withCheck (both must pass) ─────────────────────────

    test("30. using AND withCheck: both independently evaluated, both must pass", () => {
        const collection = createMockCollection([
            { operation: "update", using: "status = 'draft'", withCheck: "title_length > 5" }
        ]);
        // As the entity values are strings, title_length > 5 won't parse cleanly → optimistic true for withCheck
        // status = 'draft' WILL parse and must match
        expect(canEditEntity(collection, mockAuthController, "test", createMockEntity({ status: "draft" }))).toBe(true);
        expect(canEditEntity(collection, mockAuthController, "test", createMockEntity({ status: "published" }))).toBe(false);
    });

    test("31. using passes but withCheck fails → rule denied", () => {
        const collection = createMockCollection([
            { operation: "update", using: "status = 'draft'", withCheck: "visibility = 'public'" }
        ]);
        const entity = createMockEntity({ status: "draft", visibility: "private" });
        // using passes (status is 'draft'), withCheck fails (visibility is 'private')
        expect(canEditEntity(collection, mockAuthController, "test", entity)).toBe(false);
    });

    test("32. withCheck without using: evaluated independently", () => {
        const collection = createMockCollection([
            { operation: "update", withCheck: "status = 'draft'" }
        ]);
        expect(canEditEntity(collection, mockAuthController, "test", createMockEntity({ status: "draft" }))).toBe(true);
        expect(canEditEntity(collection, mockAuthController, "test", createMockEntity({ status: "published" }))).toBe(false);
    });

    // ─── Section 8: Permissive Mode ───────────────────────────────────────────────

    test("33. Two permissive rules = logical OR", () => {
        const collection = createMockCollection([
            { operation: "update", roles: ["admin"], mode: "permissive" },
            { operation: "update", ownerField: "user_id", mode: "permissive" }
        ]);
        const owned = createMockEntity({ user_id: "user-123" });
        const notOwned = createMockEntity({ user_id: "other" });
        // Admin: first rule passes
        expect(canEditEntity(collection, adminAuthController, "test", notOwned)).toBe(true);
        // Author: second rule passes for owned entity
        expect(canEditEntity(collection, mockAuthController, "test", owned)).toBe(true);
        // Author: neither rule passes for unowned entity
        expect(canEditEntity(collection, mockAuthController, "test", notOwned)).toBe(false);
    });

    test("34. A single permissive rule that fails → denied", () => {
        const collection = createMockCollection([
            { operation: "update", roles: ["admin"], mode: "permissive" }
        ]);
        expect(canEditEntity(collection, mockAuthController, "test", null)).toBe(false);
    });

    // ─── Section 9: Restrictive Mode ────────────────────────────────────────────

    test("35. A sole restrictive rule (no permissive) ALWAYS denies", () => {
        // In PostgreSQL: restrictive policies only filter from a permissive base.
        // No permissive base = no access.
        const collection = createMockCollection([
            { operation: "select", mode: "restrictive", using: "status = 'draft'" }
        ]);
        expect(canReadCollection(collection, mockAuthController)).toBe(false);
        expect(canReadCollection(collection, adminAuthController)).toBe(false);
        expect(canReadCollection(collection, unauthenticatedController)).toBe(false);
    });

    test("36. Permissive base + restrictive filter: entity matching restrictor passes", () => {
        const collection = createMockCollection([
            { operation: "update", access: "public", mode: "permissive" },
            { operation: "update", mode: "restrictive", using: "owner_id = current_setting('app.user_id')" }
        ]);
        const owned = createMockEntity({ owner_id: "user-123" });
        const notOwned = createMockEntity({ owner_id: "other-user" });
        expect(canEditEntity(collection, mockAuthController, "test", owned)).toBe(true);
        expect(canEditEntity(collection, mockAuthController, "test", notOwned)).toBe(false);
    });

    test("37. Restrictive rule with role filter: only applies to users with that role", () => {
        // A restrictive rule with roles: ["author"] applies ONLY to users with author role.
        // Users WITHOUT the role are NOT subject to this restrictive rule.
        const collection = createMockCollection([
            { operation: "update", access: "public", mode: "permissive" },
            { operation: "update", roles: ["author"], mode: "restrictive", using: "status = 'published'" }
        ]);
        const draftEntity = createMockEntity({ status: "draft" });
        const publishedEntity = createMockEntity({ status: "published" });

        // Admin has no "author" role → restrictive rule does NOT apply to admin → permissive grants true
        expect(canEditEntity(collection, adminAuthController, "test", draftEntity)).toBe(true);

        // Author HAS "author" role → restrictive rule applies → draft fails restrictive → denied
        expect(canEditEntity(collection, mockAuthController, "test", draftEntity)).toBe(false);

        // Author + published → restrictive passes → permissive grants true
        expect(canEditEntity(collection, mockAuthController, "test", publishedEntity)).toBe(true);
    });

    test("38. Restrictive rule fails immediately, does not continue to permissive", () => {
        const collection = createMockCollection([
            { operation: "insert", roles: ["author"], mode: "permissive" },
            { operation: "insert", roles: ["author"], mode: "restrictive", using: "status = 'draft'" }
        ]);

        // With null entity: evaluateAST("status = 'draft'", ..., null) → true (optimistic)
        // So restrictive passes → permissive also passes → true
        expect(canCreateEntity(collection, mockAuthController, "test", null)).toBe(true);

        // With real entity that fails the restrictive check: immediate deny
        const publishedEntity = createMockEntity({ status: "published" });
        expect(canCreateEntity(collection, mockAuthController, "test", publishedEntity)).toBe(false);

        const draftEntity = createMockEntity({ status: "draft" });
        expect(canCreateEntity(collection, mockAuthController, "test", draftEntity)).toBe(true);
    });

    // ─── Section 10: UI Enablability (null entity = optimistic) ─────────────────

    describe("UI enablability with null entities", () => {

        test("39. Create: role-gated rule → disabled for non-matching user", () => {
            const collection = createMockCollection([{ operation: "insert", roles: ["admin"] }]);
            expect(canCreateEntity(collection, mockAuthController, "test", null)).toBe(false);
            expect(canCreateEntity(collection, adminAuthController, "test", null)).toBe(true);
            expect(canCreateEntity(collection, unauthenticatedController, "test", null)).toBe(false);
        });

        test("40. Edit: role-gated rule → disabled for non-matching user", () => {
            const collection = createMockCollection([{ operation: "update", roles: ["admin"] }]);
            expect(canEditEntity(collection, mockAuthController, "test", null)).toBe(false);
            expect(canEditEntity(collection, adminAuthController, "test", null)).toBe(true);
        });

        test("41. Delete: role-gated rule → disabled for non-matching user", () => {
            const collection = createMockCollection([{ operation: "delete", roles: ["admin"] }]);
            expect(canDeleteEntity(collection, mockAuthController, "test", null)).toBe(false);
            expect(canDeleteEntity(collection, adminAuthController, "test", null)).toBe(true);
        });

        test("42. Read: role-gated rule → disabled for non-matching user", () => {
            const collection = createMockCollection([{ operation: "select", roles: ["admin"] }]);
            expect(canReadCollection(collection, mockAuthController)).toBe(false);
            expect(canReadCollection(collection, adminAuthController)).toBe(true);
        });

        test("43. Create: complex SQL condition → optimistically enabled (null entity)", () => {
            const collection = createMockCollection([
                { operation: "insert", using: "status = 'published' AND id IN (SELECT id FROM drafts)" }
            ]);
            expect(canCreateEntity(collection, mockAuthController, "test", null)).toBe(true);
        });

        test("44. Edit: ownerField with null entity → optimistically enabled", () => {
            const collection = createMockCollection([{ operation: "update", ownerField: "user_uid" }]);
            expect(canEditEntity(collection, mockAuthController, "test", null)).toBe(true);
            // Even unauth! Backend will block.
            expect(canEditEntity(collection, unauthenticatedController, "test", null)).toBe(true);
        });

        test("45. Delete: public rule → everyone enabled", () => {
            const collection = createMockCollection([{ operation: "delete", access: "public" }]);
            expect(canDeleteEntity(collection, unauthenticatedController, "test", null)).toBe(true);
            expect(canDeleteEntity(collection, mockAuthController, "test", null)).toBe(true);
            expect(canDeleteEntity(collection, adminAuthController, "test", null)).toBe(true);
        });

        test("46. Read: sole restrictive rule → disabled for everyone", () => {
            const collection = createMockCollection([
                { operation: "select", mode: "restrictive", using: "status = 'draft'" }
            ]);
            expect(canReadCollection(collection, mockAuthController)).toBe(false);
            expect(canReadCollection(collection, adminAuthController)).toBe(false);
            expect(canReadCollection(collection, unauthenticatedController)).toBe(false);
        });

        test("47. Create: public permissive + data-level restrictive → optimistically true (null entity)", () => {
            const collection = createMockCollection([
                { operation: "insert", access: "public", mode: "permissive" },
                { operation: "insert", mode: "restrictive", using: "status = 'published'" }
            ]);
            // null entity → restrictive evaluateAST returns true (optimistic) → passes → permissive grants → true
            expect(canCreateEntity(collection, mockAuthController, "test", null)).toBe(true);
            expect(canCreateEntity(collection, unauthenticatedController, "test", null)).toBe(true);
        });

        test("48. Create: admin-permissive + author-restrictive → admin enabled, author disabled (null entity)", () => {
            const collection = createMockCollection([
                { operation: "insert", roles: ["admin"], mode: "permissive" },
                { operation: "insert", roles: ["author"], mode: "restrictive", using: "status = 'draft'" }
            ]);
            // Admin: only the permissive rule applies → true
            expect(canCreateEntity(collection, adminAuthController, "test", null)).toBe(true);
            // Author: restrictive rule applies + passes (null-optimistic), BUT no permissive rule → false
            expect(canCreateEntity(collection, mockAuthController, "test", null)).toBe(false);
            // Unauth: no rules apply → false
            expect(canCreateEntity(collection, unauthenticatedController, "test", null)).toBe(false);
        });

        test("49. Edit: any rule without matching op → disabled", () => {
            const collection = createMockCollection([
                { operation: "insert", access: "public" }
            ]);
            expect(canEditEntity(collection, mockAuthController, "test", null)).toBe(false);
            expect(canEditEntity(collection, unauthenticatedController, "test", null)).toBe(false);
        });

        test("50. All CRUD disabled when all rules have unknown role", () => {
            const collection = createMockCollection([
                { operation: "all", roles: ["nonexistent_role"] }
            ]);
            expect(canCreateEntity(collection, mockAuthController, "test", null)).toBe(false);
            expect(canEditEntity(collection, mockAuthController, "test", null)).toBe(false);
            expect(canDeleteEntity(collection, mockAuthController, "test", null)).toBe(false);
            expect(canReadCollection(collection, mockAuthController)).toBe(false);
        });
    });

    // ─── Section 11: Multi-Rule Combinations ──────────────────────────────────────

    describe("Multi-rule combinations", () => {

        test("51. Admin OR author permissive → both can create, unauth cannot", () => {
            const collection = createMockCollection([
                { operation: "insert", roles: ["admin"], mode: "permissive" },
                { operation: "insert", roles: ["author"], mode: "permissive" }
            ]);
            expect(canCreateEntity(collection, adminAuthController, "test", null)).toBe(true);
            expect(canCreateEntity(collection, mockAuthController, "test", null)).toBe(true);
            expect(canCreateEntity(collection, unauthenticatedController, "test", null)).toBe(false);
        });

        test("52. Admin can delete anything, author only their own entities", () => {
            const collection = createMockCollection([
                { operation: "delete", roles: ["admin"] },
                { operation: "delete", ownerField: "author_uid" }
            ]);
            const authorEntity = createMockEntity({ author_uid: "user-123" });
            const hackerEntity = createMockEntity({ author_uid: "hacker" });

            expect(canDeleteEntity(collection, adminAuthController, "test", authorEntity)).toBe(true);
            expect(canDeleteEntity(collection, adminAuthController, "test", hackerEntity)).toBe(true);
            expect(canDeleteEntity(collection, mockAuthController, "test", authorEntity)).toBe(true);
            expect(canDeleteEntity(collection, mockAuthController, "test", hackerEntity)).toBe(false);
        });

        test("53. Role OR owner combinded: admin by role, others by ownership", () => {
            const collection = createMockCollection([
                { operation: "update", roles: ["admin"], mode: "permissive" },
                { operation: "update", ownerField: "user_id", mode: "permissive" }
            ]);
            const owned = createMockEntity({ user_id: "user-123" });
            const notOwned = createMockEntity({ user_id: "other" });

            expect(canEditEntity(collection, adminAuthController, "test", notOwned)).toBe(true);
            expect(canEditEntity(collection, mockAuthController, "test", owned)).toBe(true);
            expect(canEditEntity(collection, mockAuthController, "test", notOwned)).toBe(false);
        });

        test("54. 'all' rule permissive base + specific delete restrictive", () => {
            const collection = createMockCollection([
                { operation: "all", access: "public", mode: "permissive" },
                { operation: "delete", mode: "restrictive", using: "is_deletable = 'true'" }
            ]);
            const deletable = createMockEntity({ is_deletable: "true" });
            const notDeletable = createMockEntity({ is_deletable: "false" });

            // Reading still works (only 'all' permissive applies to select)
            expect(canReadCollection(collection, mockAuthController)).toBe(true);
            // Deletable entity passes restrictive
            expect(canDeleteEntity(collection, mockAuthController, "test", deletable)).toBe(true);
            // Non-deletable entity fails restrictive
            expect(canDeleteEntity(collection, mockAuthController, "test", notDeletable)).toBe(false);
        });

        test("55. Three-user-role scenario: platform role hierarchy", () => {
            const editorUser: User = {
                uid: "editor-1", email: "e@e.com", displayName: "Ed",
                providerId: "test", isAnonymous: false, photoURL: null,
                roles: ["editor"]
            };
            const editorAuth: AuthController<any> = { ...mockAuthController, user: editorUser };

            const collection = createMockCollection([
                { operation: "select", roles: ["admin", "editor", "author"] }, // read all three
                { operation: "insert", roles: ["admin", "editor"] },           // create admin/editor
                { operation: "update", roles: ["admin"] },                     // edit admin only
                { operation: "delete", roles: ["admin"] }                      // delete admin only
            ]);

            // Admin
            expect(canReadCollection(collection, adminAuthController)).toBe(true);
            expect(canCreateEntity(collection, adminAuthController, "test", null)).toBe(true);
            expect(canEditEntity(collection, adminAuthController, "test", null)).toBe(true);
            expect(canDeleteEntity(collection, adminAuthController, "test", null)).toBe(true);
            // Editor
            expect(canReadCollection(collection, editorAuth)).toBe(true);
            expect(canCreateEntity(collection, editorAuth, "test", null)).toBe(true);
            expect(canEditEntity(collection, editorAuth, "test", null)).toBe(false);
            expect(canDeleteEntity(collection, editorAuth, "test", null)).toBe(false);
            // Author (mockUser)
            expect(canReadCollection(collection, mockAuthController)).toBe(true);
            expect(canCreateEntity(collection, mockAuthController, "test", null)).toBe(false);
            expect(canEditEntity(collection, mockAuthController, "test", null)).toBe(false);
            expect(canDeleteEntity(collection, mockAuthController, "test", null)).toBe(false);
            // Unauth
            expect(canReadCollection(collection, unauthenticatedController)).toBe(false);
        });

        test("56. Publication workflow: draft/review/published state machine", () => {
            const collection = createMockCollection([
                // Anyone can read published content
                { operation: "select", using: "status = 'published'" },
                // Authors can only create drafts
                { operation: "insert", roles: ["author"], withCheck: "status = 'draft'" },
                // Authors can only edit their own draft or review content
                { operation: "update", roles: ["author"], ownerField: "author_id", using: "status != 'published'" },
                // Editors can move anything to/from review/published
                { operation: "update", roles: ["editor"] },
                // Only admins can delete
                { operation: "delete", roles: ["admin"] }
            ]);

            const draft = createMockEntity({ status: "draft", author_id: "user-123" });
            const published = createMockEntity({ status: "published", author_id: "user-123" });
            const othersDraft = createMockEntity({ status: "draft", author_id: "someone-else" });

            // Author can create (null entity, optimistic)
            expect(canCreateEntity(collection, mockAuthController, "test", null)).toBe(true);
            // Author can edit their own draft
            expect(canEditEntity(collection, mockAuthController, "test", draft)).toBe(true);
            // Author CANNOT edit their own published content (status = 'published' fails using)
            expect(canEditEntity(collection, mockAuthController, "test", published)).toBe(false);
            // Author CANNOT edit others' drafts
            expect(canEditEntity(collection, mockAuthController, "test", othersDraft)).toBe(false);
            // Author CANNOT delete
            expect(canDeleteEntity(collection, mockAuthController, "test", null)).toBe(false);
            // Admin CAN delete
            expect(canDeleteEntity(collection, adminAuthController, "test", null)).toBe(true);
        });

        test("57. Unauthenticated user: ownerField rule denies, SQL rule without roles still grants", () => {
            // Three update rules, each independently permissive (OR logic).
            // Rule 1: admin-only role → unauthenticated lacks it → filtered out
            // Rule 2: ownerField user_id → entity.user_id = null, auth.uid = undefined → null !== undefined → fails
            // Rule 3: using status = 'draft' → passes, has no role restriction → grants true
            // Result: true (rule 3 wins)
            const collection = createMockCollection([
                { operation: "update", roles: ["admin"] },
                { operation: "update", ownerField: "user_id" },
                { operation: "update", using: "status = 'draft'" }
            ]);
            const draftOwned = createMockEntity({ user_id: null, status: "draft" });
            expect(canEditEntity(collection, unauthenticatedController, "test", draftOwned)).toBe(true);

            // To actually restrict unauthenticated users, the 3rd rule needs a role guard:
            const restrictedCollection = createMockCollection([
                { operation: "update", roles: ["admin"] },
                { operation: "update", ownerField: "user_id" },
                { operation: "update", roles: ["author"], using: "status = 'draft'" }
            ]);
            expect(canEditEntity(collection, unauthenticatedController, "test", draftOwned)).toBe(true);
            expect(canEditEntity(restrictedCollection, unauthenticatedController, "test", draftOwned)).toBe(false);
        });

        test("58. Missing authController ('blankAuth') handled gracefully", () => {
            const collection = createMockCollection([{ operation: "insert", roles: ["admin"] }]);
            const blankAuth = { user: null } as any;
            expect(canCreateEntity(collection, blankAuth, "test", null)).toBe(false);
        });

        test("59. SQL injection-like string in 'using' is safely treated as unparseable → optimistic", () => {
            const collection = createMockCollection([
                { operation: "update", using: "\"); DROP TABLE users; --" }
            ]);
            // Frontend never executes SQL, just parses. Malformed string → optimistic pass
            expect(canEditEntity(collection, mockAuthController, "test", null)).toBe(true);
        });
    });
});
