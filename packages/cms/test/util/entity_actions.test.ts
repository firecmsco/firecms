/**
 * @jest-environment jsdom
 */
import { mergeEntityActions } from "../../src/util/entity_actions";
import type { EntityAction } from "@rebasepro/types";

describe("mergeEntityActions", () => {

    const editAction: EntityAction = {
        key: "edit",
        name: "Edit",
        onClick: jest.fn(),
    } as unknown as EntityAction;

    const deleteAction: EntityAction = {
        key: "delete",
        name: "Delete",
        onClick: jest.fn(),
    } as unknown as EntityAction;

    const copyAction: EntityAction = {
        key: "copy",
        name: "Copy",
        onClick: jest.fn(),
    } as unknown as EntityAction;

    const customAction: EntityAction = {
        key: "export",
        name: "Export Data",
        onClick: jest.fn(),
    } as unknown as EntityAction;

    const anotherCustom: EntityAction = {
        key: "archive",
        name: "Archive",
        onClick: jest.fn(),
    } as unknown as EntityAction;

    it("returns the original actions when new list is empty", () => {
        const result = mergeEntityActions([editAction, deleteAction], []);
        expect(result).toEqual([editAction, deleteAction]);
    });

    it("returns the new actions when current list is empty", () => {
        const result = mergeEntityActions([], [customAction, anotherCustom]);
        expect(result).toEqual([customAction, anotherCustom]);
    });

    it("replaces existing actions with the same key", () => {
        const updatedEdit: EntityAction = {
            key: "edit",
            name: "Edit V2",
            onClick: jest.fn(),
        } as unknown as EntityAction;

        const result = mergeEntityActions([editAction, deleteAction], [updatedEdit]);
        expect(result).toHaveLength(2);
        expect(result[0].name).toBe("Edit V2");
        expect(result[1].key).toBe("delete");
    });

    it("appends new non-reserved actions", () => {
        const result = mergeEntityActions([editAction], [customAction]);
        expect(result).toHaveLength(2);
        expect(result[0].key).toBe("edit");
        expect(result[1].key).toBe("export");
    });

    it("does NOT append new actions with reserved keys (edit, copy, delete) unless they replace existing ones", () => {
        // If "delete" is not in the current list, it shouldn't be added since it's reserved
        const result = mergeEntityActions([editAction], [deleteAction]);
        // delete is reserved and not in current actions => not appended
        expect(result).toHaveLength(1);
        expect(result[0].key).toBe("edit");
    });

    it("does append a custom action that replaces an existing reserved key", () => {
        const customDeleteOverride: EntityAction = {
            key: "delete",
            name: "Custom Delete",
            onClick: jest.fn(),
        } as unknown as EntityAction;

        // "delete" is in current actions, so it gets replaced
        const result = mergeEntityActions([editAction, deleteAction], [customDeleteOverride]);
        expect(result).toHaveLength(2);
        const mergedDelete = result.find(a => a.key === "delete");
        expect(mergedDelete?.name).toBe("Custom Delete");
    });

    it("handles actions with undefined keys", () => {
        const noKeyAction: EntityAction = {
            name: "No Key Action",
            onClick: jest.fn(),
        } as unknown as EntityAction;

        const result = mergeEntityActions([editAction], [noKeyAction]);
        // key is undefined, which is not in reservedKeys, so it should be appended
        expect(result).toHaveLength(2);
        expect(result[1].name).toBe("No Key Action");
    });

    it("merges properties from both current and new action on key match", () => {
        const baseAction: EntityAction = {
            key: "export",
            name: "Export",
            icon: "download",
        } as unknown as EntityAction;

        const overrideAction: EntityAction = {
            key: "export",
            name: "Export CSV",
        } as unknown as EntityAction;

        const result = mergeEntityActions([baseAction], [overrideAction]);
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("Export CSV");
        // icon from base should still be preserved via spread
        expect((result[0] as any).icon).toBe("download");
    });

    it("handles both lists empty", () => {
        const result = mergeEntityActions([], []);
        expect(result).toEqual([]);
    });
});
