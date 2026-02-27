import { spawn, ChildProcess } from 'child_process';
import { Client } from 'pg';
import path from 'path';
import fs from 'fs';
import dns from 'dns';

// Fix for Node.js 18+ preferring IPv6 for localhost which can break connections
dns.setDefaultResultOrder('ipv4first');

// Load .env explicitly to find DATABASE_URL
const envPath = path.resolve(process.cwd(), 'app/.env');
if (!fs.existsSync(envPath)) {
    console.error(`Missing app/.env at ${envPath}`);
    process.exit(1);
}

const envParams = fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#'))
    .reduce((acc, line) => {
        const [key, ...rest] = line.split('=');
        acc[key.trim()] = rest.join('=').trim().replace(/^['"](.*)['"]$/, '$1');
        return acc;
    }, {} as Record<string, string>);

const BASE_DB_URL = envParams['DATABASE_URL'] || process.env.DATABASE_URL;
if (!BASE_DB_URL) {
    console.error("DATABASE_URL is not set in app/.env");
    process.exit(1);
}

const timestamp = Date.now();
const DB_NAME = `firecms_e2e_${timestamp}`;
const E2E_PG_URL = BASE_DB_URL.replace(/\/[^/?]+(\?|$)/, `/${DB_NAME}$1`);

const BACKEND_PORT = 3002;
const FRONTEND_PORT = 5174;

// Store spawned processes for cleanup
const childProcesses: ChildProcess[] = [];

async function cleanupAndExit(code: number) {
    console.log('\n🧹 [Runner] Cleaning up E2E environment...');

    // Kill processes
    for (const cp of childProcesses) {
        if (cp.pid) {
            try {
                process.kill(-cp.pid, 'SIGINT'); // Send to process group
            } catch (e) {
                try { process.kill(cp.pid, 'SIGINT'); } catch (e2) { }
            }
        }
    }

    // Wait for processes to exit
    await new Promise(r => setTimeout(r, 2000));

    // Drop database
    console.log(`🧹 [Runner] Dropping temporary database: ${DB_NAME}`);
    const client = new Client({ connectionString: BASE_DB_URL });
    try {
        await client.connect();
        // Terminate active connections first
        await client.query(`
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = $1
              AND pid <> pg_backend_pid()
        `, [DB_NAME]);
        await client.query(`DROP DATABASE IF EXISTS ${DB_NAME}`);
        await client.end();
        console.log(`✅ [Runner] Temporary database ${DB_NAME} dropped successfully.`);
    } catch (e) {
        console.error(`❌ [Runner] Failed to drop database ${DB_NAME}:`, e);
    }

    process.exit(code);
}

// Trap termination signals for cleanup
process.on('SIGINT', () => cleanupAndExit(1));
process.on('SIGTERM', () => cleanupAndExit(1));

async function waitForPort(port: number, timeout = 30000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        try {
            const res = await fetch(`http://127.0.0.1:${port}`);
            if (res.status !== undefined) return true;
        } catch (e) {
            // port not ready
        }
        await new Promise(r => setTimeout(r, 500));
    }
    throw new Error(`Timeout waiting for port ${port}`);
}

async function run() {
    console.log(`🚀 [Runner] Starting E2E orchestration...`);
    console.log(`📦 [Runner] Creating temporary database: ${DB_NAME}`);

    const client = new Client({ connectionString: BASE_DB_URL });
    await client.connect();
    await client.query(`CREATE DATABASE ${DB_NAME}`);
    await client.end();

    console.log(`✅ [Runner] Database ${DB_NAME} created.`);

    const sharedEnv = {
        ...process.env,
        DATABASE_URL: E2E_PG_URL,
        PORT: BACKEND_PORT.toString(),
        VITE_API_URL: `http://localhost:${BACKEND_PORT}`,
        E2E_FRONTEND_URL: `http://localhost:${FRONTEND_PORT}`,
        E2E_API_URL: `http://localhost:${BACKEND_PORT}`,
        E2E_ADMIN_EMAIL: 'admin_e2e@test.firecms.co',
        E2E_ADMIN_PASSWORD: 'Password123!'
    };

    // 1. Push Schema
    console.log(`🛠️  [Runner] Pushing Drizzle schema...`);
    const pushCmd = spawn('pnpm', ['run', 'db:push'], {
        cwd: path.resolve(process.cwd(), 'app/backend'),
        env: sharedEnv,
        stdio: 'inherit',
        detached: true
    });

    await new Promise<void>((resolve, reject) => {
        pushCmd.on('close', code => {
            if (code === 0) resolve();
            else reject(new Error(`drizzle-kit push failed with code ${code}`));
        });
    });

    // 2. Spawn Backend
    console.log(`⚙️  [Runner] Starting backend on port ${BACKEND_PORT}...`);
    const backendCmd = spawn('pnpm', ['run', 'dev'], {
        cwd: path.resolve(process.cwd(), 'app/backend'),
        env: sharedEnv,
        stdio: 'pipe',
        detached: true
    });
    childProcesses.push(backendCmd);
    backendCmd.stdout.on('data', d => process.stdout.write(`[Backend] ${d}`));
    backendCmd.stderr.on('data', d => process.stderr.write(`[Backend ERROR] ${d}`));

    await waitForPort(BACKEND_PORT);
    console.log(`✅ [Runner] Backend is ready.`);

    // Allow time for FireCMS backend to initialize core tables (like users and roles)
    await new Promise(r => setTimeout(r, 4000));

    // 3. Seed Admin User
    console.log(`👤 [Runner] Seeding E2E admin user...`);
    try {
        const regRes = await fetch(`http://127.0.0.1:${BACKEND_PORT}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin_e2e@test.firecms.co',
                password: 'Password123!',
                displayName: 'E2E Admin'
            })
        });

        if (!regRes.ok) {
            throw new Error(`Registration failed: ${await regRes.text()}`);
        }

        const regData = await regRes.json();
        const userId = regData.user.uid;

        // Grant admin role via raw postgres
        const e2eClient = new Client({ connectionString: E2E_PG_URL });
        await e2eClient.connect();
        await e2eClient.query(`INSERT INTO firecms_roles (id, name) VALUES ('admin', 'Admin') ON CONFLICT DO NOTHING`);
        await e2eClient.query(`INSERT INTO firecms_user_roles (user_id, role_id) VALUES ($1, 'admin') ON CONFLICT DO NOTHING`, [userId]);
        await e2eClient.end();
        console.log(`✅ [Runner] Admin user seeded successfully (${userId}).`);
    } catch (e) {
        console.error(`❌ [Runner] Failed to seed admin user:`, e);
        // Continue anyway, tests might still partially pass
    }

    // 4. Spawn Frontend
    console.log(`🖥️  [Runner] Starting frontend on port ${FRONTEND_PORT}...`);
    const frontendCmd = spawn('pnpm', ['run', 'dev', '--port', FRONTEND_PORT.toString(), '--strictPort', '--host', '127.0.0.1'], {
        cwd: path.resolve(process.cwd(), 'app/frontend'),
        env: sharedEnv,
        stdio: 'pipe',
        detached: true
    });
    childProcesses.push(frontendCmd);
    frontendCmd.stdout.on('data', d => process.stdout.write(`[Frontend] ${d}`));
    frontendCmd.stderr.on('data', d => process.stderr.write(`[Frontend ERROR] ${d}`));

    await waitForPort(FRONTEND_PORT);
    console.log(`✅ [Runner] Frontend is ready.`);

    // 5. Run Playwright
    console.log(`🎭 [Runner] Executing Playwright suite...`);
    const playwrightArgs = ['playwright', 'test', '--config=e2e/playwright.config.ts'];
    // Pass along any extra arguments like specific test files
    playwrightArgs.push(...process.argv.slice(2));

    const pwCmd = spawn('npx', playwrightArgs, {
        cwd: process.cwd(),
        env: sharedEnv,
        stdio: 'inherit',
        detached: true
    });
    childProcesses.push(pwCmd);

    pwCmd.on('close', (code) => {
        cleanupAndExit(code ?? 0);
    });
}

run().catch(e => {
    console.error("Runner failed:", e);
    cleanupAndExit(1);
});
