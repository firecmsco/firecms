import React from "react";
import * as lucide from "lucide-react";
import { CMSView, EntityCollection } from "../../types";
import { hashString } from "./hash";

export function getIcon(iconKey?: string, props?: any): React.ReactElement | undefined {
    if (!iconKey) return undefined;
    if (iconKey in translationMap) iconKey = translationMap[iconKey];
    if (!(iconKey in lucide)) {
        console.warn(`Icon ${iconKey} not found in lucide`);
        return undefined;
    }
    return iconKey in lucide ? React.createElement(lucide[iconKey as keyof typeof lucide] as React.ComponentType, props) : undefined;
}

export function getIconForView(collectionOrView: EntityCollection | CMSView, props?: any): React.ReactElement {
    const iconsKeys = Object.keys(lucide);
    const iconsCount = iconsKeys.length;

    const icon = getIcon(collectionOrView.icon, props);
    if (collectionOrView?.icon && icon)
        return icon;

    const key = iconsKeys[hashString(collectionOrView.path) % iconsCount] as keyof typeof lucide;
    return React.createElement(lucide[key] as React.ComponentType, props);
}

const translationMap: Record<string, string> = {
    AcUnit: "Wind",
    Adjust: "AdjustmentsAlt",
    AlignHorizontalCenter: "Drag",
    Album: "Album",
    AllInclusive: "Link",
    AllOut: "ShareNetwork",
    Animation: "Tv",
    Assistant: "HelpCircle",
    Attractions: "Flag",
    Audiotrack: "Music",
    AutoAwesome: "Star",
    AutoAwesomeMosaic: "Grid",
    BeachAccess: "Umbrella",
    Bolt: "Flashlight",
    Brightness1: "Sun",
    BreakfastDining: "Coffee",
    BrokenImage: "ImageOff",
    Brightness5: "Sunset",
    Cable: "Plug",
    CalendarViewMonth: "Calendar",
    CatchingPokemon: "Target",
    Casino: "Dice",
    Category: "File",
    Cloud: "Cloud",
    ColorLens: "Droplet",
    CreditCard: "CreditCard",
    Coronavirus: "VirusSearch",
    Earbuds: "Headphones",
    EggAlt: "Egg",
    FiberSmartRecord: "Video",
    Flag: "Flag",
    Healing: "MedicalCross",
    HeatPump: "Thermometer",
    Hive: "Hexagon",
    Hub: "Cpu",
    LocalFireDepartment: "Fire",
    LocalPizza: "Pizza",
    Memory: "MemoryCard",
    Outlet: "Plug",
    Pages: "Files",
    PanoramaPhotosphere: "Photo",
    SignalCellular0Bar: "WifiOff",
    SportsBaseball: "Baseball",
    Storm: "CloudStorm",
    Stairs: "Stairs"
};

