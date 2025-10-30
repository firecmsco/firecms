import React, { useState, useEffect, lazy, Suspense } from 'react';

interface ClientOnlyDemoProps {
    path: string;
    className?: string;
}

const ClientOnlyDemo: React.FC<ClientOnlyDemoProps> = ({ path, className }) => {
    const [Component, setComponent] = useState<React.ComponentType | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const LazyComponent = lazy(() => import(path));
            setComponent(() => LazyComponent);
        } catch (e) {
            console.error(`Component not found at path: ${path}`, e);
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
