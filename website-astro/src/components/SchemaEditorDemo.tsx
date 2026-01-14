import React, { useEffect, useState } from "react";

interface PropertyFieldProps {
    name: string;
    type: string;
    dataType: string;
    icon: string;
    iconColor: string;
    isSelected?: boolean;
    hasChildren?: boolean;
    isDisabled?: boolean;
    disabledText?: string;
    indent?: number;
}

function PropertyField({
                           name,
                           type,
                           dataType,
                           icon,
                           iconColor,
                           isSelected = false,
                           hasChildren = false,
                           isDisabled = false,
                           disabledText,
                           indent = 0
                       }: PropertyFieldProps) {
    return (
        <div className="relative -ml-8" style={{ position: "relative" }}>
            {hasChildren && (
                <div
                    className="absolute border-l border-surface-200 border-opacity-40 dark:border-surface-700 dark:border-opacity-40"
                    style={{
                        left: "32px",
                        top: "64px",
                        bottom: "16px"
                    }}
                />
            )}
            <div className="relative">
                <div>
                    <div className="flex flex-row w-full cursor-pointer">
                        <div className={`${indent > 0 ? "ml-16" : "m-4"} ${indent === 0 ? "" : "m-4"} relative`}>
                            <div
                                className="h-8 w-8 flex items-center justify-center rounded-full shadow text-white"
                                style={{ background: isDisabled ? "rgb(107, 114, 128)" : iconColor }}
                            >
                                <span className="material-icons select-none" style={{ fontSize: "20px" }}>
                                    {icon}
                                </span>
                            </div>
                            {isDisabled && (
                                <span
                                    className="material-icons text-text-disabled dark:text-text-disabled-dark select-none absolute -right-2 -top-2"
                                    style={{ fontSize: "20px" }}
                                >
                                    do_not_disturb_on
                                </span>
                            )}
                        </div>
                        <div
                            className={`w-full flex flex-row gap-4 items-center border-opacity-40 rounded-md dark:border-opacity-40 dark:border-surface-700/40 m-1 hover:ring-2 hover:ring-primary cursor-pointer hover:bg-primary/20 dark:hover:bg-primary/10 ${
                                isSelected
                                    ? "bg-opacity-30 dark:bg-opacity-10 ring-opacity-75 bg-primary/10 dark:bg-primary/10 ring-1 ring-primary/75 border-primary"
                                    : "bg-white dark:bg-surface-950 border-transparent"
                            } flex-grow p-4 border transition-colors duration-200`}>
                            <div className="w-full flex flex-col">
                                <span
                                    className={`${isDisabled ? "typography-body1" : "typography-label"} text-text-primary dark:text-text-primary-dark flex-grow pr-2`}>
                                    {name}
                                </span>
                                <div className="flex flex-row items-center">
                                    <span
                                        className={`typography-body2 ${isDisabled ? "text-text-disabled dark:text-text-disabled-dark" : "text-text-secondary dark:text-text-secondary-dark"} flex-grow pr-2`}>
                                        {isDisabled ? disabledText : type}
                                    </span>
                                    {!isDisabled && (
                                        <span
                                            className="typography-body2 text-text-disabled dark:text-text-disabled-dark">
                                            {dataType}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="absolute top-2 right-2 flex flex-row">
                    <span
                        className="cursor-pointer text-surface-accent-600 dark:text-surface-accent-300 bg-transparent inline-flex items-center justify-center p-2 text-sm font-medium rounded-full w-8 h-8 min-w-8 min-h-8 hover:bg-surface-accent-200 hover:bg-opacity-75 dark:hover:bg-surface-accent-800">
                        <span className="material-icons select-none" style={{ fontSize: "20px" }}>
                            drag_handle
                        </span>
                    </span>
                </div>
            </div>
        </div>
    );
}

function PropertyTypeOption({
                                icon,
                                iconColor,
                                title,
                                description
                            }: { icon: string; iconColor: string; title: string; description: string }) {
    return (
        <div
            className="bg-white border border-opacity-40 rounded-md dark:bg-surface-950 dark:border-opacity-40 border-surface-200/40 dark:border-surface-700/40 hover:bg-surface-accent-100 dark:hover:bg-surface-accent-800 hover:ring-2 hover:ring-primary cursor-pointer flex flex-row items-center px-4 py-2 m-1">
            <div className="flex flex-row items-center text-base min-h-[48px]">
                <div className="mr-8">
                    <div className="h-8 w-8 flex items-center justify-center rounded-full shadow text-white"
                         style={{ background: iconColor }}>
                        <span className="material-icons select-none" style={{ fontSize: "20px" }}>
                            {icon}
                        </span>
                    </div>
                </div>
                <div>
                    <div className="flex flex-row gap-2 items-center">
                        <label
                            className="typography-label text-text-primary dark:text-text-primary-dark">{title}</label>
                    </div>
                    <p className="typography-caption text-text-secondary dark:text-text-secondary-dark max-w-sm">{description}</p>
                </div>
            </div>
        </div>
    );
}

export function SchemaEditorDemo() {
    const [showDialog, setShowDialog] = useState(true);
    const [scrollPosition, setScrollPosition] = useState(0);

    useEffect(() => {
        // Initial delay before first showing dialog
        const initialTimer = setTimeout(() => setShowDialog(true), 600);
        return () => clearTimeout(initialTimer);
    }, []);

    useEffect(() => {
        if (!showDialog) return;

        let animationFrameId: number;
        let startTime: number;
        const duration = 3000; // Animation duration in ms
        const scrollDistance = 1200;

        // Easing function for a slow start and fast end
        const easeInQuart = (t: number) => t * t * t * t;

        const animateScroll = (timestamp: number) => {
            if (!startTime) {
                startTime = timestamp;
            }
            const elapsedTime = timestamp - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const easedProgress = easeInQuart(progress);

            setScrollPosition(easedProgress * scrollDistance);

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animateScroll);
            } else {
                // End of scroll, restart loop
                setTimeout(() => {
                    setShowDialog(false);
                    // Pause before restarting
                    setTimeout(() => setShowDialog(true), 1500);
                }, 500);
            }
        };

        // Pause for 2 seconds before starting scroll
        const pauseBeforeScroll = setTimeout(() => {
            animationFrameId = requestAnimationFrame(animateScroll);
        }, 1500);

        return () => {
            clearTimeout(pauseBeforeScroll);
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            setScrollPosition(0);
        };
    }, [showDialog]);

    const properties = [
        {
            name: "Name",
            type: "Text field",
            dataType: "string",
            icon: "short_text",
            iconColor: "rgb(45, 127, 249)",
            isSelected: true
        },
        {
            name: "Image",
            type: "File upload",
            dataType: "string",
            icon: "upload_file",
            iconColor: "rgb(249, 45, 154)"
        },
        {
            name: "Category",
            type: "Select/enum",
            dataType: "string",
            icon: "list",
            iconColor: "rgb(66, 35, 201)"
        },
        {
            name: "Available",
            type: "Switch",
            dataType: "boolean",
            icon: "flag",
            iconColor: "rgb(32, 217, 210)"
        },
        {
            name: "price",
            type: "This property is defined as a property builder in code",
            dataType: "",
            icon: "functions",
            iconColor: "",
            isDisabled: true,
            disabledText: "This property is defined as a property builder in code"
        },
        {
            name: "Currency",
            type: "Select/enum",
            dataType: "string",
            icon: "list",
            iconColor: "rgb(66, 35, 201)"
        },
        {
            name: "Public",
            type: "Switch",
            dataType: "boolean",
            icon: "flag",
            iconColor: "rgb(32, 217, 210)"
        },
        {
            name: "Brand",
            type: "Text field",
            dataType: "string",
            icon: "short_text",
            iconColor: "rgb(45, 127, 249)"
        },
        {
            name: "Description",
            type: "Markdown",
            dataType: "string",
            icon: "format_quote",
            iconColor: "rgb(45, 127, 249)"
        },
        {
            name: "Amazon link",
            type: "Url",
            dataType: "string",
            icon: "http",
            iconColor: "rgb(21, 79, 179)"
        },
    ];

    const publisherSubfields = [
        {
            name: "Name",
            type: "Text field",
            dataType: "string",
            icon: "short_text",
            iconColor: "rgb(45, 127, 249)",
            indent: 1
        },
        {
            name: "External id",
            type: "Text field",
            dataType: "string",
            icon: "short_text",
            iconColor: "rgb(45, 127, 249)",
            indent: 1
        },
    ];

    const moreProperties = [
        {
            name: "Images",
            type: "Multiple file upload",
            dataType: "array",
            icon: "drive_folder_upload",
            iconColor: "rgb(249, 45, 154)"
        },
        {
            name: "Related products",
            type: "Multiple references",
            dataType: "array",
            icon: "add_link",
            iconColor: "rgb(255, 0, 66)"
        },
        {
            name: "Available locales",
            type: "Multi select (enum)",
            dataType: "array",
            icon: "list_alt",
            iconColor: "rgb(66, 35, 201)"
        },
        {
            name: "Uppercase Name",
            type: "Text field",
            dataType: "string",
            icon: "short_text",
            iconColor: "rgb(45, 127, 249)"
        },
        {
            name: "Tags",
            type: "Repeat/list",
            dataType: "array",
            icon: "repeat",
            iconColor: "rgb(255, 148, 8)"
        },
        {
            name: "Added on",
            type: "Date/time",
            dataType: "date",
            icon: "schedule",
            iconColor: "rgb(139, 70, 255)"
        },
        {
            name: "spanish_title",
            type: "This field is defined as an additional field in code",
            dataType: "",
            icon: "functions",
            iconColor: "",
            isDisabled: true,
            disabledText: "This field is defined as an additional field in code"
        },
        {
            name: "Metadata",
            type: "Key-value",
            dataType: "map",
            icon: "ballot",
            iconColor: "rgb(255, 148, 8)"
        },
    ];

    return (
        <div className="grid grid-cols-12 gap-2 h-full bg-surface dark:bg-surface-dark relative">
            {/* Left Panel - Properties List */}
            <div
                className="bg-surface-50 dark:bg-surface-900 p-4 md:p-8 pb-20 col-span-12 lg:col-span-5 h-full overflow-hidden border-r border-opacity-40 dark:border-opacity-40 border-surface-200/40 dark:border-surface-700/40">
                {/* Collection Name Header */}
                <div className="flex my-2">
                    <div className="flex-grow mb-4">
                        <div
                            className="rounded-md relative max-w-full bg-opacity-0 dark:bg-opacity-0 hover:bg-opacity-70 dark:hover:bg-opacity-40 hover:bg-surface-accent-200/70 hover:dark:bg-surface-700/40 min-h-[32px] -ml-1">
                            <input
                                name="name"
                                className="w-full outline-none bg-transparent px-3 rounded-md min-h-[32px] py-2 pr-3 text-2xl font-headers text-text-primary dark:text-text-primary-dark"
                                placeholder="Collection name"
                                type="text"
                                value="Products"
                                readOnly
                            />
                        </div>
                    </div>
                    <div className="ml-1 mt-2 flex flex-row gap-2">
                        <button
                            type="button"
                            className="cursor-pointer text-surface-accent-600 dark:text-surface-accent-300 bg-surface-accent-200 bg-opacity-50 dark:bg-surface-950 dark:bg-opacity-50 inline-flex items-center justify-center p-2 text-sm font-medium rounded-full w-10 h-10 min-w-10 min-h-10 hover:bg-opacity-75 dark:hover:bg-surface-accent-800 hover:scale-105 transition-transform"
                        >
                            <span className="material-icons select-none" style={{ fontSize: "24px" }}>code</span>
                        </button>
                        <button
                            type="button"
                            className="cursor-pointer text-surface-accent-600 dark:text-surface-accent-300 bg-surface-accent-200 bg-opacity-50 dark:bg-surface-950 dark:bg-opacity-50 inline-flex items-center justify-center p-2 text-sm font-medium rounded-full w-10 h-10 min-w-10 min-h-10 hover:bg-opacity-75 dark:hover:bg-surface-accent-800 hover:scale-105 transition-transform"
                        >
                            <span className="material-icons select-none" style={{ fontSize: "24px" }}>autorenew</span>
                        </button>
                        <button
                            type="button"
                            className="h-fit rounded-md inline-flex items-center justify-center p-2 gap-2 w-fit border border-primary text-primary hover:text-primary hover:bg-primary/10 py-2 px-4"
                        >
                            <span className="material-icons select-none" style={{ fontSize: "24px" }}>add</span>
                        </button>
                    </div>
                </div>

                {/* Properties List */}
                <div className="pl-8">
                    {properties.map((prop, index) => (
                        <PropertyField key={index} {...prop} />
                    ))}

                    {/* Publisher Group with Children */}
                    <div className="relative -ml-8">
                        <div
                            className="absolute border-l border-surface-200 border-opacity-40 dark:border-surface-700 dark:border-opacity-40"
                            style={{
                                left: "32px",
                                top: "64px",
                                bottom: "16px"
                            }}/>
                        <div className="relative">
                            <div>
                                <div className="flex flex-row w-full cursor-pointer">
                                    <div className="m-4">
                                        <div
                                            className="h-8 w-8 flex items-center justify-center rounded-full shadow text-white"
                                            style={{ background: "rgb(255, 148, 8)" }}>
                                            <span className="material-icons select-none"
                                                  style={{ fontSize: "20px" }}>ballot</span>
                                        </div>
                                    </div>
                                    <div
                                        className="w-full flex flex-row gap-4 items-center bg-white dark:bg-surface-950 border-opacity-40 rounded-md dark:border-opacity-40 dark:border-surface-700/40 m-1 hover:ring-2 hover:ring-primary cursor-pointer hover:bg-primary/20 dark:hover:bg-primary/10 flex-grow p-4 border transition-colors duration-200 border-transparent">
                                        <div className="w-full flex flex-col">
                                            <span
                                                className="typography-label text-text-primary dark:text-text-primary-dark flex-grow pr-2">Publisher</span>
                                            <div className="flex flex-row items-center">
                                                <span
                                                    className="typography-body2 text-text-secondary dark:text-text-secondary-dark flex-grow pr-2">Group</span>
                                                <span
                                                    className="typography-body2 text-text-disabled dark:text-text-disabled-dark">map</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-2 right-2 flex flex-row">
                                <span
                                    className="cursor-pointer text-surface-accent-600 dark:text-surface-accent-300 bg-transparent inline-flex items-center justify-center p-2 text-sm font-medium rounded-full w-8 h-8 min-w-8 min-h-8">
                                    <span className="material-icons select-none"
                                          style={{ fontSize: "20px" }}>drag_handle</span>
                                </span>
                            </div>
                            <div className="ml-16">
                                {publisherSubfields.map((prop, index) => (
                                    <PropertyField key={`sub-${index}`} {...prop} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {moreProperties.map((prop, index) => (
                        <PropertyField key={`more-${index}`} {...prop} />
                    ))}
                </div>

                {/* Add New Property Button */}
                <button
                    type="button"
                    className="h-fit rounded-md inline-flex items-center justify-center p-2 gap-2 border border-primary text-primary hover:text-primary hover:bg-primary/10 py-2.5 px-5 mt-8 w-full"
                >
                    <span className="material-icons select-none" style={{ fontSize: "24px" }}>add</span>
                    Add new property
                </button>
            </div>

            {/* Right Panel - Property Editor */}
            <div className="col-span-12 lg:col-span-7 p-4 md:py-8 md:px-4 h-full overflow-hidden pb-20 relative">
                <div className="sticky top-8 min-h-full w-full flex flex-col justify-center">
                    {/* Field Type Display */}
                    <div className="flex mt-2 justify-between">
                        <div className="w-full flex flex-col gap-2">
                            <div
                                className="select-none rounded-md text-sm p-4 bg-opacity-50 bg-surface-accent-200 dark:bg-surface-800 dark:bg-opacity-60 hover:bg-opacity-70 dark:hover:bg-opacity-40 relative flex items-center">
                                <div className="flex items-center">
                                    <div className="mr-8">
                                        <div
                                            className="h-8 w-8 flex items-center justify-center rounded-full shadow text-white"
                                            style={{ background: "rgb(45, 127, 249)" }}>
                                            <span className="material-icons select-none"
                                                  style={{ fontSize: "20px" }}>short_text</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-start text-base text-left">
                                        <div className="text-text-primary dark:text-text-primary-dark">Text field</div>
                                        <p className="typography-caption text-text-secondary dark:text-text-secondary-dark">Simple
                                            short text</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="cursor-pointer text-surface-accent-600 dark:text-surface-accent-300 bg-transparent inline-flex items-center justify-center p-2 text-sm font-medium rounded-full w-10 h-10 min-w-10 min-h-10 m-4 hover:bg-surface-accent-200 hover:bg-opacity-75 dark:hover:bg-surface-accent-800 hover:scale-105 transition-transform"
                        >
                            <span className="material-icons select-none" style={{ fontSize: "24px" }}>delete</span>
                        </button>
                    </div>

                    {/* Property Configuration */}
                    <div className="grid grid-cols-12 gap-y-12 mt-8 mb-8">
                        {/* Field Name */}
                        <div className="flex flex-col gap-2 col-span-12">
                            <div
                                className="rounded-md relative max-w-full bg-opacity-50 bg-surface-accent-200 dark:bg-surface-800 dark:bg-opacity-60 hover:bg-opacity-70 dark:hover:bg-opacity-40 min-h-[64px]"
                                style={{ fontSize: "20px" }}>
                                <input
                                    name="name"
                                    className="w-full outline-none bg-transparent leading-normal px-3 rounded-md min-h-[64px] py-2 pr-3 text-text-primary dark:text-text-primary-dark"
                                    placeholder="Field name"
                                    type="text"
                                    value="Name"
                                    readOnly
                                />
                            </div>

                            {/* ID Field */}
                            <div
                                className="rounded-md relative max-w-full bg-opacity-50 dark:bg-opacity-90 bg-surface-accent-200/50 dark:bg-surface-800/90 min-h-[32px]">
                                <label
                                    className="text-sm font-medium block whitespace-nowrap overflow-hidden max-w-full transform translate-y-[2px] scale-75 translate-x-[12px] pointer-events-none absolute top-[-1px] text-text-secondary dark:text-text-secondary-dark opacity-50">
                                    ID
                                </label>
                                <input
                                    name="id"
                                    disabled
                                    className="w-full leading-normal px-3 rounded-md bg-opacity-50 dark:bg-opacity-90 bg-surface-accent-200/50 dark:bg-surface-800/90 min-h-[32px] pt-4 pb-2 pr-3 outline-none opacity-50 dark:opacity-50 text-surface-accent-800 dark:text-white"
                                    type="text"
                                    value="name"
                                    readOnly
                                />
                            </div>

                            {/* Description */}
                            <div
                                className="rounded-md relative max-w-full bg-opacity-50 bg-surface-accent-200 dark:bg-surface-800 dark:bg-opacity-60 hover:bg-opacity-70 dark:hover:bg-opacity-40 min-h-[64px]">
                                <label
                                    className="text-sm font-medium block whitespace-nowrap overflow-hidden max-w-full transform translate-y-[2px] scale-75 translate-x-[12px] pointer-events-none absolute top-1 text-text-secondary dark:text-text-secondary-dark">
                                    Description
                                </label>
                                <input
                                    name="description"
                                    className="w-full outline-none bg-transparent leading-normal px-3 rounded-md min-h-[64px] pt-8 pb-2 pr-3 text-text-primary dark:text-text-primary-dark"
                                    type="text"
                                    value="Name of this product"
                                    readOnly
                                />
                            </div>
                        </div>

                        {/* Validation Collapsible */}
                        <div className="col-span-12">
                            <div
                                className="border-opacity-40 dark:border-opacity-40 border-surface-200/40 dark:border-surface-700/40 border rounded-md w-full">
                                <button
                                    type="button"
                                    className="rounded-t flex items-center justify-between w-full min-h-[52px] hover:bg-surface-accent-200 hover:bg-opacity-40 dark:hover:bg-surface-800 dark:hover:bg-opacity-40 p-4 py-4 transition-all duration-200 bg-opacity-50 bg-surface-accent-200 dark:bg-surface-800 dark:bg-opacity-60"
                                >
                                    <div className="flex flex-row text-text-secondary dark:text-text-secondary-dark">
                                        <span className="material-icons select-none"
                                              style={{ fontSize: "24px" }}>rule</span>
                                        <h6 className="typography-subtitle2 text-text-primary dark:text-text-primary-dark ml-2">Validation</h6>
                                    </div>
                                    <span className="material-icons select-none transition"
                                          style={{ fontSize: "24px" }}>keyboard_arrow_down</span>
                                </button>
                            </div>
                        </div>

                        {/* Default Value */}
                        <div className="col-span-12">
                            <div
                                className="rounded-md relative max-w-full bg-opacity-50 bg-surface-accent-200 dark:bg-surface-800 dark:bg-opacity-60 hover:bg-opacity-70 dark:hover:bg-opacity-40 min-h-[64px]">
                                <label
                                    className="text-sm font-medium block whitespace-nowrap overflow-hidden max-w-full translate-x-[16px] transform translate-y-[16px] scale-100 pointer-events-none absolute top-1 text-text-secondary dark:text-text-secondary-dark">
                                    Default value
                                </label>
                                <input
                                    name="defaultValue"
                                    className="w-full outline-none bg-transparent leading-normal px-3 rounded-md min-h-[64px] pt-8 pb-2 pr-3 text-text-primary dark:text-text-primary-dark"
                                    type="text"
                                    value=""
                                    readOnly
                                />
                            </div>
                        </div>

                        {/* Toggle Switches */}
                        <div className="col-span-12">
                            <div className="grid grid-cols-12 gap-2">
                                <div className="col-span-12">
                                    <div
                                        className="bg-opacity-50 bg-surface-accent-200 dark:bg-surface-800 dark:bg-opacity-60 hover:bg-opacity-70 dark:hover:bg-opacity-40 cursor-pointer rounded-md max-w-full justify-between box-border relative inline-flex items-center text-text-primary dark:text-text-primary-dark min-h-[42px] pl-4 pr-6 flex-row w-full">
                                        <button
                                            type="button"
                                            className="w-[42px] h-[26px] min-w-[42px] min-h-[26px] outline-none rounded-full relative shadow-sm bg-opacity-54 bg-white/60 dark:bg-surface-accent-900 ring-1 ring-surface-accent-200 dark:ring-surface-accent-700"
                                        >
                                            <div
                                                className="block rounded-full transition-transform duration-100 transform bg-surface-accent-600 dark:bg-surface-accent-400 w-[21px] h-[21px] translate-x-[3px]"/>
                                        </button>
                                        <div className="flex-grow ml-4 text-base">Hide from collection</div>
                                    </div>
                                </div>
                                <div className="col-span-12">
                                    <div
                                        className="bg-opacity-50 bg-surface-accent-200 dark:bg-surface-800 dark:bg-opacity-60 hover:bg-opacity-70 dark:hover:bg-opacity-40 cursor-pointer rounded-md max-w-full justify-between box-border relative inline-flex items-center text-text-primary dark:text-text-primary-dark min-h-[42px] pl-4 pr-6 flex-row w-full">
                                        <button
                                            type="button"
                                            className="w-[42px] h-[26px] min-w-[42px] min-h-[26px] outline-none rounded-full relative shadow-sm bg-opacity-54 bg-white/60 dark:bg-surface-accent-900 ring-1 ring-surface-accent-200 dark:ring-surface-accent-700"
                                        >
                                            <div
                                                className="block rounded-full transition-transform duration-100 transform bg-surface-accent-600 dark:bg-surface-accent-400 w-[21px] h-[21px] translate-x-[3px]"/>
                                        </button>
                                        <div className="flex-grow ml-4 text-base">Read only</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Full-Width Animated Property Selector - Covers entire demo */}
            {showDialog && (
                <div className="absolute inset-0 z-20 bg-black/50 dark:bg-black/70 flex justify-center items-center"
                     style={{
                         opacity: showDialog ? 1 : 0,
                         transition: "opacity 400ms ease-in-out"
                     }}>
                    <div
                        className="h-[540px] overflow-hidden bg-white dark:bg-surface-950 border border-opacity-40 dark:border-opacity-40 border-surface-200/40 dark:border-surface-700/40 rounded-md shadow-xl w-11/12 max-w-4xl max-h-[90vh] flex flex-col">


                        <div className="flex-grow my-6 mx-6">
                            <div style={{
                                transform: `translateY(-${scrollPosition}px)`,
                                transition: "none"
                            }}>
                                <h6 className="typography-subtitle2 text-text-primary dark:text-text-primary-dark mb-4 mt-6 flex-shrink-0">
                                    Select a property widget
                                </h6>

                                <div>
                                    {/* Text */}
                                    <div className="mt-4">
                                        <label
                                            className="typography-label text-text-primary dark:text-text-primary-dark">Text</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mt-4">
                                            <PropertyTypeOption icon="short_text" iconColor="rgb(45, 127, 249)"
                                                                title="Text field" description="Simple short text"/>
                                            <PropertyTypeOption icon="subject" iconColor="rgb(45, 127, 249)"
                                                                title="Multiline"
                                                                description="Text with multiple lines"/>
                                            <PropertyTypeOption icon="format_quote" iconColor="rgb(45, 127, 249)"
                                                                title="Markdown"
                                                                description="Text with advanced markdown syntax"/>
                                            <PropertyTypeOption icon="http" iconColor="rgb(21, 79, 179)" title="Url"
                                                                description="Text with URL validation"/>
                                            <PropertyTypeOption icon="mail" iconColor="rgb(21, 79, 179)" title="Email"
                                                                description="Text with email validation"/>
                                            <PropertyTypeOption icon="link" iconColor="rgb(21, 79, 179)"
                                                                title="Reference (as string)"
                                                                description="The value refers to a different collection (it is saved as a string)"/>
                                        </div>
                                    </div>

                                    {/* Boolean */}
                                    <div className="mt-4">
                                        <label
                                            className="typography-label text-text-primary dark:text-text-primary-dark">Boolean</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mt-4">
                                            <PropertyTypeOption icon="flag" iconColor="rgb(32, 217, 210)" title="Switch"
                                                                description="Boolean true or false field (or yes or no, 0 or 1...)"/>
                                        </div>
                                    </div>

                                    {/* Select */}
                                    <div className="mt-4">
                                        <label
                                            className="typography-label text-text-primary dark:text-text-primary-dark">Select</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mt-4">
                                            <PropertyTypeOption icon="list" iconColor="rgb(66, 35, 201)"
                                                                title="Select/enum"
                                                                description="Select one text value from within an enumeration"/>
                                            <PropertyTypeOption icon="list_alt" iconColor="rgb(66, 35, 201)"
                                                                title="Multi select (enum)"
                                                                description="Select multiple text values from within an enumeration"/>
                                            <PropertyTypeOption icon="format_list_numbered"
                                                                iconColor="rgb(190, 201, 32)"
                                                                title="Number select"
                                                                description="Select a number value from within an enumeration"/>
                                            <PropertyTypeOption icon="format_list_numbered"
                                                                iconColor="rgb(190, 201, 32)"
                                                                title="Multiple number select"
                                                                description="Select multiple number values from within an enumeration"/>
                                        </div>
                                    </div>

                                    {/* Users */}
                                    <div className="mt-4">
                                        <label
                                            className="typography-label text-text-primary dark:text-text-primary-dark">Users</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mt-4">
                                            <PropertyTypeOption icon="person" iconColor="rgb(45, 127, 249)"
                                                                title="User select"
                                                                description="Select a user from the user management system. Store the user ID."/>
                                        </div>
                                    </div>

                                    {/* Number */}
                                    <div className="mt-4">
                                        <label
                                            className="typography-label text-text-primary dark:text-text-primary-dark">Number</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mt-4">
                                            <PropertyTypeOption icon="numbers" iconColor="rgb(190, 201, 32)"
                                                                title="Number input"
                                                                description="Simple number field with validation"/>
                                        </div>
                                    </div>

                                    {/* File */}
                                    <div className="mt-4">
                                        <label
                                            className="typography-label text-text-primary dark:text-text-primary-dark">File</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mt-4">
                                            <PropertyTypeOption icon="upload_file" iconColor="rgb(249, 45, 154)"
                                                                title="File upload"
                                                                description="Input for uploading single files"/>
                                            <PropertyTypeOption icon="drive_folder_upload" iconColor="rgb(249, 45, 154)"
                                                                title="Multiple file upload"
                                                                description="Input for uploading multiple files"/>
                                        </div>
                                    </div>

                                    {/* Reference */}
                                    <div className="mt-4">
                                        <label
                                            className="typography-label text-text-primary dark:text-text-primary-dark">Reference</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mt-4">
                                            <PropertyTypeOption icon="link" iconColor="rgb(255, 0, 66)"
                                                                title="Reference"
                                                                description="The value refers to a different collection (it is saved as a reference)"/>
                                            <PropertyTypeOption icon="add_link" iconColor="rgb(255, 0, 66)"
                                                                title="Multiple references"
                                                                description="Multiple values that refer to a different collection"/>
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div className="mt-4">
                                        <label
                                            className="typography-label text-text-primary dark:text-text-primary-dark">Date</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mt-4">
                                            <PropertyTypeOption icon="schedule" iconColor="rgb(139, 70, 255)"
                                                                title="Date/time"
                                                                description="A date time select field"/>
                                        </div>
                                    </div>

                                    {/* Group */}
                                    <div className="mt-4">
                                        <label
                                            className="typography-label text-text-primary dark:text-text-primary-dark">Group</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mt-4">
                                            <PropertyTypeOption icon="ballot" iconColor="rgb(255, 148, 8)" title="Group"
                                                                description="Group of multiple fields"/>
                                            <PropertyTypeOption icon="ballot" iconColor="rgb(255, 148, 8)"
                                                                title="Key-value"
                                                                description="Flexible field that allows the user to add multiple key-value pairs"/>
                                            <PropertyTypeOption icon="view_stream" iconColor="rgb(255, 148, 8)"
                                                                title="Block"
                                                                description="A complex field that allows the user to compose different fields together, with a key/value format"/>
                                        </div>
                                    </div>

                                    {/* Array */}
                                    <div className="mt-4">
                                        <label
                                            className="typography-label text-text-primary dark:text-text-primary-dark">Array</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mt-4">
                                            <PropertyTypeOption icon="repeat" iconColor="rgb(255, 148, 8)"
                                                                title="Repeat/list"
                                                                description="A field that gets repeated multiple times (e.g. multiple text fields)"/>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
