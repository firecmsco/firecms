/**
 * @jest-environment jsdom
*/
/* eslint-disable i18next/no-literal-string */
import React, { Profiler } from "react";
import { act, fireEvent, render } from "@testing-library/react";
import { VirtualTable } from "./VirtualTable.js";
import { CellRendererParams, VirtualTableColumn } from "./VirtualTableProps.js";

// Every `useSortable` call in the table: one per header column and, while body
// cells took part in the drag, one per cell on screen besides.
const sortableCalls = jest.fn();
jest.mock("@dnd-kit/sortable", () => {
    const actual = jest.requireActual("@dnd-kit/sortable");
    return {
        ...actual,
        useSortable: (args: unknown) => {
            sortableCalls(args);
            return actual.useSortable(args);
        }
    };
});

// jsdom lays nothing out. The table is 1000 × 500 wherever it is, and its top
// is whatever the test says the page has scrolled it to.
let pageTop = 0;
beforeAll(() => {
    jest.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(() => ({
        x: 10, y: pageTop, left: 10, top: pageTop, right: 1010, bottom: pageTop + 500,
        width: 1000, height: 500, toJSON: () => ({})
    }));
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", { configurable: true, get: () => 1000 });
    Object.defineProperty(HTMLElement.prototype, "offsetHeight", { configurable: true, get: () => 500 });
    // react-window clamps a scroll to `scrollHeight - clientHeight`, which
    // jsdom reports as 0 − 0.
    Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, get: () => 500 });
    Object.defineProperty(HTMLElement.prototype, "scrollHeight", { configurable: true, get: () => 200_000 });
});

global.ResizeObserver = class ResizeObserver {
    observe() { /* noop */ }
    unobserve() { /* noop */ }
    disconnect() { /* noop */ }
};

type Row = Record<string, string>;

const ROW_HEIGHT = 50;
const COLUMN_COUNT = 10;

const columns: VirtualTableColumn[] = Array.from({ length: COLUMN_COUNT }, (_, c) => ({
    key: `c${c}`,
    title: `Column ${c}`,
    width: 150,
    resizable: true
}));

const rows: Row[] = Array.from({ length: 2000 }, (_, r) => {
    const row: Row = {};
    columns.forEach((column) => { row[column.key] = `${r}:${column.key}`; });
    return row;
});

function setup() {
    const cellRenderer = jest.fn(({ rowData, column }: CellRendererParams<Row>) => <span>{rowData?.[column.key]}</span>);
    let commits = 0;
    const onColumnsOrderChange = () => undefined;
    const utils = render(
        <div style={{ overflow: "auto", height: 500 }} data-testid="page">
            <Profiler id="table" onRender={() => { commits++; }}>
                <VirtualTable data={rows}
                    columns={columns}
                    rowHeight={ROW_HEIGHT}
                    cellRenderer={cellRenderer}
                    onColumnsOrderChange={onColumnsOrderChange}/>
            </Profiler>
        </div>
    );
    const scroller = utils.container.querySelector("#virtual-table")!.parentElement as HTMLElement;
    const reset = () => {
        sortableCalls.mockClear();
        cellRenderer.mockClear();
        commits = 0;
    };
    const counts = () => ({ sortable: sortableCalls.mock.calls.length, cells: cellRenderer.mock.calls.length, commits });
    return { ...utils, scroller, reset, counts };
}

describe("VirtualTable render counts", () => {

    it("scrolling the table re-renders only the rows it brings in", async () => {
        const { scroller, reset, counts } = setup();
        reset();
        // 20 rows down, a row at a time.
        for (let step = 1; step <= 20; step++) {
            await act(async () => {
                scroller.scrollTop = step * ROW_HEIGHT;
                fireEvent.scroll(scroller);
            });
        }
        const result = counts();
        console.log("scroll 20 rows:", result);
        // 20 rows brought in × 10 columns is the floor for cells.
        expect(result.cells).toBeLessThanOrEqual(20 * COLUMN_COUNT + 2 * COLUMN_COUNT);
        // Neither the header nor the body cells join the drag on a scroll.
        expect(result.sortable).toBe(0);
    });

    it("the page scrolling around the table does not re-render it", async () => {
        const { getByTestId, reset, counts } = setup();
        reset();
        const page = getByTestId("page");
        for (let step = 1; step <= 20; step++) {
            await act(async () => {
                pageTop = -step * 10;
                fireEvent.scroll(page);
                fireEvent.scroll(window);
            });
        }
        pageTop = 0;
        const result = counts();
        console.log("page scroll 20 frames:", result);
        expect(result.commits).toBe(0);
    });

    it("dragging a column's edge does not re-render the cells until it is let go", async () => {
        const { container, reset, counts } = setup();
        const handle = container.querySelector(".cursor-col-resize") as HTMLElement;
        await act(async () => {
            fireEvent.pointerDown(handle);
        });
        reset();
        for (let step = 1; step <= 20; step++) {
            await act(async () => {
                fireEvent.mouseMove(document, { clientX: 10 + 150 + step * 5 });
            });
        }
        const during = counts();
        console.log("resize 20 moves:", during);
        reset();
        await act(async () => {
            fireEvent.mouseUp(document, { clientX: 10 + 150 + 100 });
        });
        const after = counts();
        console.log("resize release:", after);
        expect(during.cells).toBe(0);
        // Let go, the column is 250 wide: its cells (and those after it, which
        // moved) are drawn at the new width once.
        expect(container.querySelector<HTMLElement>("[data-vt-col='c0']")?.getAttribute("style")).toContain("250px");
    });
});
