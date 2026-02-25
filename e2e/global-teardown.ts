/**
 * Playwright global teardown script.
 * Runs after ALL tests (pass or fail) and cleans up E2E test data:
 *   1. Logs in as an admin user to get an access token
 *   2. Lists all users via the admin API
 *   3. Deletes every user whose displayName is "E2E Tester"
 */

const API_URL = process.env.E2E_API_URL || 'http://localhost:3001';
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'francesco@firecms.co';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'Password123!';

async function globalTeardown() {
    console.log('\n🧹 [E2E Teardown] Starting cleanup of test data...');

    try {
        // 1. Login as admin
        const loginRes = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
        });

        if (!loginRes.ok) {
            const err = await loginRes.json().catch(() => ({}));
            console.warn(`⚠️  [E2E Teardown] Could not login as admin (${ADMIN_EMAIL}): ${err?.error?.message || loginRes.statusText}`);
            console.warn('   Skipping cleanup. Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD env vars to enable.');
            return;
        }

        const loginData = await loginRes.json();
        const accessToken = loginData.tokens?.accessToken;

        if (!accessToken) {
            console.warn('⚠️  [E2E Teardown] No access token received. Skipping cleanup.');
            return;
        }

        // 2. List all users
        const usersRes = await fetch(`${API_URL}/api/admin/users`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (!usersRes.ok) {
            console.warn(`⚠️  [E2E Teardown] Failed to list users: ${usersRes.statusText}`);
            return;
        }

        const usersData = await usersRes.json();
        const e2eUsers = (usersData.users || []).filter(
            (u: any) => u.displayName === 'E2E Tester'
        );

        if (e2eUsers.length === 0) {
            console.log('✅ [E2E Teardown] No E2E test users found. Nothing to clean up.');
            return;
        }

        console.log(`🗑️  [E2E Teardown] Found ${e2eUsers.length} E2E test user(s) to delete...`);

        // 3. Delete each E2E test user
        let deleted = 0;
        for (const user of e2eUsers) {
            try {
                const deleteRes = await fetch(`${API_URL}/api/admin/users/${user.uid}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });

                if (deleteRes.ok) {
                    deleted++;
                } else {
                    const err = await deleteRes.json().catch(() => ({}));
                    console.warn(`   ⚠️  Failed to delete user ${user.email}: ${err?.error?.message || deleteRes.statusText}`);
                }
            } catch (err: any) {
                console.warn(`   ⚠️  Error deleting user ${user.email}: ${err.message}`);
            }
        }

        console.log(`✅ [E2E Teardown] Deleted ${deleted}/${e2eUsers.length} E2E test user(s).`);
    } catch (err: any) {
        console.error(`❌ [E2E Teardown] Cleanup failed: ${err.message}`);
        // Don't throw — teardown failures shouldn't mask test results
    }
}

export default globalTeardown;
