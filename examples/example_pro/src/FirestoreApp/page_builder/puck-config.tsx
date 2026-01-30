import React from "react";
import type { Config } from "@measured/puck";
import { HeroBlock, heroBlockConfig } from "./blocks/HeroBlock";
import { TextBlock, textBlockConfig } from "./blocks/TextBlock";
import { ImageBlock, imageBlockConfig } from "./blocks/ImageBlock";
import { CTABlock, ctaBlockConfig } from "./blocks/CTABlock";
import { FeatureGridBlock, featureGridBlockConfig } from "./blocks/FeatureGridBlock";
import { SpacerBlock, spacerBlockConfig } from "./blocks/SpacerBlock";

// Category definitions for block organization
export const categories = {
    layout: {
        title: "Layout",
    },
    content: {
        title: "Content",
    },
    media: {
        title: "Media",
    },
    actions: {
        title: "Actions",
    }
};

// Root component that renders the page content
const RootComponent = ({ children, title }: { children: React.ReactNode; title: string }): JSX.Element => {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            {children}
        </div>
    );
};


// Root configuration for page-level settings
export const rootConfig = {
    fields: {
        title: {
            type: "text" as const,
            label: "Page Title"
        },
        description: {
            type: "textarea" as const,
            label: "Meta Description"
        }
    },
    defaultProps: {
        title: "New Page",
        description: ""
    },
    render: RootComponent
};

// Main Puck configuration
export const puckConfig: Config = {
    categories,
    root: rootConfig,
    components: {
        Hero: {
            ...heroBlockConfig,
            render: HeroBlock
        },
        Text: {
            ...textBlockConfig,
            render: TextBlock
        },
        Image: {
            ...imageBlockConfig,
            render: ImageBlock
        },
        CTA: {
            ...ctaBlockConfig,
            render: CTABlock
        },
        FeatureGrid: {
            ...featureGridBlockConfig,
            render: FeatureGridBlock
        },
        Spacer: {
            ...spacerBlockConfig,
            render: SpacerBlock
        }
    }
};

export default puckConfig;

