import React, { useEffect, useRef, useState } from "react";
import { Panel } from "../general/Panel";
import clsx from "clsx";

import { useColorMode } from "@docusaurus/theme-common";
import { defaultBorderMixin } from "../styles";

export function FeaturesCarousel() {
    const [selectedItem, setSelectedItem] = useState(0);
    const intervalRef = useRef(null);
    const timeoutRef = useRef(null);

    const { colorMode } = useColorMode();
    const isDarkTheme = colorMode === "dark";
    const features = [
        {
            id: 0,
            number: "01",
            title: "Powerful Data Editing",
            description: "Edit your data with both spreadsheet views and detailed forms",
            content: (
                <div className="flex items-center justify-center">
                    <video
                        key={`demo_video_${isDarkTheme}`}
                        style={{
                            maxWidth: 540,
                            aspectRatio: 508 / 589
                        }}
                        className={clsx("aspect-video pointer-events-none rounded-2xl border", defaultBorderMixin)}
                        width="100%" loop autoPlay muted>
                        <source
                            src={isDarkTheme ? "/img/editing_demo_dark.mp4" : "/img/editing_demo.mp4"}
                            type="video/mp4"/>

                    </video>
                </div>
            )
        },
        {
            id: 1,
            number: "02",
            title: "Notion-style text editor",
            description: "Perfect for creating rich content like articles, blogs, documentation and more",
            content: (
                <div className="flex items-center justify-center">
                    <video
                        key={"notion_style_video"}
                        style={{
                            maxWidth: 540,
                            aspectRatio: 508 / 589
                        }}
                        className={clsx("aspect-video pointer-events-none rounded-2xl border", defaultBorderMixin)}
                        width="100%" loop autoPlay muted>
                        <source
                            src="/img/editor_rectangle.mp4"
                            type="video/mp4"/>
                    </video>
                </div>
            )
        },
        {
            id: 2,
            number: "03",
            title: "Custom Views",
            description: "Add dashboards, previews, and more with React components",
            content: (
                <div className="flex items-center justify-center">
                    <video
                        key={"custom_preview_video"}
                        style={{
                            maxWidth: 540,
                            aspectRatio: 508 / 589
                        }}
                        className={clsx("aspect-video pointer-events-none rounded-2xl border", defaultBorderMixin)}
                        width="100%" loop autoPlay muted>
                        <source
                            src="/img/custom_preview.mp4"
                            type="video/mp4"/>
                    </video>
                </div>
            )
        },
        {
            id: 3,
            number: "04",
            title: "Data Import/Export",
            description: "Export in multiple formats and import from CSV, XLSL, JSON, and more",
            content: (
                <div className="flex items-center justify-center">
                    <video
                        key={"import_export_video"}
                        style={{
                            maxWidth: 540,
                            aspectRatio: 508 / 589
                        }}
                        className={clsx("aspect-video pointer-events-none rounded-2xl border", defaultBorderMixin)}
                        width="100%" loop autoPlay muted>
                        <source
                            src="/img/export_data.mp4"
                            type="video/mp4"/>
                    </video>
                </div>
            )
        }
    ];

    // Setup autoplay
    useEffect(() => {
        // Start automatic rotation
        intervalRef.current = setInterval(() => {
            setSelectedItem(prevItem => (prevItem + 1) % features.length);
        }, 6000); // Change slide every 6 seconds

        // Cleanup on unmount
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [features.length]);

    // Handle manual selection
    const handleItemClick = (id: number) => {
        // Clear automatic rotation
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Update selected item
        setSelectedItem(id);

        // Resume automatic rotation after 10 seconds of inactivity
        timeoutRef.current = setTimeout(() => {
            intervalRef.current = setInterval(() => {
                setSelectedItem(prevItem => (prevItem + 1) % features.length);
            }, 6000);
        }, 10000);
    };

    return (
        <Panel color={"white"}>
            <div className="max-w-6xl mx-auto py-16">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <ul className="space-y-4">
                            {features.map(feature => (
                                <li
                                    key={feature.id}
                                    className={clsx(
                                        "flex items-start cursor-pointer transition-all duration-300 p-3 px-4 rounded-lg",
                                        selectedItem === feature.id ? "bg-gray-100" : "hover:bg-gray-50"
                                    )}
                                    onClick={() => handleItemClick(feature.id)}
                                >
                                                <span className={clsx(
                                                    "font-bold mr-2 transition-colors duration-300",
                                                    selectedItem === feature.id ? "text-primary" : "text-gray-400"
                                                )}>
                                                    {feature.number}
                                                </span>
                                    <div>
                                        <h3 className={clsx(
                                            "font-bold",
                                            selectedItem === feature.id ? "text-gray-900" : "text-gray-700"
                                        )}>
                                            {feature.title}
                                        </h3>
                                        <p>{feature.description}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Carousel content area */}
                    <div className="transition-opacity duration-300">
                        {features[selectedItem].content}
                    </div>
                </div>
            </div>
        </Panel>
    );
}
