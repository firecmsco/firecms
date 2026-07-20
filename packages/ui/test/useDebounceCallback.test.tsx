/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, fireEvent, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useDebounceCallback } from "../src";

function Probe({ spy, delay }: { spy: (v: string) => void; delay?: number }) {
    const debounced = useDebounceCallback(spy, delay);
    return <button onClick={() => debounced("x")}>go</button>;
}

describe("useDebounceCallback", () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it("only invokes once after rapid calls", () => {
        const spy = jest.fn();
        render(<Probe spy={spy} delay={200} />);
        const btn = screen.getByText("go");
        fireEvent.click(btn);
        fireEvent.click(btn);
        fireEvent.click(btn);
        expect(spy).not.toHaveBeenCalled();
        act(() => {
            jest.advanceTimersByTime(200);
        });
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith("x");
    });

    it("defaults to a 200ms delay", () => {
        const spy = jest.fn();
        render(<Probe spy={spy} />);
        fireEvent.click(screen.getByText("go"));
        act(() => {
            jest.advanceTimersByTime(199);
        });
        expect(spy).not.toHaveBeenCalled();
        act(() => {
            jest.advanceTimersByTime(1);
        });
        expect(spy).toHaveBeenCalledTimes(1);
    });
});
