import React from "react";
import CodeBlock from "@theme/CodeBlock";

export function SimpleCodeBlock({ code, language }: { code: string, language: string }) {
    return <CodeBlock language={language}>{code}</CodeBlock>;
}