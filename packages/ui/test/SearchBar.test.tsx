/**
 * @jest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SearchBar } from "../src";

describe("SearchBar", () => {

    it("reports what was typed", async () => {
        const onTextSearch = jest.fn();
        render(<SearchBar onTextSearch={onTextSearch} placeholder="Search projects"/>);
        fireEvent.change(screen.getByPlaceholderText("Search projects"), {
            target: { value: "alpha" }
        });
        // The input debounces before calling back; waitFor keeps the timer's
        // state update inside act().
        await waitFor(() => expect(onTextSearch).toHaveBeenCalledWith("alpha"));
    });

    /**
     * A width was only applied when `expandable` was set, so a non-expandable
     * bar left the input at the browser default (~180px) inside a full-width
     * shell: focus styling wrapped part of the bar rather than all of it.
     * Two call sites had already worked around it with `innerClassName`.
     */
    it("fills the bar when it is not expandable", () => {
        render(<SearchBar onTextSearch={jest.fn()} placeholder="Search"/>);
        expect(screen.getByPlaceholderText("Search").className).toContain("w-full");
    });

    it("keeps the fixed widths when it is expandable", () => {
        render(<SearchBar expandable onTextSearch={jest.fn()} placeholder="Search"/>);
        const className = screen.getByPlaceholderText("Search").className;
        expect(className).toContain("w-[180px]");
        expect(className).not.toContain("w-full");
    });

    it("grows while focused when it is expandable", () => {
        render(<SearchBar expandable onTextSearch={jest.fn()} placeholder="Search"/>);
        const input = screen.getByPlaceholderText("Search");
        fireEvent.focus(input);
        expect(input.className).toContain("w-[220px]");
    });

    it("reserves room for the clear button so text cannot run under it", () => {
        render(<SearchBar onTextSearch={jest.fn()} placeholder="Search"/>);
        expect(screen.getByPlaceholderText("Search").className).toContain("pr-10");
    });

    it("lets innerClassName win, which existing call sites depend on", () => {
        render(<SearchBar onTextSearch={jest.fn()}
                          placeholder="Search"
                          innerClassName="w-64"/>);
        const className = screen.getByPlaceholderText("Search").className;
        expect(className).toContain("w-64");
        expect(className).not.toContain("w-full");
    });

    it("clears the text when the clear button is pressed", async () => {
        const onTextSearch = jest.fn();
        render(<SearchBar onTextSearch={onTextSearch} placeholder="Search"/>);
        const input = screen.getByPlaceholderText("Search");
        fireEvent.change(input, { target: { value: "alpha" } });
        await screen.findByDisplayValue("alpha");

        fireEvent.click(screen.getByRole("button"));
        expect(input).toHaveValue("");
        expect(onTextSearch).toHaveBeenLastCalledWith(undefined);
    });

    it("is read-only when it has no search handler", () => {
        render(<SearchBar placeholder="Search"/>);
        expect(screen.getByPlaceholderText("Search")).toHaveAttribute("readonly");
    });
});
