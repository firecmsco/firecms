import React, { lazy, Suspense } from 'react';

const modules = import.meta.glob('/src/content/docs/samples/components/**/*.tsx');

const DynamicComponentLoader = ({ componentName }: { componentName: string }) => {
    const componentPath = `/src/content/docs/samples/components/${componentName}.tsx`;

    const componentImporter = modules[componentPath];

    if (!componentImporter) {
        console.error(`Component not found at path: ${componentPath}`);
        return <div>Component {componentName} not found</div>;
    }

    const Component = lazy(componentImporter as any);

    return (
        <Suspense fallback={null}>
            <Component />
        </Suspense>
    );
};

export default DynamicComponentLoader;

