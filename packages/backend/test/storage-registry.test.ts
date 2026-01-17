import {
    StorageRegistry,
    DefaultStorageRegistry,
    DEFAULT_STORAGE_ID
} from "../src/storage/storage-registry";
import { StorageController } from "../src/storage/types";

/**
 * Mock StorageController for testing
 */
function createMockStorageController(type: 'local' | 's3'): StorageController {
    return {
        uploadFile: jest.fn().mockResolvedValue({ path: "test/file.txt" }),
        getDownloadURL: jest.fn().mockResolvedValue({ url: "http://example.com/file.txt" }),
        getFile: jest.fn().mockResolvedValue(null),
        deleteFile: jest.fn().mockResolvedValue(undefined),
        list: jest.fn().mockResolvedValue({ items: [], prefixes: [] }),
        getType: jest.fn().mockReturnValue(type)
    };
}

describe("StorageRegistry", () => {
    describe("DEFAULT_STORAGE_ID", () => {
        it("should be '(default)'", () => {
            expect(DEFAULT_STORAGE_ID).toBe("(default)");
        });
    });

    describe("DefaultStorageRegistry", () => {
        describe("constructor and basic operations", () => {
            it("should create an empty registry", () => {
                const registry = new DefaultStorageRegistry();
                expect(registry.size()).toBe(0);
                expect(registry.list()).toEqual([]);
            });

            it("should register a storage controller", () => {
                const registry = new DefaultStorageRegistry();
                const mockController = createMockStorageController('local');

                registry.register("test-storage", mockController);

                expect(registry.has("test-storage")).toBe(true);
                expect(registry.size()).toBe(1);
                expect(registry.list()).toContain("test-storage");
            });

            it("should get a registered storage controller", () => {
                const registry = new DefaultStorageRegistry();
                const mockController = createMockStorageController('s3');

                registry.register("my-storage", mockController);

                const retrieved = registry.get("my-storage");
                expect(retrieved).toBe(mockController);
            });

            it("should return undefined for non-existent storage", () => {
                const registry = new DefaultStorageRegistry();
                expect(registry.get("non-existent")).toBeUndefined();
            });
        });

        describe("default storage handling", () => {
            it("should get default storage with get(undefined)", () => {
                const registry = new DefaultStorageRegistry();
                const mockController = createMockStorageController('local');

                registry.register(DEFAULT_STORAGE_ID, mockController);

                expect(registry.get(undefined)).toBe(mockController);
                expect(registry.get(null)).toBe(mockController);
            });

            it("should get default storage with getDefault()", () => {
                const registry = new DefaultStorageRegistry();
                const mockController = createMockStorageController('local');

                registry.register(DEFAULT_STORAGE_ID, mockController);

                expect(registry.getDefault()).toBe(mockController);
            });

            it("should throw error when no default storage exists", () => {
                const registry = new DefaultStorageRegistry();

                expect(() => registry.getDefault()).toThrow(
                    `[StorageRegistry] No default storage registered.`
                );
            });
        });

        describe("getOrDefault", () => {
            let registry: DefaultStorageRegistry;
            let defaultController: StorageController;
            let mediaController: StorageController;

            beforeEach(() => {
                registry = new DefaultStorageRegistry();
                defaultController = createMockStorageController('local');
                mediaController = createMockStorageController('s3');

                registry.register(DEFAULT_STORAGE_ID, defaultController);
                registry.register("media", mediaController);
            });

            it("should return specific storage when found", () => {
                expect(registry.getOrDefault("media")).toBe(mediaController);
            });

            it("should return default when id is undefined", () => {
                expect(registry.getOrDefault(undefined)).toBe(defaultController);
            });

            it("should return default when id is null", () => {
                expect(registry.getOrDefault(null)).toBe(defaultController);
            });

            it("should fallback to default when id not found", () => {
                const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

                expect(registry.getOrDefault("non-existent")).toBe(defaultController);
                expect(consoleSpy).toHaveBeenCalledWith(
                    expect.stringContaining('Storage "non-existent" not found')
                );

                consoleSpy.mockRestore();
            });

            it("should throw when fallback fails (no default)", () => {
                const emptyRegistry = new DefaultStorageRegistry();

                expect(() => emptyRegistry.getOrDefault("anything")).toThrow();
            });
        });

        describe("overwriting storages", () => {
            it("should overwrite existing storage with same id", () => {
                const registry = new DefaultStorageRegistry();
                const original = createMockStorageController('local');
                const replacement = createMockStorageController('s3');

                const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

                registry.register("my-storage", original);
                registry.register("my-storage", replacement);

                expect(registry.get("my-storage")).toBe(replacement);
                expect(consoleSpy).toHaveBeenCalledWith(
                    expect.stringContaining('Overwriting storage with id "my-storage"')
                );

                consoleSpy.mockRestore();
            });
        });

        describe("list and size", () => {
            it("should list all registered storages", () => {
                const registry = new DefaultStorageRegistry();

                registry.register("storage-1", createMockStorageController('local'));
                registry.register("storage-2", createMockStorageController('s3'));
                registry.register(DEFAULT_STORAGE_ID, createMockStorageController('local'));

                const list = registry.list();
                expect(list).toHaveLength(3);
                expect(list).toContain("storage-1");
                expect(list).toContain("storage-2");
                expect(list).toContain(DEFAULT_STORAGE_ID);
            });

            it("should return correct size", () => {
                const registry = new DefaultStorageRegistry();

                expect(registry.size()).toBe(0);

                registry.register("storage-1", createMockStorageController('local'));
                expect(registry.size()).toBe(1);

                registry.register("storage-2", createMockStorageController('s3'));
                expect(registry.size()).toBe(2);
            });
        });
    });

    describe("DefaultStorageRegistry.create() factory", () => {
        describe("with single StorageController", () => {
            it('should register single controller as "(default)"', () => {
                const mockController = createMockStorageController('local');

                const registry = DefaultStorageRegistry.create(mockController);

                expect(registry.has(DEFAULT_STORAGE_ID)).toBe(true);
                expect(registry.getDefault()).toBe(mockController);
                expect(registry.size()).toBe(1);
            });
        });

        describe("with map of StorageControllers", () => {
            it("should register all controllers from map", () => {
                const defaultController = createMockStorageController('local');
                const mediaController = createMockStorageController('s3');

                const registry = DefaultStorageRegistry.create({
                    [DEFAULT_STORAGE_ID]: defaultController,
                    "media": mediaController
                });

                expect(registry.size()).toBe(2);
                expect(registry.getDefault()).toBe(defaultController);
                expect(registry.get("media")).toBe(mediaController);
            });

            it("should use first entry as default if no explicit default provided", () => {
                const local = createMockStorageController('local');
                const s3 = createMockStorageController('s3');

                const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

                const registry = DefaultStorageRegistry.create({
                    "primary": local,
                    "secondary": s3
                });

                // Should have registered both + created default pointing to first
                expect(registry.size()).toBe(3); // primary, secondary, (default)
                expect(registry.has(DEFAULT_STORAGE_ID)).toBe(true);
                expect(consoleSpy).toHaveBeenCalledWith(
                    expect.stringContaining('No "(default)" storage provided')
                );

                consoleSpy.mockRestore();
            });

            it("should handle empty map gracefully", () => {
                const registry = DefaultStorageRegistry.create({});

                expect(registry.size()).toBe(0);
                expect(() => registry.getDefault()).toThrow();
            });
        });
    });

    describe("type detection (isStorageController)", () => {
        it("should correctly identify a StorageController", () => {
            const mockController = createMockStorageController('local');

            // The factory should recognize it as a single controller
            const registry = DefaultStorageRegistry.create(mockController);
            expect(registry.size()).toBe(1);
            expect(registry.has(DEFAULT_STORAGE_ID)).toBe(true);
        });

        it("should correctly identify a map of StorageControllers", () => {
            const controllers = {
                [DEFAULT_STORAGE_ID]: createMockStorageController('local'),
                "other": createMockStorageController('s3')
            };

            // The factory should recognize it as a map
            const registry = DefaultStorageRegistry.create(controllers);
            expect(registry.size()).toBe(2);
        });
    });

    describe("integration with storage types", () => {
        it("should correctly report storage types", () => {
            const localController = createMockStorageController('local');
            const s3Controller = createMockStorageController('s3');

            const registry = DefaultStorageRegistry.create({
                [DEFAULT_STORAGE_ID]: localController,
                "media": s3Controller
            });

            expect(registry.getDefault().getType()).toBe('local');
            expect(registry.get("media")?.getType()).toBe('s3');
        });
    });
});
