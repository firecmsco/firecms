/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { InfoLabel } from "../src";

describe("InfoLabel", () => {

    it("renders its children", () => {
        render(<InfoLabel>Everything is fine</InfoLabel>);
        expect(screen.getByText("Everything is fine")).toBeInTheDocument();
    });

    /**
     * InfoLabel used to set only a background and inherit its text colour.
     * That works inside a Scaffold, which supplies `dark:text-white`, and fails
     * anywhere else: the backgrounds flip between themes, so a label rendered
     * outside one ended up dark text on a dark background, measured at 1.45:1.
     */
    it.each(["info", "warn"] as const)("sets its own text colour in %s mode", (mode) => {
        render(<InfoLabel mode={mode}>Label</InfoLabel>);
        const className = screen.getByText("Label").className;
        expect(className).toMatch(/(^|\s)text-/);
        expect(className).toMatch(/(^|\s)dark:text-/);
    });

    it.each(["info", "warn"] as const)("still sets a background in %s mode", (mode) => {
        render(<InfoLabel mode={mode}>Label</InfoLabel>);
        const className = screen.getByText("Label").className;
        expect(className).toMatch(/(^|\s)bg-/);
        expect(className).toMatch(/(^|\s)dark:bg-/);
    });

    it("distinguishes info from warn", () => {
        const { unmount } = render(<InfoLabel mode="info">A</InfoLabel>);
        const info = screen.getByText("A").className;
        unmount();
        render(<InfoLabel mode="warn">A</InfoLabel>);
        expect(screen.getByText("A").className).not.toBe(info);
    });

    it("defaults to info", () => {
        const { unmount } = render(<InfoLabel mode="info">A</InfoLabel>);
        const explicit = screen.getByText("A").className;
        unmount();
        render(<InfoLabel>A</InfoLabel>);
        expect(screen.getByText("A").className).toBe(explicit);
    });
});
