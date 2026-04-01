import React from "react";
import {
    FiberManualRecordIcon,
    Menubar,
    MenubarCheckboxItem,
    MenubarContent,
    MenubarItem,
    MenubarItemIndicator,
    MenubarMenu,
    MenubarPortal,
    MenubarRadioGroup,
    MenubarRadioItem,
    MenubarSeparator,
    MenubarShortcut,
    MenubarSub,
    MenubarSubContent,
    MenubarSubTrigger,
    MenubarSubTriggerIndicator,
    MenubarTrigger
} from "@firecms/ui";

const RADIO_ITEMS = ["Andy", "Benoît", "Luis"];
const CHECK_ITEMS = ["Always Show Bookmarks Bar", "Always Show Full URLs"];

export default function MenubarDemo() {
    const [checkedSelection, setCheckedSelection] = React.useState([CHECK_ITEMS[1]]);
    const [radioSelection, setRadioSelection] = React.useState(RADIO_ITEMS[2]);

    return (
        <Menubar className={"rounded-lg mb-8"}>
            <MenubarMenu>
                <MenubarTrigger>
                    File
                </MenubarTrigger>
                <MenubarPortal>
                    <MenubarContent>
                        <MenubarItem>
                            New Tab{" "}
                            <MenubarShortcut>
                                ⌘ T
                            </MenubarShortcut>
                        </MenubarItem>
                        <MenubarItem>
                            New Window{" "}
                            <MenubarShortcut>
                                ⌘ N
                            </MenubarShortcut>
                        </MenubarItem>
                        <MenubarItem disabled
                        >
                            New Incognito Window
                        </MenubarItem>
                        <MenubarSeparator/>
                        <MenubarSub>
                            <MenubarSubTrigger>
                                Share
                                <MenubarSubTriggerIndicator/>
                            </MenubarSubTrigger>
                            <MenubarPortal>
                                <MenubarSubContent>
                                    <MenubarItem>
                                        Email Link
                                    </MenubarItem>
                                    <MenubarItem>
                                        Messages
                                    </MenubarItem>
                                    <MenubarItem>
                                        Notes
                                    </MenubarItem>
                                </MenubarSubContent>
                            </MenubarPortal>
                        </MenubarSub>
                        <MenubarSeparator/>
                        <MenubarItem>
                            Print…{" "}
                            <MenubarShortcut>
                                ⌘ P
                            </MenubarShortcut>
                        </MenubarItem>
                    </MenubarContent>
                </MenubarPortal>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger>
                    Edit
                </MenubarTrigger>
                <MenubarPortal>
                    <MenubarContent>
                        <MenubarItem>
                            Undo{" "}
                            <MenubarShortcut
                            >
                                ⌘ Z
                            </MenubarShortcut>
                        </MenubarItem>
                        <MenubarItem>
                            Redo{" "}
                            <MenubarShortcut
                            >
                                ⇧ ⌘ Z
                            </MenubarShortcut>
                        </MenubarItem>
                        <MenubarSeparator/>
                        <MenubarSub>
                            <MenubarSubTrigger>
                                Find
                            </MenubarSubTrigger>

                            <MenubarPortal>
                                <MenubarSubContent>
                                    <MenubarItem>
                                        Search the web…
                                    </MenubarItem>
                                    <MenubarSeparator/>
                                    <MenubarItem>
                                        Find…
                                    </MenubarItem>
                                    <MenubarItem>
                                        Find Next
                                    </MenubarItem>
                                    <MenubarItem>
                                        Find Previous
                                    </MenubarItem>
                                </MenubarSubContent>
                            </MenubarPortal>
                        </MenubarSub>
                        <MenubarSeparator/>
                        <MenubarItem>
                            Cut
                        </MenubarItem>
                        <MenubarItem>
                            Copy
                        </MenubarItem>
                        <MenubarItem>
                            Paste
                        </MenubarItem>
                    </MenubarContent>
                </MenubarPortal>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger>
                    View
                </MenubarTrigger>
                <MenubarPortal>
                    <MenubarContent>
                        {CHECK_ITEMS.map((item) => (
                            <MenubarCheckboxItem

                                key={item}
                                checked={checkedSelection.includes(item)}
                                onCheckedChange={() =>
                                    setCheckedSelection((current) =>
                                        current.includes(item)
                                            ? current.filter((el) => el !== item)
                                            : current.concat(item)
                                    )
                                }
                            >
                                <MenubarItemIndicator/>
                                {item}
                            </MenubarCheckboxItem>
                        ))}
                        <MenubarSeparator/>
                        <MenubarItem leftPadding={true}>
                            Reload{" "}
                            <MenubarShortcut>
                                ⌘ R
                            </MenubarShortcut>
                        </MenubarItem>
                        <MenubarItem
                            leftPadding
                            disabled>
                            Force Reload{" "}
                            <MenubarShortcut>
                                ⇧ ⌘ R
                            </MenubarShortcut>
                        </MenubarItem>
                        <MenubarSeparator/>
                        <MenubarItem
                            leftPadding>
                            Toggle Fullscreen
                        </MenubarItem>
                        <MenubarSeparator/>
                        <MenubarItem
                            leftPadding>
                            Hide Sidebar
                        </MenubarItem>
                    </MenubarContent>
                </MenubarPortal>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger>
                    Profiles
                </MenubarTrigger>
                <MenubarPortal>
                    <MenubarContent>
                        <MenubarRadioGroup value={radioSelection} onValueChange={setRadioSelection}>
                            {RADIO_ITEMS.map((item) => (
                                <MenubarRadioItem
                                    key={item}
                                    value={item}>
                                    <MenubarItemIndicator>
                                        <FiberManualRecordIcon size={"smallest"}/>
                                    </MenubarItemIndicator>
                                    {item}
                                </MenubarRadioItem>
                            ))}
                            <MenubarSeparator/>
                            <MenubarItem leftPadding>
                                Edit…
                            </MenubarItem>
                            <MenubarSeparator/>
                            <MenubarItem leftPadding>
                                Add Profile…
                            </MenubarItem>
                        </MenubarRadioGroup>
                    </MenubarContent>
                </MenubarPortal>
            </MenubarMenu>
        </Menubar>
    );
};
