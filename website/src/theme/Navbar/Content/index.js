import React from "react";
import { ErrorCauseBoundary, useThemeConfig } from "@docusaurus/theme-common";
import { splitNavbarItems, useNavbarMobileSidebar, } from "@docusaurus/theme-common/internal";
import NavbarItem from "@theme/NavbarItem";
import NavbarColorModeToggle from "@theme/Navbar/ColorModeToggle";
import SearchBar from "@theme/SearchBar";
import NavbarMobileSidebarToggle from "@theme/Navbar/MobileSidebar/Toggle";
import NavbarSearch from "@theme/Navbar/Search";
import NavigationDropdown from "../../../NavigationDropdown";

function useNavbarItems() {
    // TODO temporary casting until ThemeConfig type is improved
    return useThemeConfig().navbar.items;
}

function NavbarItems({ items }) {
    return (
        <>
            {items.map((item, i) => (
                <ErrorCauseBoundary
                    key={i}
                    onError={(error) =>
                        new Error(
                            `A theme navbar item failed to render.
Please double-check the following navbar item (themeConfig.navbar.items) of your Docusaurus config:
${JSON.stringify(item, null, 2)}`,
                            { cause: error },
                        )
                    }>
                    {item.className === "colorSwitch" && <div className={"px-4"}><NavbarColorModeToggle/></div>}
                    {item.className !== "colorSwitch" && <NavbarItem {...item} />}
                </ErrorCauseBoundary>
            ))}
        </>
    );
}

function NavbarContentLayout({
                                 left,
                                 right
                             }) {
    return (
        <div className="navbar__inner">
            <div className="navbar__items p-4 navbar__items--left">{left}</div>
            <div className="navbar__items navbar__items--right">{right}</div>
        </div>
    );
}

export default function NavbarContent() {
    const mobileSidebar = useNavbarMobileSidebar();
    const items = useNavbarItems();
    const [leftItems, rightItems] = splitNavbarItems(items);
    const searchBarItem = items.find((item) => item.type === "search");
    const dropdownItems = leftItems.filter((item) => item.items?.length > 0);
    const notDropdownItems = leftItems.filter((item) => !(item.items?.length > 0));
    return (
        <NavbarContentLayout
            left={
                // TODO stop hardcoding items?
                <>
                    {!mobileSidebar.disabled && <NavbarMobileSidebarToggle/>}

                    {/*<NavbarLogo/>*/}
                    <a href="/" className="navbar__brand">
                        <img
                            className={"w-8 h-8 mr-4"}
                            src="/img/logo_small.png"
                            alt="FireCMS Logo"
                        />
                    </a>
                    {dropdownItems.map((item, i) => {
                        const innerLeftItems = item.items.filter((item) => item.customPosition !== "right");
                        const innerRightItems = item.items.filter((item) => item.customPosition === "right");
                        return (
                            <NavigationDropdown
                                key={item.to}
                                trigger={<div className="navbar__item dropdown dropdown--hoverable">
                                    <a className="navbar__link"
                                       role="button"
                                       href="/features">{item.label}</a>
                                </div>}>
                                <div className={"flex flex-row gap-16 py-8"}>
                                    {innerLeftItems && <div className={"flex flex-col"}>
                                        <NavbarItems items={innerLeftItems}/>
                                    </div>}
                                    {innerRightItems && <div className={"flex flex-col"}>
                                        <NavbarItems items={innerRightItems}/>
                                    </div>}
                                </div>
                            </NavigationDropdown>);
                    })}

                    <NavbarItems items={notDropdownItems}/>
                </>
            }
            right={
                // TODO stop hardcoding items?
                // Ask the user to add the respective navbar items => more flexible
                <>
                    <NavbarItems items={rightItems}/>
                    {!searchBarItem && (
                        <NavbarSearch>
                            <SearchBar/>
                        </NavbarSearch>
                    )}
                </>
            }
        />
    );
}
