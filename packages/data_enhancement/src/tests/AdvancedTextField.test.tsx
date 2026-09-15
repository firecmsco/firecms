/**
 * @jest-environment jsdom
 */
import React, { useCallback } from "react";
import { createRoot, Root } from "react-dom/client";
import { useCreateFormex } from "@firecms/formex";
import { AdvancedTextField } from "../components/fields/AdvancedTextField";

// Real scheduling, as in the browser: the loop only shows up when updates are
// left to React's scheduler between input events rather than flushed by act().
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = false;

const setTextareaValue = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!;

const tick = () => new Promise((resolve) => setTimeout(resolve, 20));

/**
 * Types `count` characters as back-to-back input events in one task, the way
 * key repeat, dictation or a slow form delivers them, and reports the first
 * error React throws (it surfaces as a window error event).
 */
function typeBurst(textarea: HTMLTextAreaElement, count: number) {
    let thrown: Error | null = null;
    const onError = (event: ErrorEvent) => {
        thrown = thrown ?? event.error;
        event.preventDefault();
    };
    window.addEventListener("error", onError);
    try {
        for (let i = 0; i < count && !thrown; i++) {
            setTextareaValue.call(textarea, textarea.value + "a");
            textarea.dispatchEvent(new Event("input", { bubbles: true }));
        }
    } finally {
        window.removeEventListener("error", onError);
    }
    return thrown as Error | null;
}

let latestFormValue: string | undefined;

/** Bound like FireCMS binds a field: setValue touches the field, then sets it. */
function FormWithField() {
    const formex = useCreateFormex<{ name: string }>({ initialValues: { name: "" } });
    const setValue = useCallback((value: string | null) => {
        formex.setFieldTouched("name", true, false);
        formex.setFieldValue("name", value, false);
    }, []);
    latestFormValue = formex.values.name;
    return <AdvancedTextField inputType={"text"} value={formex.values.name} setValue={setValue} label={"Name"}/>;
}

describe("AdvancedTextField", () => {

    let container: HTMLDivElement;
    let root: Root;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(() => {
        root.unmount();
        container.remove();
    });

    it("takes a fast burst of input without exceeding React's update depth", async () => {
        // FIRECMS-SASS-12M: an effect re-set the same string after every
        // keystroke, and around the 53rd back-to-back input event React threw
        // "Maximum update depth exceeded".
        root.render(<FormWithField/>);
        await tick();
        const textarea = container.querySelector("textarea")!;

        const thrown = typeBurst(textarea, 80);
        await tick();

        expect(thrown).toBeNull();
        expect(textarea.value).toBe("a".repeat(80));
        expect(latestFormValue).toBe("a".repeat(80));
    });

    it("still follows a value changed from outside, as autofill does", async () => {
        const setValue = jest.fn();
        root.render(<AdvancedTextField inputType={"text"} value={"draft"} setValue={setValue} label={"Name"}/>);
        await tick();
        expect(container.querySelector("textarea")!.value).toBe("draft");

        root.render(<AdvancedTextField inputType={"text"} value={"filled in by autofill"} setValue={setValue} label={"Name"}/>);
        await tick();

        expect(container.querySelector("textarea")!.value).toBe("filled in by autofill");
        expect(setValue).not.toHaveBeenCalled();
    });
});
