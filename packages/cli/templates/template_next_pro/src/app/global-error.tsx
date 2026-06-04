"use client";

import React, { useEffect } from "react";

export default function GlobalError({
                                        error,
                                        reset,
                                    }: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html lang="en">
        <body>
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "2rem",
            fontFamily: "system-ui, -apple-system, sans-serif",
            backgroundColor: "#fafafa",
        }}>
            <div style={{
                maxWidth: "480px",
                width: "100%",
                textAlign: "center",
                padding: "2rem",
                borderRadius: "0.75rem",
                backgroundColor: "#fff",
                border: "1px solid #e5e5e5",
            }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
                    Something went wrong
                </h2>
                {error?.message && (
                    <pre style={{
                        fontSize: "0.75rem",
                        color: "#6b7280",
                        backgroundColor: "#f9fafb",
                        padding: "0.75rem",
                        borderRadius: "0.5rem",
                        overflow: "auto",
                        maxHeight: "160px",
                        textAlign: "left",
                        border: "1px solid #f3f4f6",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        marginBottom: "1rem",
                    }}>
                        {error.message}
                    </pre>
                )}
                <button
                    onClick={reset}
                    style={{
                        backgroundColor: "#0070F4",
                        color: "#fff",
                        border: "none",
                        padding: "0.5rem 1.25rem",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        cursor: "pointer",
                    }}
                >
                    Try again
                </button>
            </div>
        </div>
        </body>
        </html>
    );
}
