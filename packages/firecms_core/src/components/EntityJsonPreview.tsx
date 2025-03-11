import { Highlight, themes } from "prism-react-renderer"
import { useModeController } from "../hooks";

export function EntityJsonPreview({ values }: { values: object }) {
    const code = JSON.stringify(values, null, "\t");
    const { mode } = useModeController();

    return <Highlight
        theme={mode === "dark" ? themes.vsDark : themes.vsLight}
        code={code}
        language="json">
        {({
              className,
              style,
              tokens,
              getLineProps,
              getTokenProps
          }) => (
            <pre style={{
                ...style,
                background: "inherit"
            }} className={"container mx-auto p-8 rounded text-sm"}>
    {tokens.map((line, i) => (
        <div key={i} {...getLineProps({ line })} className={"text-wrap"}>
            {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} className={"word-break"}/>
            ))}
        </div>
    ))}
</pre>
        )}
    </Highlight>
}
