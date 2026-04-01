import {
    DriverRegistry,
    DefaultDriverRegistry,
    DEFAULT_DRIVER_ID
} from "../src/services/driver-registry";
import { DataDriver } from "@rebasepro/types";

/**
 * Mock DataDriver for testing
 */
function createMockDataDriverDelegate(key: string): DataDriver {
    return {
        key,
        initialised: true,
        fetchCollection: jest.fn().mockResolvedValue([]),
        fetchEntity: jest.fn().mockResolvedValue(undefined),
        saveEntity: jest.fn().mockResolvedValue({ id: "test-id", path: "test", values: {} }),
        deleteEntity: jest.fn().mockResolvedValue(undefined),
        checkUniqueField: jest.fn().mockResolvedValue(true)
    };
}

describe("DriverRegistry", () => {
    describe("DEFAULT_DRIVER_ID", () => {
        it("should be '(default)'", () => {
            expect(DEFAULT_DRIVER_ID).toBe("(default)");
        });
    });

    describe("DefaultDriverRegistry", () => {
        describe("constructor and basic operations", () => {
            it("should create an empty registry", () => {
                const registry = new DefaultDriverRegistry();
                expect(registry.size()).toBe(0);
                expect(registry.list()).toEqual([]);
            });

            it("should register a driver", () => {
                const registry = new DefaultDriverRegistry();
                const mockDelegate = createMockDataDriverDelegate("postgres");

                registry.register("test-db", mockDelegate);

                expect(registry.has("test-db")).toBe(true);
                expect(registry.size()).toBe(1);
                expect(registry.list()).toContain("test-db");
            });

            it("should get a registered driver", () => {
                const registry = new DefaultDriverRegistry();
                const mockDelegate = createMockDataDriverDelegate("postgres");

                registry.register("my-db", mockDelegate);

                const retrieved = registry.get("my-db");
                expect(retrieved).toBe(mockDelegate);
            });

            it("should return undefined for non-existent driver", () => {
                const registry = new DefaultDriverRegistry();
                expect(registry.get("non-existent")).toBeUndefined();
            });
        });

        describe("default driver handling", () => {
            it("should get default driver with get(undefined)", () => {
                const registry = new DefaultDriverRegistry();
                const mockDelegate = createMockDataDriverDelegate("postgres");

                registry.register(DEFAULT_DRIVER_ID, mockDelegate);

                expect(registry.get(undefined)).toBe(mockDelegate);
                expect(registry.get(null)).toBe(mockDelegate);
            });

            it("should get default driver with getDefault()", () => {
                const registry = new DefaultDriverRegistry();
                const mockDelegate = createMockDataDriverDelegate("postgres");

                registry.register(DEFAULT_DRIVER_ID, mockDelegate);

                expect(registry.getDefault()).toBe(mockDelegate);
            });

            it("should throw error when no default driver exists", () => {
                const registry = new DefaultDriverRegistry();

                expect(() => registry.getDefault()).toThrow(
                    `[DriverRegistry] No default driver registered.`
                );
            });
        });

        describe("getOrDefault", () => {
            let registry: DefaultDriverRegistry;
            let defaultDelegate: DataDriver;
            let analyticsDelegate: DataDriver;

            beforeEach(() => {
                registry = new DefaultDriverRegistry();
                defaultDelegate = createMockDataDriverDelegate("default-postgres");
                analyticsDelegate = createMockDataDriverDelegate("analytics-postgres");

                registry.register(DEFAULT_DRIVER_ID, defaultDelegate);
                registry.register("analytics", analyticsDelegate);
            });

            it("should return specific driver when found", () => {
                expect(registry.getOrDefault("analytics")).toBe(analyticsDelegate);
            });

            it("should return default when id is undefined", () => {
                expect(registry.getOrDefault(undefined)).toBe(defaultDelegate);
            });

            it("should return default when id is null", () => {
                expect(registry.getOrDefault(null)).toBe(defaultDelegate);
            });

            it("should fallback to default when id not found", () => {
                // This should log a warning and return the default
                const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

                expect(registry.getOrDefault("non-existent")).toBe(defaultDelegate);
                expect(consoleSpy).toHaveBeenCalledWith(
                    expect.stringContaining('Driver "non-existent" not found')
                );

                consoleSpy.mockRestore();
            });

            it("should throw when fallback fails (no default)", () => {
                const emptyRegistry = new DefaultDriverRegistry();

                expect(() => emptyRegistry.getOrDefault("anything")).toThrow();
            });
        });

        describe("overwriting drivers", () => {
            it("should overwrite existing driver with same id", () => {
                const registry = new DefaultDriverRegistry();
                const original = createMockDataDriverDelegate("original");
                const replacement = createMockDataDriverDelegate("replacement");

                const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

                registry.register("my-db", original);
                registry.register("my-db", replacement);

                expect(registry.get("my-db")).toBe(replacement);
                expect(consoleSpy).toHaveBeenCalledWith(
                    expect.stringContaining('Overwriting driver with id "my-db"')
                );

                consoleSpy.mockRestore();
            });
        });

        describe("list and size", () => {
            it("should list all registered drivers", () => {
                const registry = new DefaultDriverRegistry();

                registry.register("db-1", createMockDataDriverDelegate("pg1"));
                registry.register("db-2", createMockDataDriverDelegate("pg2"));
                registry.register(DEFAULT_DRIVER_ID, createMockDataDriverDelegate("default"));

                const list = registry.list();
                expect(list).toHaveLength(3);
                expect(list).toContain("db-1");
                expect(list).toContain("db-2");
                expect(list).toContain(DEFAULT_DRIVER_ID);
            });

            it("should return correct size", () => {
                const registry = new DefaultDriverRegistry();

                expect(registry.size()).toBe(0);

                registry.register("db-1", createMockDataDriverDelegate("pg1"));
                expect(registry.size()).toBe(1);

                registry.register("db-2", createMockDataDriverDelegate("pg2"));
                expect(registry.size()).toBe(2);
            });
        });
    });

    describe("DefaultDriverRegistry.create() factory", () => {
        describe("with single DataDriver", () => {
            it('should register single delegate as "(default)"', () => {
                const mockDelegate = createMockDataDriverDelegate("postgres");

                const registry = DefaultDriverRegistry.create(mockDelegate);

                expect(registry.has(DEFAULT_DRIVER_ID)).toBe(true);
                expect(registry.getDefault()).toBe(mockDelegate);
                expect(registry.size()).toBe(1);
            });
        });

        describe("with map of DataDriverDelegates", () => {
            it("should register all delegates from map", () => {
                const defaultDelegate = createMockDataDriverDelegate("default-pg");
                const analyticsDelegate = createMockDataDriverDelegate("analytics-pg");

                const registry = DefaultDriverRegistry.create({
                    [DEFAULT_DRIVER_ID]: defaultDelegate,
                    "analytics": analyticsDelegate
                });

                expect(registry.size()).toBe(2);
                expect(registry.getDefault()).toBe(defaultDelegate);
                expect(registry.get("analytics")).toBe(analyticsDelegate);
            });

            it("should use first entry as default if no explicit default provided", () => {
                const db1 = createMockDataDriverDelegate("db1");
                const db2 = createMockDataDriverDelegate("db2");

                const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

                const registry = DefaultDriverRegistry.create({
                    "primary": db1,
                    "secondary": db2
                });

                // Should have registered both + created default pointing to first
                expect(registry.size()).toBe(3); // primary, secondary, (default)
                expect(registry.has(DEFAULT_DRIVER_ID)).toBe(true);
                expect(consoleSpy).toHaveBeenCalledWith(
                    expect.stringContaining('No "(default)" driver provided')
                );

                consoleSpy.mockRestore();
            });

            it("should handle empty map gracefully", () => {
                const registry = DefaultDriverRegistry.create({});

                expect(registry.size()).toBe(0);
                expect(() => registry.getDefault()).toThrow();
            });
        });
    });

    describe("type detection (isDataDriverDelegate)", () => {
        it("should correctly identify a DataDriver", () => {
            const mockDelegate = createMockDataDriverDelegate("postgres");

            // The factory should recognize it as a single delegate
            const registry = DefaultDriverRegistry.create(mockDelegate);
            expect(registry.size()).toBe(1);
            expect(registry.has(DEFAULT_DRIVER_ID)).toBe(true);
        });

        it("should correctly identify a map of DataDriverDelegates", () => {
            const delegates = {
                [DEFAULT_DRIVER_ID]: createMockDataDriverDelegate("pg1"),
                "other": createMockDataDriverDelegate("pg2")
            };

            // The factory should recognize it as a map
            const registry = DefaultDriverRegistry.create(delegates);
            expect(registry.size()).toBe(2);
        });

        it("should not mistakenly identify a map as a single delegate", () => {
            // A map doesn't have the required DataDriver methods
            const map = {
                key: "not-a-delegate", // This looks like the key property but...
                db1: createMockDataDriverDelegate("pg1")
            };

            // This should be treated as a map (and show a warning because 'key' isn't a valid delegate)
            const registry = DefaultDriverRegistry.create(map as any);
            // 'key' entry will be ignored since it's not a valid delegate
            expect(registry.has("db1")).toBe(true);
        });
    });
});
