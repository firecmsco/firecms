/**
 * @jest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Card } from "../src";

describe("Card", () => {

    it("renders its children", () => {
        render(<Card>Products</Card>);
        expect(screen.getByText("Products")).toBeInTheDocument();
    });

    it("is not focusable and has no button role when not clickable", () => {
        render(<Card>Static</Card>);
        const card = screen.getByText("Static");
        expect(card).not.toHaveAttribute("role");
        expect(card).not.toHaveAttribute("tabindex");
    });

    it("exposes a button role and is focusable when clickable", () => {
        render(<Card onClick={() => undefined}>Products</Card>);
        expect(screen.getByRole("button", { name: "Products" })).toHaveAttribute("tabindex", "0");
    });

    it("fires onClick on mouse click", () => {
        const onClick = jest.fn();
        render(<Card onClick={onClick}>Products</Card>);
        fireEvent.click(screen.getByRole("button"));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    // Regression test for https://github.com/firecmsco/firecms/issues/726
    it("activates on Enter keydown", () => {
        const onClick = jest.fn();
        render(<Card onClick={onClick}>Products</Card>);
        fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    // Regression test for https://github.com/firecmsco/firecms/issues/726
    it("activates on Space keydown", () => {
        const onClick = jest.fn();
        render(<Card onClick={onClick}>Products</Card>);
        fireEvent.keyDown(screen.getByRole("button"), { key: " " });
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    // The reported "the collection just disappears": without preventDefault,
    // Space also scrolls the page away from the focused card.
    it("prevents the default browser action for Enter and Space", () => {
        render(<Card onClick={() => undefined}>Products</Card>);
        const card = screen.getByRole("button");
        // fireEvent returns false when the event was cancelled via preventDefault
        expect(fireEvent.keyDown(card, { key: " " })).toBe(false);
        expect(fireEvent.keyDown(card, { key: "Enter" })).toBe(false);
    });

    it("ignores other keys", () => {
        const onClick = jest.fn();
        render(<Card onClick={onClick}>Products</Card>);
        const card = screen.getByRole("button");
        fireEvent.keyDown(card, { key: "a" });
        fireEvent.keyDown(card, { key: "Tab" });
        fireEvent.keyDown(card, { key: "ArrowDown" });
        expect(onClick).not.toHaveBeenCalled();
    });

    it("does not activate or preventDefault when the card is not clickable", () => {
        render(<Card>Static</Card>);
        expect(fireEvent.keyDown(screen.getByText("Static"), { key: "Enter" })).toBe(true);
    });

    // NavigationCard renders action IconButtons *inside* the card. Their key
    // events bubble up to the card, which must not activate as well.
    it("does not activate when a key event bubbles from a focusable child", () => {
        const onClick = jest.fn();
        render(
            <Card onClick={onClick}>
                <button type="button" data-testid="card-action">Delete</button>
            </Card>
        );
        const action = screen.getByTestId("card-action");
        fireEvent.keyDown(action, { key: "Enter" });
        fireEvent.keyDown(action, { key: " " });
        expect(onClick).not.toHaveBeenCalled();
    });

    it("does not swallow the default action of a focusable child", () => {
        render(
            <Card onClick={() => undefined}>
                <button type="button" data-testid="card-action">Delete</button>
            </Card>
        );
        // the child button keeps its own native Enter/Space activation
        expect(fireEvent.keyDown(screen.getByTestId("card-action"), { key: " " })).toBe(true);
    });

    it("does not drop a caller supplied onKeyDown", () => {
        const onClick = jest.fn();
        const onKeyDown = jest.fn();
        render(<Card onClick={onClick} onKeyDown={onKeyDown}>Products</Card>);
        fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
        expect(onKeyDown).toHaveBeenCalledTimes(1);
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("lets a caller supplied onKeyDown opt out of activation", () => {
        const onClick = jest.fn();
        render(<Card onClick={onClick} onKeyDown={(e) => e.preventDefault()}>Products</Card>);
        fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
        expect(onClick).not.toHaveBeenCalled();
    });

    it("has a visible focus indicator for keyboard users when clickable", () => {
        render(<Card onClick={() => undefined}>Products</Card>);
        expect(screen.getByRole("button").className).toContain("focus-visible:ring-2");
    });

    it("forwards refs and extra div props", () => {
        const ref = React.createRef<HTMLDivElement>();
        render(<Card ref={ref} aria-label="Products card" onClick={() => undefined}>C</Card>);
        expect(ref.current).toBeInstanceOf(HTMLDivElement);
        expect(ref.current).toHaveAttribute("aria-label", "Products card");
    });
});
