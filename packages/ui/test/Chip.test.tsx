/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Chip } from "../src";

describe("Chip", () => {
    it("renders children", () => {
        render(<Chip>Hello</Chip>);
        expect(screen.getByText("Hello")).toBeInTheDocument();
    });

    it("fires onClick and shows a pointer cursor when clickable", () => {
        const onClick = jest.fn();
        render(<Chip onClick={onClick}>Click</Chip>);
        const el = screen.getByText("Click");
        fireEvent.click(el);
        expect(onClick).toHaveBeenCalledTimes(1);
        expect(el.className).toContain("cursor-pointer");
    });

    it("forwards refs (regression: Chip must stay a forwardRef)", () => {
        const ref = React.createRef<HTMLDivElement>();
        render(<Chip ref={ref}>R</Chip>);
        expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    // Regression: existing size classes must not change (visual API stability).
    it.each([
        ["small", "text-sm"],
        ["medium", "text-sm"],
        ["large", "text-sm"]
    ] as const)("keeps the %s size class stable", (size, expected) => {
        render(<Chip size={size}>S</Chip>);
        expect(screen.getByText("S").className).toContain(expected);
    });

    it("defaults to the large size", () => {
        render(<Chip>Default</Chip>);
        expect(screen.getByText("Default").className).toContain("px-4 py-1.5");
    });

    // New additive size value.
    it("supports the additive smallest size", () => {
        render(<Chip size="smallest">Tiny</Chip>);
        expect(screen.getByText("Tiny").className).toContain("text-[10px]");
    });

    it("applies error styling", () => {
        render(<Chip error>Err</Chip>);
        expect(screen.getByText("Err").className).toContain("text-red-500");
    });
});
