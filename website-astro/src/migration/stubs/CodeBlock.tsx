import React from "react";

export default function CodeBlock({ children, language }: { children: React.ReactNode, language: string }) {
    return (
        <pre className={`language-${language} bg-gray-900 p-4 rounded-md overflow-auto`}>
            <code className={`language-${language}`}>
                {children}
            </code>
        </pre>
    );
}