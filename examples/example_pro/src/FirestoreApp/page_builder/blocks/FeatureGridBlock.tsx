import React from "react";
import { cls, Card } from "@firecms/ui";

export interface FeatureItem {
    icon: string;
    title: string;
    description: string;
}

export interface FeatureGridBlockProps {
    title: string;
    subtitle: string;
    columns: 2 | 3 | 4;
    features: FeatureItem[];
}

const columnClasses = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
};

export const FeatureGridBlock = ({
    title,
    subtitle,
    columns,
    features
}: FeatureGridBlockProps): JSX.Element => {
    return (
        <div className="w-full py-16 px-8 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-6xl mx-auto">
                {(title || subtitle) && (
                    <div className="text-center mb-12">
                        {title && (
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                                {subtitle}
                            </p>
                        )}
                    </div>
                )}
                <div className={cls(
                    "grid gap-8",
                    columnClasses[columns]
                )}>
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            className="p-6 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow"
                        >
                            {feature.icon && (
                                <div className="text-4xl mb-4">
                                    {feature.icon}
                                </div>
                            )}
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                {feature.description}
                            </p>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const featureGridBlockConfig = {
    label: "Feature Grid",
    category: "content",
    defaultProps: {
        title: "Our Features",
        subtitle: "Everything you need to succeed",
        columns: 3 as const,
        features: [
            {
                icon: "🚀",
                title: "Fast Performance",
                description: "Lightning-fast performance that keeps your users engaged."
            },
            {
                icon: "🔒",
                title: "Secure by Default",
                description: "Enterprise-grade security to protect your data."
            },
            {
                icon: "⚡",
                title: "Easy Integration",
                description: "Seamless integration with your existing tools."
            }
        ]
    },
    fields: {
        title: {
            type: "text" as const,
            label: "Section Title"
        },
        subtitle: {
            type: "textarea" as const,
            label: "Section Subtitle"
        },
        columns: {
            type: "select" as const,
            label: "Columns",
            options: [
                { label: "2 Columns", value: 2 },
                { label: "3 Columns", value: 3 },
                { label: "4 Columns", value: 4 }
            ]
        },
        features: {
            type: "array" as const,
            label: "Features",
            arrayFields: {
                icon: {
                    type: "text" as const,
                    label: "Icon (emoji)"
                },
                title: {
                    type: "text" as const,
                    label: "Title"
                },
                description: {
                    type: "textarea" as const,
                    label: "Description"
                }
            }
        }
    }
};
