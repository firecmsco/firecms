/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FilterChip } from "../src";

describe("FilterChip", () => {
    it("renders its label", () => {
        render(<FilterChip>Published</FilterChip>);
        expect(screen.getByRole("button", { name: /Published/ })).toBeInTheDocument();
    });

    it("fires onClick when pressed", () => {
        const onClick = jest.fn();
        render(<FilterChip onClick={onClick}>Draft</FilterChip>);
        fireEvent.click(screen.getByRole("button", { name: /Draft/ }));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("does not fire onClick when disabled", () => {
        const onClick = jest.fn();
        render(<FilterChip disabled onClick={onClick}>Draft</FilterChip>);
        fireEvent.click(screen.getByRole("button", { name: /Draft/ }));
        expect(onClick).not.toHaveBeenCalled();
    });

    it("renders an icon before the label", () => {
        render(<FilterChip icon={<span data-testid="chip-icon" />}>Tag</FilterChip>);
        expect(screen.getByTestId("chip-icon")).toBeInTheDocument();
    });

    it("forwards refs and extra button props", () => {
        const ref = React.createRef<HTMLButtonElement>();
        render(<FilterChip ref={ref} aria-pressed>Active</FilterChip>);
        expect(ref.current).toBeInstanceOf(HTMLButtonElement);
        expect(ref.current).toHaveAttribute("aria-pressed", "true");
    });
});
