import { AuthController, Entity, EntityCollection, SecurityRule, User } from "@rebasepro/types";

function evaluateAST(sqlString: string, auth: AuthController, entity: Entity<any> | null): boolean {
    // This is a client-side SQL evaluator used *only* for optimistic UI updates.
    // It parses basic AND / OR statements to evaluate RLS without backend roundtrips.
    if (!entity) return true;

    // 1. Clean outer parentheses
    let cleanedSQL = sqlString.trim();
    while (cleanedSQL.startsWith('(') && cleanedSQL.endsWith(')')) {
        let openCount = 0;
        let isEnclosing = true;
        for (let i = 0; i < cleanedSQL.length - 1; i++) {
            if (cleanedSQL[i] === '(') openCount++;
            else if (cleanedSQL[i] === ')') openCount--;
            if (openCount === 0) {
                isEnclosing = false;
                break;
            }
        }
        if (isEnclosing) {
            cleanedSQL = cleanedSQL.substring(1, cleanedSQL.length - 1).trim();
        } else {
            break;
        }
    }

    // 2. Split top-level OR / AND
    const splitByTopLevel = (str: string, delimiter: string) => {
        const parts: string[] = [];
        let current = "";
        let openCount = 0;
        let i = 0;
        while (i < str.length) {
            if (str[i] === '(') openCount++;
            else if (str[i] === ')') openCount--;
            
            if (openCount === 0 && str.substring(i).toUpperCase().startsWith(delimiter)) {
                parts.push(current);
                current = "";
                i += delimiter.length;
            } else {
                current += str[i];
                i++;
            }
        }
        parts.push(current);
        return parts;
    };

    const orParts = splitByTopLevel(cleanedSQL, " OR ");
    if (orParts.length > 1) {
        return orParts.some(part => evaluateAST(part, auth, entity));
    }

    const andParts = splitByTopLevel(cleanedSQL, " AND ");
    if (andParts.length > 1) {
        return andParts.every(part => evaluateAST(part, auth, entity));
    }

    const upperSQL = cleanedSQL.toUpperCase();

    // 3. Fallback for unparseable complex queries
    if (upperSQL.includes(" IN ") || upperSQL.includes(" EXISTS ")) {
        return true;
    }

    // 4. Role array checks
    // Pattern: `string_to_array(auth.roles(), ',') && ARRAY['admin', 'editor']`
    const roleIntersectMatch = cleanedSQL.match(/string_to_array\s*\(\s*auth\.roles\(\)\s*,\s*','\s*\)\s*&&\s*ARRAY\[(.*?)\]/i);
    if (roleIntersectMatch && roleIntersectMatch[1]) {
        const requiredRoles = roleIntersectMatch[1].split(',').map(r => r.trim().replace(/'/g, ''));
        const userRoles = auth.user?.roles || [];
        return requiredRoles.some(r => userRoles.includes(r));
    }

    // Pattern: `string_to_array(auth.roles(), ',') @> ARRAY['admin']`
    const roleContainMatch = cleanedSQL.match(/string_to_array\s*\(\s*auth\.roles\(\)\s*,\s*','\s*\)\s*@>\s*ARRAY\[(.*?)\]/i);
    if (roleContainMatch && roleContainMatch[1]) {
        const requiredRoles = roleContainMatch[1].split(',').map(r => r.trim().replace(/'/g, ''));
        const userRoles = auth.user?.roles || [];
        return requiredRoles.every(r => userRoles.includes(r));
    }

    // 5. Existing ID patterns
    const pattern1 = new RegExp(`^\\{?([a-zA-Z0-9_]+)\\}?\\s*=\\s*(?:current_setting\\s*\\(\\s*'app\\.user_id'\\s*\\)|auth\\.uid\\(\\))`);
    const pattern2 = new RegExp(`^(?:current_setting\\s*\\(\\s*'app\\.user_id'\\s*\\)|auth\\.uid\\(\\))\\s*=\\s*\\{?([a-zA-Z0-9_]+)\\}?`);

    const match1 = cleanedSQL.match(pattern1);
    if (match1 && match1[1]) {
        return entity.values[match1[1]] === auth.user?.uid;
    }

    const match2 = cleanedSQL.match(pattern2);
    if (match2 && match2[1]) {
        return entity.values[match2[1]] === auth.user?.uid;
    }

    // 6. Simple equality
    // Pattern: `field = 'value'` or `{field} != 'value'`
    const simpleEqualityMatch = cleanedSQL.match(/^\{?([\w_]+)\}?\s*(=|!=)\s*'([^']+)'$/i);
    if (simpleEqualityMatch) {
        const field = simpleEqualityMatch[1];
        const operator = simpleEqualityMatch[2];
        const value = simpleEqualityMatch[3];
        const entityValue = entity.values[field];
        if (operator === "=") return entityValue === value;
        if (operator === "!=") return entityValue !== value;
    }

    return true; // Optimistic fallback for anything else
}

function evaluateRule(rule: SecurityRule, auth: AuthController, entity: Entity<any> | null): boolean {

    if (rule.access === "public") return true;

    if (rule.ownerField) {
        if (!entity) {
            // null entity: optimistic — we can't evaluate ownership without data
            // Fall through to SQL checks below (if any). If none, will return true.
        } else {
            // Entity present: strictly check ownership. Fail immediately if mismatch.
            if (entity.values[rule.ownerField] !== auth.user?.uid) return false;
        }
    }

    // In PostgreSQL RLS, USING and WITH CHECK have distinct semantics:
    // USING applies to existing rows (SELECT/UPDATE/DELETE read phase)
    // WITH CHECK applies to new/modified values (INSERT/UPDATE write phase)
    // Both must pass. We evaluate both independently.
    if (rule.using && !evaluateAST(rule.using, auth, entity)) return false;
    if (rule.withCheck && !evaluateAST(rule.withCheck, auth, entity)) return false;

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
        // But for Rebase we default to true if securityRules is undefined,
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
    const userRoleIds = authController.user?.roles ?? [];
    const userRoles = [...userRoleIds, "public"];
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
