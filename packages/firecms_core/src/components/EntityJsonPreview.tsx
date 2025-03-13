import React, { useRef, useEffect, useCallback } from "react";
import { Highlight, themes } from "prism-react-renderer";
import { useModeController } from "../hooks";

export function EntityJsonPreview({ values }: { values: object }) {
    const code = JSON.stringify(values, null, "\t");
    const { mode } = useModeController();
    const preRef = useRef<HTMLPreElement>(null);

    // Global keydown handler
    const handleGlobalKeyDown = useCallback((e: KeyboardEvent) => {
        // Check for Control (Windows/Linux) or Command (macOS) + "a":
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
            // If our code view is mounted, perform selection
            if (preRef.current) {
                e.preventDefault();
                e.stopPropagation();

                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(preRef.current);
                if (selection) {
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }
        }
    }, []);

    // Attach the global keydown listener when component mounts,
    // and remove it when it unmounts.
    useEffect(() => {
        document.addEventListener("keydown", handleGlobalKeyDown);
        return () => {
            document.removeEventListener("keydown", handleGlobalKeyDown);
        };
    }, [handleGlobalKeyDown]);

    return (
        <Highlight
            theme={mode === "dark" ? themes.vsDark : themes.vsLight}
            code={code}
            language="json"
        >
            {({ style, tokens, getLineProps, getTokenProps }) => (
                <pre
                    // Bind the ref to our pre element so we can select its contents.
                    ref={preRef}
                    style={{
                        ...style,
                        background: "inherit"
                    }}
                    className="container mx-auto p-8 rounded text-sm"
                >
          {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })} className="text-wrap">
                  {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} className="word-break" />
                  ))}
              </div>
          ))}
        </pre>
            )}
        </Highlight>
    );
}
