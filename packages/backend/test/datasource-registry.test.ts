import {
    DatasourceRegistry,
    DefaultDatasourceRegistry,
    DEFAULT_DATASOURCE_ID
} from "../src/services/datasource-registry";
import { DataSourceDelegate } from "@firecms/types";

/**
 * Mock DataSourceDelegate for testing
 */
function createMockDataSourceDelegate(key: string): DataSourceDelegate {
    return {
        key,
        initialised: true,
        fetchCollection: jest.fn().mockResolvedValue([]),
        fetchEntity: jest.fn().mockResolvedValue(undefined),
        saveEntity: jest.fn().mockResolvedValue({ id: "test-id", path: "test", values: {} }),
        deleteEntity: jest.fn().mockResolvedValue(undefined),
        checkUniqueField: jest.fn().mockResolvedValue(true),
        setDateToMidnight: jest.fn((input) => input),
    };
}

describe("DatasourceRegistry", () => {
    describe("DEFAULT_DATASOURCE_ID", () => {
        it("should be '(default)'", () => {
            expect(DEFAULT_DATASOURCE_ID).toBe("(default)");
        });
    });

    describe("DefaultDatasourceRegistry", () => {
        describe("constructor and basic operations", () => {
            it("should create an empty registry", () => {
                const registry = new DefaultDatasourceRegistry();
                expect(registry.size()).toBe(0);
                expect(registry.list()).toEqual([]);
            });

            it("should register a datasource", () => {
                const registry = new DefaultDatasourceRegistry();
                const mockDelegate = createMockDataSourceDelegate("postgres");

                registry.register("test-db", mockDelegate);

                expect(registry.has("test-db")).toBe(true);
                expect(registry.size()).toBe(1);
                expect(registry.list()).toContain("test-db");
            });

            it("should get a registered datasource", () => {
                const registry = new DefaultDatasourceRegistry();
                const mockDelegate = createMockDataSourceDelegate("postgres");

                registry.register("my-db", mockDelegate);

                const retrieved = registry.get("my-db");
                expect(retrieved).toBe(mockDelegate);
            });

            it("should return undefined for non-existent datasource", () => {
                const registry = new DefaultDatasourceRegistry();
                expect(registry.get("non-existent")).toBeUndefined();
            });
        });

        describe("default datasource handling", () => {
            it("should get default datasource with get(undefined)", () => {
                const registry = new DefaultDatasourceRegistry();
                const mockDelegate = createMockDataSourceDelegate("postgres");

                registry.register(DEFAULT_DATASOURCE_ID, mockDelegate);

                expect(registry.get(undefined)).toBe(mockDelegate);
                expect(registry.get(null)).toBe(mockDelegate);
            });

            it("should get default datasource with getDefault()", () => {
                const registry = new DefaultDatasourceRegistry();
                const mockDelegate = createMockDataSourceDelegate("postgres");

                registry.register(DEFAULT_DATASOURCE_ID, mockDelegate);

                expect(registry.getDefault()).toBe(mockDelegate);
            });

            it("should throw error when no default datasource exists", () => {
                const registry = new DefaultDatasourceRegistry();

                expect(() => registry.getDefault()).toThrow(
                    `[DatasourceRegistry] No default datasource registered.`
                );
            });
        });

        describe("getOrDefault", () => {
            let registry: DefaultDatasourceRegistry;
            let defaultDelegate: DataSourceDelegate;
            let analyticsDelegate: DataSourceDelegate;

            beforeEach(() => {
                registry = new DefaultDatasourceRegistry();
                defaultDelegate = createMockDataSourceDelegate("default-postgres");
                analyticsDelegate = createMockDataSourceDelegate("analytics-postgres");

                registry.register(DEFAULT_DATASOURCE_ID, defaultDelegate);
                registry.register("analytics", analyticsDelegate);
            });

            it("should return specific datasource when found", () => {
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
                    expect.stringContaining('Datasource "non-existent" not found')
                );

                consoleSpy.mockRestore();
            });

            it("should throw when fallback fails (no default)", () => {
                const emptyRegistry = new DefaultDatasourceRegistry();

                expect(() => emptyRegistry.getOrDefault("anything")).toThrow();
            });
        });

        describe("overwriting datasources", () => {
            it("should overwrite existing datasource with same id", () => {
                const registry = new DefaultDatasourceRegistry();
                const original = createMockDataSourceDelegate("original");
                const replacement = createMockDataSourceDelegate("replacement");

                const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

                registry.register("my-db", original);
                registry.register("my-db", replacement);

                expect(registry.get("my-db")).toBe(replacement);
                expect(consoleSpy).toHaveBeenCalledWith(
                    expect.stringContaining('Overwriting datasource with id "my-db"')
                );

                consoleSpy.mockRestore();
            });
        });

        describe("list and size", () => {
            it("should list all registered datasources", () => {
                const registry = new DefaultDatasourceRegistry();

                registry.register("db-1", createMockDataSourceDelegate("pg1"));
                registry.register("db-2", createMockDataSourceDelegate("pg2"));
                registry.register(DEFAULT_DATASOURCE_ID, createMockDataSourceDelegate("default"));

                const list = registry.list();
                expect(list).toHaveLength(3);
                expect(list).toContain("db-1");
                expect(list).toContain("db-2");
                expect(list).toContain(DEFAULT_DATASOURCE_ID);
            });

            it("should return correct size", () => {
                const registry = new DefaultDatasourceRegistry();

                expect(registry.size()).toBe(0);

                registry.register("db-1", createMockDataSourceDelegate("pg1"));
                expect(registry.size()).toBe(1);

                registry.register("db-2", createMockDataSourceDelegate("pg2"));
                expect(registry.size()).toBe(2);
            });
        });
    });

    describe("DefaultDatasourceRegistry.create() factory", () => {
        describe("with single DataSourceDelegate", () => {
            it('should register single delegate as "(default)"', () => {
                const mockDelegate = createMockDataSourceDelegate("postgres");

                const registry = DefaultDatasourceRegistry.create(mockDelegate);

                expect(registry.has(DEFAULT_DATASOURCE_ID)).toBe(true);
                expect(registry.getDefault()).toBe(mockDelegate);
                expect(registry.size()).toBe(1);
            });
        });

        describe("with map of DataSourceDelegates", () => {
            it("should register all delegates from map", () => {
                const defaultDelegate = createMockDataSourceDelegate("default-pg");
                const analyticsDelegate = createMockDataSourceDelegate("analytics-pg");

                const registry = DefaultDatasourceRegistry.create({
                    [DEFAULT_DATASOURCE_ID]: defaultDelegate,
                    "analytics": analyticsDelegate
                });

                expect(registry.size()).toBe(2);
                expect(registry.getDefault()).toBe(defaultDelegate);
                expect(registry.get("analytics")).toBe(analyticsDelegate);
            });

            it("should use first entry as default if no explicit default provided", () => {
                const db1 = createMockDataSourceDelegate("db1");
                const db2 = createMockDataSourceDelegate("db2");

                const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

                const registry = DefaultDatasourceRegistry.create({
                    "primary": db1,
                    "secondary": db2
                });

                // Should have registered both + created default pointing to first
                expect(registry.size()).toBe(3); // primary, secondary, (default)
                expect(registry.has(DEFAULT_DATASOURCE_ID)).toBe(true);
                expect(consoleSpy).toHaveBeenCalledWith(
                    expect.stringContaining('No "(default)" datasource provided')
                );

                consoleSpy.mockRestore();
            });

            it("should handle empty map gracefully", () => {
                const registry = DefaultDatasourceRegistry.create({});

                expect(registry.size()).toBe(0);
                expect(() => registry.getDefault()).toThrow();
            });
        });
    });

    describe("type detection (isDataSourceDelegate)", () => {
        it("should correctly identify a DataSourceDelegate", () => {
            const mockDelegate = createMockDataSourceDelegate("postgres");

            // The factory should recognize it as a single delegate
            const registry = DefaultDatasourceRegistry.create(mockDelegate);
            expect(registry.size()).toBe(1);
            expect(registry.has(DEFAULT_DATASOURCE_ID)).toBe(true);
        });

        it("should correctly identify a map of DataSourceDelegates", () => {
            const delegates = {
                [DEFAULT_DATASOURCE_ID]: createMockDataSourceDelegate("pg1"),
                "other": createMockDataSourceDelegate("pg2")
            };

            // The factory should recognize it as a map
            const registry = DefaultDatasourceRegistry.create(delegates);
            expect(registry.size()).toBe(2);
        });

        it("should not mistakenly identify a map as a single delegate", () => {
            // A map doesn't have the required DataSourceDelegate methods
            const map = {
                key: "not-a-delegate", // This looks like the key property but...
                db1: createMockDataSourceDelegate("pg1")
            };

            // This should be treated as a map (and show a warning because 'key' isn't a valid delegate)
            const registry = DefaultDatasourceRegistry.create(map as any);
            // 'key' entry will be ignored since it's not a valid delegate
            expect(registry.has("db1")).toBe(true);
        });
    });
});
