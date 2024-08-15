import { createContext, useContext, useState, useEffect, useRef, ReactNode, type ComponentPropsWithoutRef, forwardRef } from "react";
import tunnel from "tunnel-rat";
import { Command } from "cmdk";
import type { Range } from "@tiptap/core";

const t = tunnel();

// Types for Query and Range contexts
type QueryContextType = [string, (query: string) => void];
type RangeContextType = [Range | null, (range: Range | null) => void];

// Create Contexts for Query and Range (with getter and setter)
const QueryContext = createContext<QueryContextType>(["", () => {}]);
export const RangeContext = createContext<RangeContextType>([null, () => {}]);

// Custom Hooks for accessing the contexts
const useQuery = (): QueryContextType => useContext(QueryContext);
const useRange = (): RangeContextType => useContext(RangeContext);

// Props for EditorCommandProvider component
interface EditorCommandProviderProps {
    children: ReactNode;
}

export const EditorCommandProvider = ({ children }: EditorCommandProviderProps) => {
    const [query, setQuery] = useState<string>("");
    const [range, setRange] = useState<Range | null>(null);

    return (
        <QueryContext.Provider value={[query, setQuery]}>
            <RangeContext.Provider value={[range, setRange]}>
                {children}
            </RangeContext.Provider>
        </QueryContext.Provider>
    );
};

interface EditorCommandOutProps {
    query: string;
    range: Range;
}

export const EditorCommandOut = ({ query, range }: EditorCommandOutProps): JSX.Element => {
    const [, setQuery] = useQuery();
    const [, setRange] = useRange();

    useEffect(() => {
        setQuery(query);
    }, [query, setQuery]);

    useEffect(() => {
        setRange(range);
    }, [range, setRange]);

    useEffect(() => {
        const navigationKeys = ["ArrowUp", "ArrowDown", "Enter"];
        const onKeyDown = (e: KeyboardEvent) => {
            if (navigationKeys.includes(e.key)) {
                e.preventDefault();
                const commandRef = document.querySelector("#slash-command");
                if (commandRef) {
                    commandRef.dispatchEvent(
                        new KeyboardEvent("keydown", { key: e.key, cancelable: true, bubbles: true })
                    );
                }
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
        };
    }, []);

    return <t.Out />;
};

export const EditorCommand = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof Command>>((
    { children, className, ...rest }, ref) => {
    const commandListRef = useRef<HTMLDivElement>(null);
    const [query, setQuery] = useQuery();

    return (
        <t.In>
            <Command ref={ref} onKeyDown={(e) => { e.stopPropagation(); }} id='slash-command' className={className} {...rest}>
                <Command.Input value={query} onValueChange={setQuery} style={{ display: "none" }} />
                <Command.List ref={commandListRef}>{children}</Command.List>
            </Command>
        </t.In>
    );
});
