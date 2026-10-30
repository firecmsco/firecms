/** @jest-environment jsdom */
import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import React from "react";
import { render } from "@testing-library/react";
import { BlockFieldBinding } from "../src/form/field_bindings/BlockFieldBinding";

// Test the field-to-container contract without loading the whole CMS or drag-and-drop UI.
jest.mock("../src/components", () => ({
    ArrayContainer: jest.fn(() => null)
}));
jest.mock("../src/form/components", () => ({
    FieldHelperText: () => null,
    LabelWithIconAndTooltip: () => null
}));
jest.mock("../src/form/PropertyFieldBinding", () => ({ PropertyFieldBinding: () => null }));
jest.mock("../src/preview", () => ({ EnumValuesChip: () => null }));
jest.mock("../src/util", () => ({
    getDefaultValueFor: () => "",
    getIconForProperty: () => null
}));
jest.mock("../src/form/useClearRestoreValue", () => ({ useClearRestoreValue: () => undefined }));
jest.mock("../src/hooks/useTranslation", () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));
jest.mock("@firecms/formex", () => ({ Field: () => null, useFormex: () => ({}) }));
jest.mock("@firecms/ui", () => ({
    ExpandablePanel: () => null,
    IconButton: () => null,
    CloseIcon: () => null
}));

import { ArrayContainer } from "../src/components";

const container = jest.mocked(ArrayContainer);
type BlockProps = Parameters<typeof BlockFieldBinding>[0];

function buildProps(canAddElements?: boolean): BlockProps {
    return {
        propertyKey: "content",
        value: [{ type: "text", value: "Existing block" }],
        property: {
            dataType: "array",
            canAddElements,
            oneOf: { properties: { text: { dataType: "string" } } }
        },
        minimalistView: true,
        disabled: false,
        isSubmitting: false,
        setValue: jest.fn(),
        setFieldValue: jest.fn()
    } as BlockProps;
}

function latestContainerProps() {
    const calls = container.mock.calls;
    return calls[calls.length - 1][0];
}

describe("BlockFieldBinding canAddElements", () => {
    beforeEach(() => container.mockClear());

    it.each([false, true, undefined])("respects canAddElements=%s", (setting) => {
        render(<BlockFieldBinding {...buildProps(setting)}/>);
        expect(latestContainerProps().canAddElements).toBe(setting ?? true);
    });

    it("updates when adding is dynamically disabled and enabled again", () => {
        const props = buildProps(true);
        const { rerender } = render(<BlockFieldBinding {...props}/>);
        expect(latestContainerProps().canAddElements).toBe(true);

        rerender(<BlockFieldBinding {...props} property={{ ...props.property, canAddElements: false }}/>);
        expect(latestContainerProps().canAddElements).toBe(false);

        rerender(<BlockFieldBinding {...props}/>);
        expect(latestContainerProps().canAddElements).toBe(true);
    });

    it.each(["property", "field", "submitting"] as const)("prevents adding when %s is disabled", (source) => {
        const props = buildProps(true);
        if (source === "property") props.property.disabled = true;
        if (source === "field") props.disabled = true;
        if (source === "submitting") props.isSubmitting = true;

        render(<BlockFieldBinding {...props}/>);
        expect(latestContainerProps().canAddElements).toBe(false);
    });

    it("preserves existing entries and their renderer when adding is disallowed", () => {
        const props = buildProps(false);
        render(<BlockFieldBinding {...props}/>);
        expect(latestContainerProps().value).toBe(props.value);
        expect(latestContainerProps().buildEntry).toEqual(expect.any(Function));
        expect(latestContainerProps().disabled).toBe(false);
    });
});
