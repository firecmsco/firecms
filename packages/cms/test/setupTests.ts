// CMS test setup
// This file is referenced by jest.setupFilesAfterSetup in package.json.
// Add any global test setup logic here.

import { TextEncoder, TextDecoder } from "util";
Object.assign(global, { TextDecoder, TextEncoder });

// Mock window.matchMedia for jsdom environment (used by useLargeLayout in @rebasepro/core)
Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});
