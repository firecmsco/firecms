import React from "react";
import { ErrorBoundary } from "../../components";

export function FormEntry({
                              propertyKey,
                              widthPercentage = 100,
                              children
                          }: {
    propertyKey: string;
    widthPercentage?: number;
    children: React.ReactNode;
}) {
    return (
        <div id={`form_field_${propertyKey}`}
             className={"relative"}
             style={{ width: widthPercentage === 100 ? "100%" : `calc(${widthPercentage}% - 8px)` }}>
            <ErrorBoundary>
                {children}
            </ErrorBoundary>
        </div>
    );
}
