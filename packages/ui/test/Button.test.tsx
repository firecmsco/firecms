/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Button } from "../src";

describe("Button", () => {
    it("renders children and fires onClick", () => {
        const onClick = jest.fn();
        render(<Button onClick={onClick}>Save</Button>);
        const btn = screen.getByRole("button", { name: "Save" });
        fireEvent.click(btn);
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("does not fire onClick when disabled", () => {
        const onClick = jest.fn();
        render(<Button disabled onClick={onClick}>Save</Button>);
        fireEvent.click(screen.getByRole("button", { name: "Save" }));
        expect(onClick).not.toHaveBeenCalled();
    });

    it("exposes data-variant and data-size (API regression)", () => {
        render(<Button variant="outlined" size="large">X</Button>);
        const btn = screen.getByRole("button", { name: "X" });
        expect(btn).toHaveAttribute("data-variant", "outlined");
        expect(btn).toHaveAttribute("data-size", "large");
    });

    it("uses rounded-lg after restyle", () => {
        render(<Button>R</Button>);
        expect(screen.getByRole("button", { name: "R" }).className).toContain("rounded-lg");
    });

    it("renders as a custom component via the `component` prop", () => {
        render(<Button component="a" href="#x">Link</Button>);
        const el = screen.getByText("Link");
        expect(el.tagName).toBe("A");
        expect(el).toHaveAttribute("href", "#x");
    });

    it("forwards a ref", () => {
        const ref = React.createRef<HTMLButtonElement>();
        render(<Button ref={ref}>Ref</Button>);
        expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
});
