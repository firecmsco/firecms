import { AuthController, Entity, EntityCollection, SecurityRule, User } from "@firecms/types";

function evaluateAST(sqlString: string, auth: AuthController, entity: Entity<any> | null): boolean {
    // This is a rudimentary client-side SQL evaluator used *only* for optimistic UI updates.
    // It is NOT a security boundary; true security is enforced by PostgreSQL RLS on the server.
    // If we can't parse it easily, we optimistically return true to show the button/field.
    if (!entity) return true;

    // Reject complex queries early to trigger the optimistic fallback
    const upperSQL = sqlString.toUpperCase();
    if (upperSQL.includes(" AND ") || upperSQL.includes(" OR ") || upperSQL.includes(" IN ") || upperSQL.includes(" EXISTS ")) {
        return true;
    }

    // Pattern 1: `field = current_setting('firecms.user_id')`
    const userSettingMatch = sqlString.match(/([\w_]+)\s*=\s*current_setting\s*\(\s*'firecms\.user_id'\s*\)/i);
    if (userSettingMatch && userSettingMatch[1]) {
        return entity.values[userSettingMatch[1]] === auth.user?.uid;
    }

    // Pattern 2: `field = 'value'` or `field != 'value'`
    const simpleEqualityMatch = sqlString.match(/([\w_]+)\s*(=|!=)\s*'([^']+)'/i);
    if (simpleEqualityMatch) {
        const field = simpleEqualityMatch[1];
        const operator = simpleEqualityMatch[2];
        const value = simpleEqualityMatch[3];
        const entityValue = entity.values[field];
        if (operator === "=") return entityValue === value;
        if (operator === "!=") return entityValue !== value;
    }

    return true; // Optimistic fallback for complex SQL (`AND`, `OR`, `IN`, `EXISTS`, etc.)
}

function evaluateRule(rule: SecurityRule, auth: AuthController, entity: Entity<any> | null): boolean {

    if (rule.access === "public") return true;

    if (rule.ownerField && entity) {
        return entity.values[rule.ownerField] === auth.user?.uid;
    }

    const sqlToEvaluate = rule.using || rule.withCheck;
    if (sqlToEvaluate) {
        return evaluateAST(sqlToEvaluate, auth, entity);
    }

    return true;
}

function checkOperation(
    collection: EntityCollection<any>,
    authController: AuthController<any>,
    entity: Entity<any> | null,
    targetOperation: "select" | "insert" | "update" | "delete"
): boolean {
    if (!collection.securityRules || collection.securityRules.length === 0) {
        // According to our plan: Postgres RLS implicitly denies if enabled without rules.
        // But for FireCMS we default to true if securityRules is undefined,
        // so as not to break everything without rules. Let's assume true for now.
        return true;
    }

    const applicableRules = collection.securityRules.filter(r =>
        r.operation === targetOperation ||
        r.operation === "all" ||
        r.operations?.includes(targetOperation) ||
        r.operations?.includes("all")
    );

    if (applicableRules.length === 0) return false;

    // In Postgres, policies ONLY apply if the user matching the targeted roles.
    const userRoles = authController.user?.roles?.map((r: any) => typeof r === "string" ? r : r.id) || ["public"];
    const roleApplicableRules = applicableRules.filter(rule => {
        if (!rule.roles || rule.roles.length === 0) return true; // APPLIES TO PUBLIC
        return rule.roles.some((r: string) => userRoles.includes(r));
    });

    // If no rules apply to this user's roles, the operation is implicitly denied.
    if (roleApplicableRules.length === 0) return false;

    let grantedByPermissive = false;
    let deniedByRestrictive = false;

    for (const rule of roleApplicableRules) {
        const mode = rule.mode || "permissive";
        const passed = evaluateRule(rule, authController, entity);

        if (mode === "restrictive" && !passed) {
            deniedByRestrictive = true;
            break; // Immediate deny
        }

        if (mode === "permissive" && passed) {
            grantedByPermissive = true;
        }
    }

    if (deniedByRestrictive) return false;

    const hasPermissive = roleApplicableRules.some(r => (r.mode || "permissive") === "permissive");
    if (hasPermissive) {
        return grantedByPermissive;
    } else {
        return false;
    }
}

export function canReadCollection<M extends Record<string, any>, USER extends User>
    (
        collection: EntityCollection<M>,
        authController: AuthController<USER>
    ): boolean {
    return checkOperation(collection, authController, null, "select");
}

export function canEditEntity<M extends Record<string, any>, USER extends User>
    (
        collection: EntityCollection<M>,
        authController: AuthController<USER>,
        path: string,
        entity: Entity<M> | null
    ): boolean {
    return checkOperation(collection, authController, entity, "update");
}

export function canCreateEntity<M extends Record<string, any>, USER extends User>
    (
        collection: EntityCollection<M>,
        authController: AuthController<USER>,
        path: string,
        entity: Entity<M> | null
    ): boolean {
    if (collection.collectionGroup) return false;
    return checkOperation(collection, authController, entity, "insert");
}

export function canDeleteEntity<M extends Record<string, any>, USER extends User>
    (
        collection: EntityCollection<M>,
        authController: AuthController<USER>,
        path: string,
        entity: Entity<M> | null
    ): boolean {
    return checkOperation(collection, authController, entity, "delete");
}
