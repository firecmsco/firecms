import React, { useState, useEffect, lazy, Suspense } from 'react';

const modules = import.meta.glob('/src/**/*.tsx');

interface ClientOnlyDemoProps {
    path: string;
    className?: string;
}

const ClientOnlyDemo: React.FC<ClientOnlyDemoProps> = ({ path, className }) => {
    const [Component, setComponent] = useState<React.ComponentType | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const componentImporter = modules[path];

        if (componentImporter) {
            const LazyComponent = lazy(componentImporter as any);
            setComponent(() => LazyComponent);
        } else {
            console.error(`Component not found at path: ${path}`);
            setError(`Component ${path} not found`);
        }
    }, [path]);

    return (
        <div className={className}>
            {error && <div>{error}</div>}
            {Component ? (
                <Suspense fallback={<div>Loading component...</div>}>
                    <Component />
                </Suspense>
            ) : (
                // Render a fallback if the component is not yet set, to avoid Suspense issues
                <div>Loading component...</div>
            )}
        </div>
    );
};

export default ClientOnlyDemo;
