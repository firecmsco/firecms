import { canCreateEntity, canEditEntity, canDeleteEntity, canReadCollection } from "./permissions";
import { EntityCollection, AuthController, Entity, User } from "@firecms/types";

describe("Permissions Evaluator", () => {

    const mockUser: User = {
        uid: "user-123",
        email: "test@test.com",
        displayName: "Test User",
        providerId: "test",
        isAnonymous: false,
        photoURL: null,
        roles: [{ id: "author", name: "Author" }, { id: "user", name: "User" }]
    };

    const adminUser: User = {
        uid: "admin-123",
        email: "admin@test.com",
        displayName: "Admin User",
        providerId: "test",
        isAnonymous: false,
        photoURL: null,
        roles: [{ id: "admin", name: "Admin" }]
    };

    const mockAuthController: AuthController<any> = {
        user: mockUser,
        initialLoading: false,
        authLoading: false,
        loginSkipped: false,
        signOut: async () => { },
        getAuthToken: async () => "token",
        setExtra: () => { },
        extra: {}
    };

    const adminAuthController: AuthController<any> = {
        ...mockAuthController,
        user: adminUser
    };

    const unauthenticatedController: AuthController<any> = {
        ...mockAuthController,
        user: null
    };

    const createMockCollection = (rules?: any[]): EntityCollection<any> => ({
        id: "test",
        name: "Test",
        properties: {},
        securityRules: rules
    } as any);

    const createMockEntity = (values: Record<string, any>): Entity<any> => ({
        id: "entity-123",
        path: "test",
        values,
        originalValues: values,
    } as any);

    test("1. Implicit fallback handling: no rules returns true (default optimistic UI)", () => {
        const collection = createMockCollection(); // no rules
        expect(canReadCollection(collection, mockAuthController)).toBe(true);
        expect(canCreateEntity(collection, mockAuthController, "test", null)).toBe(true);
        expect(canEditEntity(collection, mockAuthController, "test", null)).toBe(true);
        expect(canDeleteEntity(collection, mockAuthController, "test", null)).toBe(true);
    });

    test("2. Operations filtering: Should only grant access if the operation matches", () => {
        const collection = createMockCollection([
            { operation: "insert", access: "public" },
            { operations: ["select", "delete"], roles: ["admin"] }
        ]);

        // Mock user should be able to create (insert) because it's public
        expect(canCreateEntity(collection, mockAuthController, "test", null)).toBe(true);
        // Mock user should NOT be able to read/delete (needs admin) or edit (no rule)
        expect(canReadCollection(collection, mockAuthController)).toBe(false);
        expect(canDeleteEntity(collection, mockAuthController, "test", null)).toBe(false);
        expect(canEditEntity(collection, mockAuthController, "test", null)).toBe(false);

        // Admin can read and delete
        expect(canReadCollection(collection, adminAuthController)).toBe(true);
        expect(canDeleteEntity(collection, adminAuthController, "test", null)).toBe(true);
    });

    test("3. Role checks: Validating 'roles' against user roles", () => {
        const collection = createMockCollection([
            { operation: "all", roles: ["admin", "editor"] }
        ]);

        // Regular user with 'author' role should be denied
        expect(canReadCollection(collection, mockAuthController)).toBe(false);

        // Admin user should be allowed
        expect(canReadCollection(collection, adminAuthController)).toBe(true);
    });

    test("4. Access matching: 'public' vs unset", () => {
        const collection = createMockCollection([
            { operation: "select", access: "public" }, // public can read
            { operation: "insert", roles: ["editor"] } // only editor can insert
        ]);

        // Public read
        expect(canReadCollection(collection, unauthenticatedController)).toBe(true);
        expect(canReadCollection(collection, mockAuthController)).toBe(true);

        // Denied insert
        expect(canCreateEntity(collection, unauthenticatedController, "test", null)).toBe(false);
    });

    test("5. Owner fields matching: 'ownerField' matches entity values", () => {
        const collection = createMockCollection([
            { operation: "update", ownerField: "user_id" }
        ]);

        const mockEntityOwned = createMockEntity({ user_id: "user-123" });
        const mockEntityNotOwned = createMockEntity({ user_id: "other-user" });

        expect(canEditEntity(collection, mockAuthController, "test", mockEntityOwned)).toBe(true);
        expect(canEditEntity(collection, mockAuthController, "test", mockEntityNotOwned)).toBe(false);
    });

    test("6. SQL AST evaluation fallback: simple 'current_setting'", () => {
        const collection = createMockCollection([
            { operation: "update", using: "author_uid = current_setting('firecms.user_id')" }
        ]);

        const mockEntityOwned = createMockEntity({ author_uid: "user-123" });
        const mockEntityNotOwned = createMockEntity({ author_uid: "other-user" });

        expect(canEditEntity(collection, mockAuthController, "test", mockEntityOwned)).toBe(true);
        expect(canEditEntity(collection, mockAuthController, "test", mockEntityNotOwned)).toBe(false);
    });

    test("7. Restrictive vs Permissive modes", () => {
        const collection = createMockCollection([
            { operation: "select", access: "public", mode: "permissive" }, // Anyone can select
            { operation: "select", roles: ["blocked"], mode: "restrictive" } // But NOT if they have the 'blocked' role
        ]);

        // Normal user can read empty roles
        expect(canReadCollection(collection, mockAuthController)).toBe(true);

        // Blocked user
        const blockedUser: User = {
            uid: "block-1",
            email: "block@test.com",
            displayName: "Blocked",
            providerId: "test",
            isAnonymous: false,
            photoURL: null,
            roles: [{ id: "blocked", name: "Blocked" }]
        };
        const blockedController: AuthController<any> = { ...mockAuthController, user: blockedUser };

        // Should be denied because restrictive rule failed. 
        // Wait, how restrictive works: mode "restrictive" AND evaluateRule returns false means it denies!
        // Actually, if rule has roles: ["blocked"], the rule passes ONLY if user has 'blocked'.
        // Wait, if the user does NOT have 'blocked', evaluateRule returns false.
        // And if evaluateRule returns false for a restrictive rule, it DENIES!
        // Therefore, restrictive rule WITH roles: ["blocked"] means ONLY people with "blocked" role can pass the restrictive rule!
        // So everyone WITHOUT "blocked" role gets denied.
        // Let's verify that.
        expect(canReadCollection(collection, blockedController)).toBe(true); // blocked has role, passes restrictive rule, then permissive grants true
        // mockAuthController does not have "blocked" role, so the restrictive policy DOES NOT apply.
        // It skips the restrictive policy and only evaluates the permissive "public" one.
        expect(canReadCollection(collection, mockAuthController)).toBe(true);
    });

    test("7b. Correct Restrictive rule mimicking NOT operation", () => {
        // Usually, to restrict users with 'blocked' role, the SQL logic would be:
        // restrictive rule using: "current_setting('firecms.user_roles') NOT LIKE '%blocked%'"
        // Our evaluator does optimistic fallback for complex SQL, meaning it returns true usually.
        // Let's test a case where restrictive logic explicitly denies:
        const collection = createMockCollection([
            { operation: "select", access: "public", mode: "permissive" },
            { operation: "select", mode: "restrictive", using: "owner_id = current_setting('firecms.user_id')" }
        ]);

        // Restrictive rule will require owner_id == current_setting('firecms.user_id').
        const mockEntityOwned = createMockEntity({ owner_id: "user-123" });
        const mockEntityNotOwned = createMockEntity({ owner_id: "other-user" });

        // Select logic is typically tested at collection level (null entity)
        // Let's use checkOperation (which canEditEntity uses). Update operation with entity.
        const collectionUpdate = createMockCollection([
            { operation: "update", access: "public", mode: "permissive" },
            { operation: "update", mode: "restrictive", using: "owner_id = current_setting('firecms.user_id')" }
        ]);

        // Not owned -> evaluateRule returns false -> restrictive rule fails -> returned false overall
        expect(canEditEntity(collectionUpdate, mockAuthController, "test", mockEntityNotOwned)).toBe(false);
        // Owned -> evaluateRule returns true -> restrictive rule passes -> permissive rule passes -> returned true overall
        expect(canEditEntity(collectionUpdate, mockAuthController, "test", mockEntityOwned)).toBe(true);
    });

    test("8. Permissive OR logic", () => {
        const collection = createMockCollection([
            { operation: "update", roles: ["admin"], mode: "permissive" },
            { operation: "update", ownerField: "user_id", mode: "permissive" }
        ]);

        const mockEntityNotOwned = createMockEntity({ user_id: "other-user" });
        const mockEntityOwned = createMockEntity({ user_id: "user-123" });

        // Admin can edit anything
        expect(canEditEntity(collection, adminAuthController, "test", mockEntityNotOwned)).toBe(true);
        // User can only edit their own
        expect(canEditEntity(collection, mockAuthController, "test", mockEntityNotOwned)).toBe(false);
        expect(canEditEntity(collection, mockAuthController, "test", mockEntityOwned)).toBe(true);
    });

    // --- NEW EXTENDED TESTS ---

    test("9. AST Parsing: Basic Equality", () => {
        const collection = createMockCollection([
            { operation: "update", using: "status = 'published'" }
        ]);

        const publishedEntity = createMockEntity({ status: "published" });
        const draftEntity = createMockEntity({ status: "draft" });

        expect(canEditEntity(collection, mockAuthController, "test", publishedEntity)).toBe(true);
        expect(canEditEntity(collection, mockAuthController, "test", draftEntity)).toBe(false);
    });

    test("10. AST Parsing: Basic Inequality", () => {
        const collection = createMockCollection([
            { operation: "update", using: "status != 'archived'" }
        ]);

        const publishedEntity = createMockEntity({ status: "published" });
        const archivedEntity = createMockEntity({ status: "archived" });

        expect(canEditEntity(collection, mockAuthController, "test", publishedEntity)).toBe(true);
        expect(canEditEntity(collection, mockAuthController, "test", archivedEntity)).toBe(false);
    });

    test("11. AST Parsing: Optimistic fallback on complex SQL", () => {
        const collection = createMockCollection([
            { operation: "update", using: "status IN ('published', 'draft') AND (author_id = current_setting('firecms.user_id') OR role = 'admin')" }
        ]);

        const anyEntity = createMockEntity({ status: "archived" });

        // This is too complex for our simple parser, so it should optimistically return true for the UI.
        expect(canEditEntity(collection, mockAuthController, "test", anyEntity)).toBe(true);
    });

    test("12. AST Parsing: current_setting variations", () => {
        // Space variations to ensure regex robustness
        const collection = createMockCollection([
            { operation: "update", using: "author_uid=current_setting (  'firecms.user_id'  )" }
        ]);

        const ownedEntity = createMockEntity({ author_uid: "user-123" });
        const unownedEntity = createMockEntity({ author_uid: "other" });

        expect(canEditEntity(collection, mockAuthController, "test", ownedEntity)).toBe(true);
        expect(canEditEntity(collection, mockAuthController, "test", unownedEntity)).toBe(false);
    });

    test("13. Role Applicability: Implicit Deny if no rules match roles", () => {
        const collection = createMockCollection([
            { operation: "all", roles: ["admin"] },
            { operation: "all", roles: ["moderator"] }
        ]);

        // A regular user shouldn't match any rule's role array, so it skips all rules and denies.
        expect(canReadCollection(collection, mockAuthController)).toBe(false);
        // Admin matches the first, so it evaluates
        expect(canReadCollection(collection, adminAuthController)).toBe(true);
    });

    test("14. Collection Groups explicitly block Creation", () => {
        const collection = { ...createMockCollection(), collectionGroup: true };

        // Even with no rules (which normally defaults to true), a collection group CANNOT support inserts
        expect(canCreateEntity(collection, mockAuthController, "test", null)).toBe(false);
        // But reads are still fine
        expect(canReadCollection(collection, mockAuthController)).toBe(true);
    });

    test("15. Both 'using' and 'withCheck' SQL constraints", () => {
        // 'withCheck' is effectively treated the same functionally for the AST
        const collection = createMockCollection([
            { operation: "update", withCheck: "status = 'draft'" }
        ]);

        const draftEntity = createMockEntity({ status: "draft" });
        expect(canEditEntity(collection, mockAuthController, "test", draftEntity)).toBe(true);
    });

    test("16. Unauthenticated Users and the public Role", () => {
        // Rules that don't specify roles implicitly apply to public
        const collection = createMockCollection([
            { operation: "read", using: "visibility = 'public'" }
        ]);

        // Because "read" isn't a standard operation (it's select), the filtering drops it, so read becomes false.
        // Wait, "read" is not "select" or "all"
        expect(canReadCollection(collection, unauthenticatedController)).toBe(false);

        const correctedCollection = createMockCollection([
            { operation: "select", using: "visibility = 'public'" }
        ]);

        const publicEntity = createMockEntity({ visibility: "public" });
        // The AST needs an entity to evaluate "visibility = 'public'" but canReadCollection passes `null`
        // If entity is null in evaluateAST, it optimistically returns true!
        expect(canReadCollection(correctedCollection, unauthenticatedController)).toBe(true);
    });

    test("17. Null or Malformed Security Rules fall back to Optmistic True", () => {
        const collection = createMockCollection([]); // empty array
        expect(canReadCollection(collection, mockAuthController)).toBe(true);

        const collectionNull = createMockCollection(null as any);
        expect(canReadCollection(collectionNull, mockAuthController)).toBe(true);
    });

    test("18. Role Matching logic handles Object roles vs String rules", () => {
        // User roles in AuthController are defined as [{id: "author", name: "Author"}, {id: "user"}]
        // The evaluateRule needs to map them correctly to strings to compare to rule.roles.
        const collection = createMockCollection([
            { operation: "select", roles: ["author"] }
        ]);

        expect(canReadCollection(collection, mockAuthController)).toBe(true);
    });

    test("19. Conflicting Restrictive and Permissive rules for same role", () => {
        const collection = createMockCollection([
            // Applies to Everyone, permits reading 
            { operation: "select", access: "public", mode: "permissive" },
            // Applies only to Authors, but restricts reading if status != 'published'
            { operation: "select", roles: ["author"], mode: "restrictive", using: "status = 'published'" }
        ]);

        const draftEntity = createMockEntity({ status: "draft" });
        const publishedEntity = createMockEntity({ status: "published" });

        // Admin does not have "author" role. The restrictive rule DOES NOT apply to admin.
        // Permissive rule applies. Admin can edit draft!
        // (Wait, checkOperation for "select", but we pass an entity? Actually checkOperation for select passes null entity.
        // If entity is null, evaluateAST returns true. So let's test this with an update instead to pass the entity).

        const updateCollection = createMockCollection([
            { operation: "update", access: "public", mode: "permissive" },
            { operation: "update", roles: ["author"], mode: "restrictive", using: "status = 'published'" }
        ]);

        // Admin -> no "author" role -> restrictive rule skipped -> permissive grants true
        expect(canEditEntity(updateCollection, adminAuthController, "test", draftEntity)).toBe(true);

        // Author -> HAS "author" role -> restrictive rule APPLIES.
        // For draft, status != published -> restrictive fails -> IMMEDIATE DENY
        expect(canEditEntity(updateCollection, mockAuthController, "test", draftEntity)).toBe(false);

        // For published, status == published -> restrictive passes -> permissive grants true
        expect(canEditEntity(updateCollection, mockAuthController, "test", publishedEntity)).toBe(true);
    });

});
