/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Dialog, DialogProps } from "../src";

function paperClasses(props: Partial<DialogProps>): string[] {
    render(<Dialog open {...props}><span>Body</span></Dialog>);
    return screen.getByText("Body").parentElement!.className.split(" ");
}

describe("Dialog width", () => {
    it("keeps a full-width dialog at 11/12 of the screen, capped by maxWidth", () => {
        const classes = paperClasses({ maxWidth: "xl" });
        expect(classes).toContain("w-11/12");
        expect(classes).toContain("max-w-xl");
        // A container-size width next to w-11/12 wins and removes the side gutter on phones
        expect(classes).not.toContain("w-xl");
    });

    it("applies the default lg cap to a full-width dialog without a fixed width", () => {
        const classes = paperClasses({});
        expect(classes).toContain("w-11/12");
        expect(classes).toContain("max-w-lg");
        expect(classes).not.toContain("w-lg");
    });

    it("gives a dialog that is not full-width the fixed maxWidth width", () => {
        const classes = paperClasses({ maxWidth: "lg", fullWidth: false });
        expect(classes).not.toContain("w-11/12");
        expect(classes).toContain("max-w-lg");
        expect(classes).toContain("w-lg");
    });

    it("ignores the width classes when full screen", () => {
        const classes = paperClasses({ maxWidth: "7xl", fullScreen: true });
        expect(classes).toContain("w-screen");
        expect(classes).not.toContain("w-11/12");
        expect(classes).not.toContain("max-w-7xl");
        expect(classes).not.toContain("w-7xl");
    });
});
