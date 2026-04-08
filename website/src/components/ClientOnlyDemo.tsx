import React, { useState, useEffect, lazy, Suspense } from 'react';

interface ClientOnlyDemoProps {
    path: string;
    className?: string;
}

// Use import.meta.glob to pre-load all sample components at build time
const modules = import.meta.glob('/src/content/docs/samples/**/*.tsx');

const ClientOnlyDemo: React.FC<ClientOnlyDemoProps> = ({ path, className }) => {
    const [Component, setComponent] = useState<React.ComponentType | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadComponent = async () => {
            try {
                const moduleLoader = modules[path];
                if (!moduleLoader) {
                    console.error(`Component not found at path: ${path}`);
                    console.error('Available paths:', Object.keys(modules));
                    setError(`Component ${path} not found`);
                    return;
                }
                const module = await moduleLoader() as { default: React.ComponentType };
                const LazyComponent = lazy(() => Promise.resolve(module));
                setComponent(() => LazyComponent);
            } catch (e) {
                console.error(`Failed to load component at path: ${path}`, e);
                setError(`Component ${path} failed to load`);
            }
        };

        loadComponent();
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
