import fs from 'fs';

function fixFile(file) {
    let code = fs.readFileSync(file, 'utf8');

    // Remove the mock of services
    code = code.replace(/jest\.mock\("\.\.\/src\/auth\/services"\);\n?/g, '');
    
    // Remove imports of services
    code = code.replace(/import \{ UserService, RoleService, RefreshTokenService, PasswordResetTokenService \} from "\.\.\/src\/auth\/services";\n?/g, '');
    
    // Add import of AuthRepository
    if (!code.includes('import type { AuthRepository }')) {
        code = code.replace(/import \{ createAuthRoutes(?:, AuthModuleConfig)? \} from "\.\.\/src\/auth\/routes";/, 
            '$&\nimport type { AuthRepository } from "../src/auth/interfaces";');
    }

    // Replace the variables
    code = code.replace(/let mockUserSvc: jest\.Mocked<UserService>;\n/g, '');
    code = code.replace(/let mockRoleSvc: jest\.Mocked<RoleService>;\n/g, '');
    code = code.replace(/let mockRefreshSvc: jest\.Mocked<RefreshTokenService>;\n/g, '');
    code = code.replace(/let mockResetSvc: jest\.Mocked<PasswordResetTokenService>;\n/g, '');
    
    if (!code.includes('let mockAuthRepo: jest.Mocked<AuthRepository>;')) {
        code = code.replace(/let mockEmailService:/, 'let mockAuthRepo: jest.Mocked<AuthRepository>;\nlet mockEmailService:');
    }

    // Replace the assignments in createApp
    code = code.replace(/mockUserSvc = new UserService.*?\n/g, '');
    code = code.replace(/mockRoleSvc = new RoleService.*?\n/g, '');
    code = code.replace(/mockRefreshSvc = new RefreshTokenService.*?\n/g, '');
    code = code.replace(/mockResetSvc = new PasswordResetTokenService.*?\n/g, '');

    code = code.replace(/\(UserService as jest\.Mock\).*\n/g, '');
    code = code.replace(/\(RoleService as jest\.Mock\).*\n/g, '');
    code = code.replace(/\(RefreshTokenService as jest\.Mock\).*\n/g, '');
    code = code.replace(/\(PasswordResetTokenService as jest\.Mock\).*\n/g, '');

    const repoSetup = `
    mockAuthRepo = {
        getUserByEmail: jest.fn().mockResolvedValue(null),
        getUserByGoogleId: jest.fn().mockResolvedValue(null),
        getUserById: jest.fn().mockResolvedValue(null),
        createUser: jest.fn().mockImplementation((data) =>
            Promise.resolve(mockUser({ email: data.email, displayName: data.displayName, passwordHash: data.passwordHash }))
        ),
        listUsers: jest.fn().mockResolvedValue([]),
        getUserRoles: jest.fn().mockResolvedValue([mockRole("editor")]),
        getUserRoleIds: jest.fn().mockResolvedValue(["editor"]),
        assignDefaultRole: jest.fn().mockResolvedValue(undefined),
        setUserRoles: jest.fn().mockResolvedValue(undefined),
        updateUser: jest.fn().mockImplementation((id, data) =>
            Promise.resolve(mockUser({ id, ...data }))
        ),
        deleteUser: jest.fn().mockResolvedValue(undefined),
        updatePassword: jest.fn().mockResolvedValue(undefined),
        setEmailVerified: jest.fn().mockResolvedValue(undefined),
        setVerificationToken: jest.fn().mockResolvedValue(undefined),
        getUserByVerificationToken: jest.fn().mockResolvedValue(null),
        getUserWithRoles: jest.fn().mockImplementation(async (userId) => {
            const user = mockUser({ id: userId });
            return { user, roles: [mockRole("editor")] };
        }),
        createRefreshToken: jest.fn().mockResolvedValue(undefined),
        findRefreshTokenByHash: jest.fn().mockResolvedValue(null),
        deleteRefreshToken: jest.fn().mockResolvedValue(undefined),
        deleteAllRefreshTokensForUser: jest.fn().mockResolvedValue(undefined),
        listRefreshTokensForUser: jest.fn().mockResolvedValue([]),
        deleteRefreshTokenById: jest.fn().mockResolvedValue(undefined),
        createPasswordResetToken: jest.fn().mockResolvedValue(undefined),
        findValidPasswordResetToken: jest.fn().mockResolvedValue(null),
        markPasswordResetTokenUsed: jest.fn().mockResolvedValue(undefined),
        deleteExpiredPasswordResetTokens: jest.fn().mockResolvedValue(undefined)
    } as unknown as jest.Mocked<AuthRepository>;
    `;

    // Only inject setup once
    if (code.includes('mockUserSvc.getUserByEmail = jest.fn()')) {
        code = code.replace(/mockUserSvc\.getUserByEmail = jest\.fn\(\)\.mockResolvedValue\(null\);\n[\s\S]*?mockResetSvc\.deleteExpired = jest\.fn\(\)\.mockResolvedValue\(undefined\);/g, repoSetup);
    }
    
    // Also inject repoSetup in admin-routes if it has slightly different init
    if (code.includes('mockUserSvc.listUsers = jest.fn()') && !code.includes('mockAuthRepo = {')) {
         code = code.replace(/mockUserSvc\.listUsers = jest\.fn\(\)\.mockResolvedValue\(\[\]\);\n[\s\S]*?mockRoleSvc\.deleteRole = jest\.fn\(\)\.mockResolvedValue\(undefined\);/g, repoSetup.replace('deleteExpiredPasswordResetTokens', 'deleteExpiredPasswordResetTokens,\n        listRoles: jest.fn().mockResolvedValue([]),\n        getRoleById: jest.fn().mockResolvedValue(null),\n        createRole: jest.fn().mockImplementation(r => Promise.resolve({ id: r.id, name: r.name, isAdmin: r.isAdmin || false, defaultPermissions: null, collectionPermissions: null, config: null })),\n        updateRole: jest.fn().mockImplementation((id, r) => Promise.resolve({ id, name: r.name, isAdmin: r.isAdmin || false, defaultPermissions: null, collectionPermissions: null, config: null })),\n        deleteRole: jest.fn().mockResolvedValue(undefined)'));
    }

    // For some usages
    code = code.replace(/mockRefreshSvc\.findByHash/g, 'mockAuthRepo.findRefreshTokenByHash');
    code = code.replace(/mockRefreshSvc\.deleteByHash/g, 'mockAuthRepo.deleteRefreshToken');
    code = code.replace(/mockRefreshSvc\.deleteAllForUser/g, 'mockAuthRepo.deleteAllRefreshTokensForUser');
    code = code.replace(/mockRefreshSvc\.listForUser/g, 'mockAuthRepo.listRefreshTokensForUser');
    code = code.replace(/mockRefreshSvc\.deleteById/g, 'mockAuthRepo.deleteRefreshTokenById');
    code = code.replace(/mockRefreshSvc\.createToken/g, 'mockAuthRepo.createRefreshToken');

    code = code.replace(/mockResetSvc\.createToken/g, 'mockAuthRepo.createPasswordResetToken');
    code = code.replace(/mockResetSvc\.findValidByHash/g, 'mockAuthRepo.findValidPasswordResetToken');
    code = code.replace(/mockResetSvc\.markAsUsed/g, 'mockAuthRepo.markPasswordResetTokenUsed');
    code = code.replace(/mockResetSvc\.deleteAllForUser/g, ''); // Was not on auth repo
    code = code.replace(/mockResetSvc\.deleteExpired/g, 'mockAuthRepo.deleteExpiredPasswordResetTokens');

    code = code.replace(/mockUserSvc\./g, 'mockAuthRepo.');
    code = code.replace(/mockRoleSvc\./g, 'mockAuthRepo.');

    // In createAuthRoutes and createAdminRoutes, config needs authRepo
    code = code.replace(/db: \{\} as any,/g, 'authRepo: mockAuthRepo,');
    
    fs.writeFileSync(file, code);
}

fixFile('packages/backend/test/auth-routes.test.ts');
try { fixFile('packages/backend/test/admin-routes.test.ts'); } catch (e) {}

console.log("Refactored tests!");
