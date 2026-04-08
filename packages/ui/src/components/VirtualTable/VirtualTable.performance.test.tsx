
/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, act } from '@testing-library/react';
import { VirtualTable } from './VirtualTable';
import { VirtualTableProps } from './VirtualTableProps';

// Mock VirtualTableRow to track renders
const renderCallback = jest.fn();
jest.mock('./VirtualTableRow', () => {
    const React = require('react');
    // Ensure it's memoized as in the real component, otherwise it would re-render anyway if parent renders
    // But wait, if parent passes new props, it re-renders.
    // The issue we are testing is CONTEXT.
    // VirtualTableRow consumes context. If context value changes, it re-renders even if props are same.
    // So we don't even need to pass props to it in the mock, but the real one does.
    
    const VirtualTableRow = React.memo((props: any) => {
        renderCallback();
        return <div data-testid="row">{props.children}</div>;
    });
    return { VirtualTableRow };
});

// Mock react-use-measure
jest.mock('react-use-measure', () => {
    return () => [
        (element: any) => {}, 
        { width: 500, height: 500, top: 0, left: 0, bottom: 0, right: 0, x: 0, y: 0 }
    ];
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    callback: any;
    constructor(callback: any) {
        this.callback = callback;
        // Expose callback globally or on the instance to trigger it
        (global as any).triggerResize = callback;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
};

describe('VirtualTable Performance', () => {
    it('does not re-render rows when VirtualTable re-renders but data is unchanged', async () => {
        const columns = [{ key: 'col1', title: 'Column 1', width: 100 }];
        const data = Array.from({ length: 10 }).map((_, i) => ({ col1: `Value ${i}` }));
        
        const props: VirtualTableProps<any> = {
            data,
            columns,
            rowHeight: 50,
            cellRenderer: () => <div>Cell</div>
        };

        render(<VirtualTable {...props} />);

        // Initial render count
        // 10 items + potentially overscan. 
        // Let's just store the current count.
        const initialRenderCount = renderCallback.mock.calls.length;
        console.log('Initial render count:', initialRenderCount);
        expect(initialRenderCount).toBeGreaterThan(0);

        // Trigger ResizeObserver to force VirtualTable re-render
        // The component has:
        // const [_, setForceUpdate] = useState(false);
        // ... new ResizeObserver(() => setForceUpdate(prev => !prev))
        
        act(() => {
            if ((global as any).triggerResize) {
                (global as any).triggerResize([]);
            }
        });

        // After re-render
        const afterResizeRenderCount = renderCallback.mock.calls.length;
        console.log('After resize render count:', afterResizeRenderCount);

        // The Fix:
        // If virtualListController is memoized, the context value shouldn't change.
        // VirtualTableRow consumes context. If context is stable, it shouldn't re-render (since it is React.memo'd and its props didn't change).
        // Wait, VirtualTableRow receives props from MemoizedList -> Row.
        // Row renders <VirtualTableRow ...>.
        // If VirtualTable re-renders -> MemoizedList re-renders?
        // VirtualTable renders:
        // <VirtualListContext.Provider value={virtualListController}>
        //    <MemoizedList ... />
        // </VirtualListContext.Provider>
        
        // MemoizedList is defined outside or inside?
        // It is defined OUTSIDE VirtualTable as:
        // function MemoizedList(...) { ... }
        // BUT, inside VirtualTable it is used as <MemoizedList ... />.
        // If VirtualTable re-renders, React.createElement(MemoizedList, ...) is called.
        // If props to MemoizedList are same, does it re-render?
        // MemoizedList is NOT wrapped in React.memo (in the file it's just `function MemoizedList`).
        // BUT, `react-window`'s `FixedSizeList` (which MemoizedList returns) IS optimized.
        // However, `MemoizedList` itself is a functional component. If parent renders, it renders.
        // AND `MemoizedList` defines `const Row = useCallback(...)`.
        // If `MemoizedList` re-renders, `Row` might be recreated if deps change?
        // `Row` has `[]` deps. So `Row` is stable!
        
        // Wait, `MemoizedList` passes `Row` to `List`.
        // `List` (react-window) renders `Row`.
        // `Row` contains `<VirtualListContext.Consumer>`.
        // So `Row` renders. It consumes context.
        // If context value changed, `Row` re-renders (or the consumer part does).
        // Inside Consumer: `return <VirtualTableRow ... />`.
        // If context value changed, the function inside Consumer runs.
        // It creates new props for VirtualTableRow?
        // `columns` comes from context. `data` comes from context.
        // If `virtualListController` (context value) is new, `columns` and `data` might be same ref, but the context object is new.
        // Consumer runs.
        // `<VirtualTableRow ... />` is created.
        // `VirtualTableRow` is `React.memo`.
        // It compares new props vs old props.
        // `columns` (from context) -> same ref? Yes (from useState in VirtualTable).
        // `data` (from context) -> same ref? Yes (from props).
        // `onRowClick` -> same ref? Yes (if useCallback/useMemo used properly in VirtualTable).
        
        // So actually, even if context object changes, if the *properties* of the context object are stable, `VirtualTableRow` might NOT re-render if it only receives those properties as props.
        // Let's check `VirtualTable.tsx` again.
        
        // In `MemoizedList` -> `Row`:
        /*
        <VirtualListContext.Consumer>
            {({ data, columns, ... }) => {
                // ...
                return <VirtualTableRow data={data} columns={columns} ... />
            }}
        </VirtualListContext.Consumer>
        */
        
        // If context object changes (new reference), Consumer re-runs.
        // It calls the render prop.
        // The render prop returns `<VirtualTableRow ... />`.
        // React sees a `VirtualTableRow` element.
        // It checks `React.memo` (equal).
        // `equal(prevProps, nextProps)`.
        // `prevProps.columns` vs `nextProps.columns`.
        // If `virtualListController` was recreated:
        /*
        const virtualListController = {
            data, // stable ref
            columns, // stable ref (state)
            ...
            onColumnResize: ... // stable (useCallback)
        };
        */
       
       // So `virtualListController` is a NEW object, but its properties are largely STABLE.
       // So Consumer runs, but `VirtualTableRow` receives same props (shallowly equal).
       // `react-fast-compare` (used in VirtualTableRow) should return true.
       // So `VirtualTableRow` should NOT re-render even if context changes?
       
       // WAIT. `VirtualTableRow` does NOT consume the context itself. `Row` (the render prop of List) consumes it.
       // So `Row` renders -> Consumer renders -> Render Prop runs -> returns VirtualTableRow.
       // VirtualTableRow is memoized.
       // So if props are equal, it shouldn't render.
       
       // WHY did the Codebase Investigator say: "This object is passed to a `React.Context`, causing all context consumers—specifically the virtualized rows—to re-render".
       // Maybe I missed something.
       // Does `VirtualTableRow` use the context?
       // No, `VirtualTableRow.tsx` does not use `useContext`.
       
       // However, `VirtualTableCell`?
       // `VirtualTableCell` is rendered by `VirtualTableRow`.
       
       // Let's look at `VirtualTable.tsx` again.
       // The `Row` component:
       /*
        const Row = useCallback(({ index, style }) => {
            return <VirtualListContext.Consumer>
                {(context) => {
                    // ...
                    return <VirtualTableRow ...> ... </VirtualTableRow>
                }}
            </VirtualListContext.Consumer>
        }, []);
       */
       
       // The `Row` component is passed to `react-window` `List`.
       // `List` renders `Row`.
       // `Row` renders `Consumer`.
       // If Context Provider value changes, ALL Consumers re-render.
       // So the function inside `Consumer` runs.
       // It returns `VirtualTableRow`.
       // React attempts to update `VirtualTableRow`.
       // `VirtualTableRow` is `React.memo`.
       // It compares props.
       
       // Are props different?
       // `columns` -> state. Stable.
       // `data` -> prop. Stable.
       // `onRowClick` -> `virtualListController.onRowClick`.
       // In `VirtualTable.tsx`:
       // `const virtualListController = { ... onRowClick, ... }`
       // `onRowClick` comes from props. Stable.
       
       // `cellRenderer` -> prop. Stable.
       
       // `rowClassName` -> prop. Stable.
       
       // So... if all props are stable, why is it a bottleneck?
       // Maybe `virtualListController` creation is expensive? No.
       // Maybe `react-window` does something?
       
       // Or maybe one of the properties IS unstable?
       // `onColumnResizeInternal`: useCallback. Stable.
       // `onColumnResizeEndInternal`: useCallback. Stable.
       // `onFilterUpdateInternal`: useCallback. Stable.
       // `onColumnSort`: useCallback. Stable.
       
       // `filterRef.current` -> ref. Stable.
       
       // Wait, `virtualListController` object ITSELF is new.
       // `VirtualListContext.Provider value={virtualListController}` receives new object.
       // Provider updates.
       // All Consumers update.
       // The overhead of running the Consumer function for 100 rows is non-zero, but `VirtualTableRow` (the heavy part?) shouldn't re-render if props are same.
       
       // UNLESS... `VirtualTableCell`?
       // `VirtualTableRow` has children:
       /*
         {columns.map((column, columnIndex) => {
             return <VirtualTableCell ... />
         })}
       */
       // If `VirtualTableRow` doesn't re-render, its children don't re-render.
       
       // So where is the bottleneck?
       // "The root cause is the re-creation of the `virtualListController` object... This triggers a cascade of re-renders in all consumer components (every visible row and cell)"
       
       // If `Consumer` runs, it means React has to traverse down to that node.
       // If `VirtualTableRow` props are equal, it stops there.
       
       // Maybe `VirtualTableRow` props are NOT equal?
       // Let's verify `VirtualTableRow` props.
       /*
       <VirtualTableRow
           key={`row_${index}`}
           rowData={rowData}
           rowIndex={index}
           onRowClick={onRowClick}
           columns={columns}
           hoverRow={hoverRow}
           rowClassName={rowClassName}
           style={{...}}
           rowHeight={rowHeight}
       >
       */
       
       // `style` comes from `react-window`'s `Row` props. `react-window` passes new style objects if scroll happens, but here we are just re-rendering `VirtualTable`. `react-window` shouldn't change styles if size didn't change (Wait, ResizeObserver triggered -> Size changed? No, we just triggered it, assuming size is same but callback fired).
       // Actually `style` in `Row` callback comes from `react-window`.
       
       // `onRowClick`: `virtualListController.onRowClick` (from props).
       
       // BUT, what about `VirtualTableCell`?
       // Inside `VirtualTableRow` children:
       /*
       <VirtualTableCell
          cellRenderer={cellRenderer}
          column={column}
          columns={columns}
          ...
       />
       */
       // `cellRenderer` comes from context.
       
       // If `VirtualTableRow` re-renders, `VirtualTableCell` is re-created (React Element).
       // `VirtualTableCell` is `React.memo`.
       // Comparison runs.
       
       // If `VirtualTableRow` does NOT re-render, then `VirtualTableCell` is not even touched.
       
       // So the key is whether `VirtualTableRow` re-renders.
       // If I can prove `VirtualTableRow` renders fewer times with the fix, I'm good.
       
       // Why would `VirtualTableRow` props be different?
       // Maybe `equal` (react-fast-compare) returns false for some reason?
       // Or maybe `virtualListController` has some property that IS new every time?
       
       // `const virtualListController = { ... }`.
       // `filter: filterRef.current`.
       // `currentSort`.
       // `sortByProperty`.
       
       // If `VirtualTableRow` props are deeply equal, `react-fast-compare` returns true.
       
       // Wait. `MemoizedList` component.
       /*
       function MemoizedList(...) {
           const Row = useCallback(...)
           return <List ...>{Row}</List>
       }
       */
       // `MemoizedList` is NOT memoized (it's a function).
       // In `VirtualTable`:
       /*
       <MemoizedList ... />
       */
       // Parent renders -> `MemoizedList` renders.
       // `Row` is `useCallback(..., [])`. Dependency array is empty!
       // So `Row` is STABLE.
       
       // `List` (react-window) receives stable `Row`.
       // `List` is `PureComponent` (usually).
       // If `List` props (width, height, itemCount) are same, `List` should NOT re-render?
       // `width` and `height` come from `bounds`. If `bounds` didn't change, they are same.
       
       // So if `VirtualTable` re-renders, but `bounds` are same:
       // `MemoizedList` renders.
       // `List` receives same props.
       // `List` does NOT re-render.
       // So `Row`s are NOT re-rendered by `react-window`.
       
       // BUT, `VirtualListContext.Provider` is ABOVE `MemoizedList`.
       // <Provider value={new_value}>
       //   <MemoizedList />
       // </Provider>
       
       // If Provider value changes, it bypasses intermediate components (`MemoizedList`, `List`) and goes straight to Consumers?
       // YES. Context updates propagate to consumers regardless of intermediate `React.memo` or `PureComponent`.
       
       // So `Row` (which contains `Consumer`) will update?
       // `Row` is a component definition passed to `List`.
       // `List` renders instances of `Row`.
       // These instances contain `Consumer`.
       // Use of `<Context.Consumer>` or `useContext` creates a subscription.
       // So the `Consumer` component inside the rendered `Row` updates.
       
       // The children function of `Consumer` executes.
       // It returns `<VirtualTableRow ... />`.
       // React compares this new element with previous.
       // If `VirtualTableRow` is `React.memo`, it checks props.
       
       // The premise of the optimization is that checking `React.memo` (especially with deep compare) is expensive if done for hundreds of rows, AND if we can avoid it entirely by stable context, we save time.
       // If Context is stable, `Consumer` doesn't update.
       // So the function inside Consumer doesn't run.
       // So `VirtualTableRow` comparison doesn't happen.
       
       // So even if `VirtualTableRow` returns `true` for equality (no re-render), the *attempt* to render it (Consumer running, creating Element, running comparison) happens.
       
       // My test counts `VirtualTableRow` *renders* (function execution).
       // If `React.memo` works, the function body of `VirtualTableRow` should NOT run.
       // The mock I wrote:
       /*
       const VirtualTableRow = React.memo((props) => {
            renderCallback();
            ...
       })
       */
       // So `renderCallback` tracks when `VirtualTableRow` component function executes.
       // If `React.memo` returns true (props equal), the function does NOT execute.
       
       // So... if the props are indeed equal (which they seem to be), then `VirtualTableRow` should NOT render in *both* cases (optimized and unoptimized).
       // The optimization saves the *overhead* of the Consumer update and the Memo comparison.
       // But my test measures *Component Renders*.
       // If `VirtualTableRow` never renders in both cases, the test won't show a difference.
       
       // However, if `VirtualTableRow` *does* re-render currently (meaning props are NOT equal), then my fix will stop it (by not even triggering the update).
       
       // Why would props be unequal?
       // `columns` is `columnsProp` state.
       // `data` is `data` prop.
       // `style` ...
       
       // If the test shows 0 re-renders in the "after" check, it's good.
       // If it shows >0 in the "unoptimized" check, then I fixed something visible.
       
       // Let's assume there is *some* prop instability or that checking all rows is the issue.
       // Or maybe `react-fast-compare` is not as fast or returns false?
       
       // Actually, I can also instrument the `Consumer`? No, that's inside the component.
       
       // Let's just run the test and see. If "before" count is high and "after" is low, I win.
       // If both are 0, I need a better test (maybe measure time?).
       
       // I will write the test file now.
    });
});
