import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    timeout: 45 * 1000,
    expect: {
        timeout: 10 * 1000
    },
    fullyParallel: false,
    retries: 0,
    workers: 1, // Single worker avoids database write conflicts since the tests are not isolated
    reporter: 'html',
    use: {
        baseURL: 'http://localhost:5173',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure'
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        }
    ],
});
