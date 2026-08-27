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

    describe("disabled styling", () => {

        /**
         * Disabled used to stack three fades: a low-alpha text colour, a
         * low-alpha background and `opacity-40`/`opacity-50` over both. The
         * login CTAs, which are disabled until consent is given, measured
         * 3.6:1. A disabled control still has to be readable, because it is
         * usually disabled precisely because the user must do something first.
         */
        it("does not fade the label with opacity", () => {
            for (const variant of ["filled", "outlined", "text"] as const) {
                const { unmount } = render(<Button variant={variant} disabled>D</Button>);
                const className = screen.getByRole("button", { name: "D" }).className;
                expect(className).not.toContain("opacity-40");
                expect(className).not.toContain("opacity-50");
                unmount();
            }
        });

        it("marks every disabled variant with a not-allowed cursor", () => {
            for (const variant of ["filled", "outlined", "text"] as const) {
                const { unmount } = render(<Button variant={variant} disabled>D</Button>);
                expect(screen.getByRole("button", { name: "D" }).className)
                    .toContain("cursor-not-allowed");
                unmount();
            }
        });

        it("gives a disabled filled button a solid muted surface", () => {
            render(<Button disabled>D</Button>);
            const className = screen.getByRole("button", { name: "D" }).className;
            expect(className).toContain("bg-surface-accent-100");
            // The alpha background was half of the old contrast problem.
            expect(className).not.toContain("bg-surface-300/40");
        });

        it("keeps the enabled appearance untouched", () => {
            render(<Button variant="filled" color="primary">E</Button>);
            const className = screen.getByRole("button", { name: "E" }).className;
            expect(className).toContain("bg-primary");
            expect(className).not.toContain("cursor-not-allowed");
        });

        it("lets a caller override the disabled colours", () => {
            // `cls` is tailwind-merge, so a call site's className wins. The
            // login buttons relied on this and had to stop claiming colours
            // while disabled.
            render(<Button disabled className="text-red-500">D</Button>);
            const className = screen.getByRole("button", { name: "D" }).className;
            expect(className).toContain("text-red-500");
            expect(className).not.toContain("text-surface-600");
        });
    });
});
