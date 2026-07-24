/**
 * API surface regression test.
 *
 * This test locks the public export contract of `@firecms/ui`. It exists to
 * guard against *accidental API-breaking changes* while porting improvements
 * from downstream forks: every name listed here must remain exported.
 *
 * Adding new exports is fine (and expected) — this test only fails if an
 * existing public export disappears or is renamed. When intentionally adding
 * exports, leave this list as the "must always exist" baseline; do not remove
 * entries unless a breaking change is explicitly intended and versioned.
 */
import * as UI from "../src";

// Non-icon public exports as of the baseline. Icons are generated and excluded.
const REQUIRED_EXPORTS = [
    "Alert",
    "Autocomplete",
    "AutocompleteItem",
    "Avatar",
    "Badge",
    "BooleanSwitch",
    "BooleanSwitchWithLabel",
    "Button",
    "CHIP_COLORS",
    "Card",
    "CenteredView",
    "Checkbox",
    "Chip",
    "CircularProgress",
    "Collapse",
    "ColorPicker",
    "Container",
    "DateTimeField",
    "DebouncedTextField",
    "Dialog",
    "DialogActions",
    "DialogContent",
    "DialogTitle",
    "ExpandablePanel",
    "FileUpload",
    "IconButton",
    "InfoLabel",
    "InputLabel",
    "Label",
    "LoadingButton",
    "Markdown",
    "Menu",
    "MenuItem",
    "Menubar",
    "MenubarCheckboxItem",
    "MenubarContent",
    "MenubarItem",
    "MenubarItemIndicator",
    "MenubarMenu",
    "MenubarPortal",
    "MenubarRadioGroup",
    "MenubarRadioItem",
    "MenubarSeparator",
    "MenubarShortcut",
    "MenubarSub",
    "MenubarSubContent",
    "MenubarSubTrigger",
    "MenubarSubTriggerIndicator",
    "MenubarTrigger",
    "MultiSelect",
    "MultiSelectContext",
    "MultiSelectItem",
    "Paper",
    "Popover",
    "PortalContainerProvider",
    "RadioGroup",
    "RadioGroupItem",
    "ResizablePanels",
    "SearchBar",
    "SearchableSelect",
    "SearchableSelectItem",
    "Select",
    "SelectGroup",
    "SelectItem",
    "Separator",
    "Sheet",
    "Skeleton",
    "Slider",
    "Tab",
    "Table",
    "TableBody",
    "TableCell",
    "TableHeader",
    "TableRow",
    "Tabs",
    "TextField",
    "TextareaAutosize",
    "ToggleButtonGroup",
    "Tooltip",
    "Typography",
    "cardClickableMixin",
    "cardMixin",
    "cardSelectedMixin",
    "cls",
    "cn",
    "coolIconKeys",
    "debounce",
    "defaultBorderMixin",
    "fieldBackgroundDisabledMixin",
    "fieldBackgroundHoverMixin",
    "fieldBackgroundInvisibleMixin",
    "fieldBackgroundMixin",
    "focusedClasses",
    "focusedDisabled",
    "focusedInvisibleMixin",
    "getColorSchemeForKey",
    "getColorSchemeForSeed",
    "iconKeys",
    "keyToIconComponent",
    "paperMixin",
    "useAutoComplete",
    "useDebounceValue",
    "useIconStyles",
    "useInjectStyles",
    "useOutsideAlerter",
    "usePortalContainer"
];

describe("@firecms/ui public API surface", () => {
    it.each(REQUIRED_EXPORTS)("exports %s", (name) => {
        expect(UI).toHaveProperty(name);
        expect((UI as Record<string, unknown>)[name]).toBeDefined();
    });

    it("still exports the generated icon set", () => {
        const iconNames = Object.keys(UI).filter((k) => /Icon$/.test(k));
        // The generated icon set is large; assert it did not collapse.
        expect(iconNames.length).toBeGreaterThan(1000);
    });
});
