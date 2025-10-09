import React from "react";

export default function SimpleCodeBlock({ code, language }: { code: string, language: string }) {
    return <pre className={language}>{code}</pre>;
}
