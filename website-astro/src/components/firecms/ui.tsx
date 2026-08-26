import React from "react";

/**
 * FireCMS UI primitives, transcribed from the real product.
 *
 * Every class string here is copied from the corresponding component in
 * `packages/ui` / `packages/firecms_core`, so demos on this site render with the
 * app's own geometry, colour and typography rather than an approximation. The
 * website already loads `@firecms/ui/index.css`, so the tokens these classes
 * refer to (`surface-*`, `text-text-secondary-dark`, `typography-*`) resolve to
 * exactly the values the app uses.
 *
 * Source of truth, for when the app changes:
 *   Typography  packages/ui/src/components/Typography.tsx + index.css
 *   Chip        packages/ui/src/components/Chip.tsx
 *   IconButton  packages/ui/src/components/IconButton.tsx
 *   Table       packages/ui/src/components/Table.tsx
 *   Button      packages/ui/src/components/Button.tsx
 *   Badge       packages/firecms_core/src/components/PropertyConfigBadge.tsx
 *   configs     packages/firecms_core/src/core/field_configs.tsx
 *
 * These are presentational only — no state, no controllers, no data source.
 */

export const cls = (...parts: (string | false | null | undefined)[]) =>
    parts.filter(Boolean).join(" ");

/* packages/ui/src/styles.ts */
export const defaultBorderMixin =
    "border-surface-200 border-opacity-40 dark:border-surface-700 dark:border-opacity-40 border-surface-200/40 dark:border-surface-700/40";
export const fieldBackgroundMixin =
    "bg-opacity-50 bg-surface-accent-200 bg-surface-accent-200/50 dark:bg-surface-800 dark:bg-opacity-90 dark:bg-surface-800/90";

/* ------------------------------------------------------------------ Icon */

const ICON_PX = { smallest: 16, small: 20, medium: 24, large: 28 } as const;

export type IconSize = keyof typeof ICON_PX | number;

/** packages/ui/src/icons/Icon.tsx — Material Icons ligature. */
export function Icon({
    icon,
    size = "medium",
    className,
    style
}: { icon: string; size?: IconSize; className?: string; style?: React.CSSProperties }) {
    const px = typeof size === "number" ? size : ICON_PX[size];
    return (
        <span
            className={cls("material-icons", "select-none", className)}
            style={{ fontSize: `${px}px`, verticalAlign: "middle", ...style }}>
            {icon}
        </span>
    );
}

/** Load Material Icons once, non-blocking. The app bundles the font; here it is fetched. */
export function useMaterialIcons() {
    React.useEffect(() => {
        const HREF = "https://fonts.googleapis.com/icon?family=Material+Icons";
        if (document.querySelector(`link[href="${HREF}"]`)) return;
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = HREF;
        link.media = "print";
        link.onload = () => { link.media = "all"; };
        document.head.appendChild(link);
    }, []);
}

/* ------------------------------------------------------------ Typography */

const TYPOGRAPHY_VARIANT = {
    h1: "typography-h1", h2: "typography-h2", h3: "typography-h3", h4: "typography-h4",
    h5: "typography-h5", h6: "typography-h6",
    subtitle1: "typography-subtitle1", subtitle2: "typography-subtitle2",
    body1: "typography-body1", body2: "typography-body2",
    label: "typography-label", caption: "typography-caption",
    button: "typography-button", inherit: "typography-inherit"
} as const;

const TYPOGRAPHY_COLOR = {
    inherit: "text-inherit",
    initial: "text-current",
    primary: "text-text-primary dark:text-text-primary-dark",
    secondary: "text-text-secondary dark:text-text-secondary-dark",
    disabled: "text-text-disabled dark:text-text-disabled-dark",
    error: "text-red-600 dark:text-red-500"
} as const;

/**
 * Element per variant, from Typography.tsx's own `typographyVariants` map. This
 * is not cosmetic: `caption` and `body*` render as <p>, so two of them in a row
 * stack instead of running together — which is what makes the previous and new
 * value legible in the history view.
 */
const TYPOGRAPHY_ELEMENT: Record<keyof typeof TYPOGRAPHY_VARIANT, string> = {
    h1: "h1", h2: "h2", h3: "h3", h4: "h4", h5: "h5", h6: "h6",
    subtitle1: "h6", subtitle2: "h6",
    label: "label",
    body1: "p", body2: "p", inherit: "p", caption: "p",
    button: "span"
};

export function Typography({
    variant = "body1",
    color = "primary",
    className,
    children,
    style,
    component
}: {
    variant?: keyof typeof TYPOGRAPHY_VARIANT;
    color?: keyof typeof TYPOGRAPHY_COLOR;
    className?: string;
    children: React.ReactNode;
    style?: React.CSSProperties;
    component?: string;
}) {
    const Tag = (component ?? TYPOGRAPHY_ELEMENT[variant]) as React.ElementType;
    return (
        <Tag className={cls(TYPOGRAPHY_VARIANT[variant], TYPOGRAPHY_COLOR[color], className)} style={style}>
            {children}
        </Tag>
    );
}

/* ------------------------------------------------------------------ Chip */

/** packages/ui/src/util colours, the subset the demos use. */
export const CHIP_COLORS = {
    blueDarker:  { color: "#2750ae", text: "#cfdfff" },
    yellowLight: { color: "#ffd66e", text: "#3b2501" },
    grayLight:   { color: "#ccc",    text: "#040404" }
} as const;

const CHIP_SIZE = {
    smallest: "px-1.5 py-px text-[10px]",
    small: "px-2 py-0.5 text-sm",
    medium: "px-3 py-1 text-sm",
    large: "px-4 py-1.5 text-sm"
} as const;

export function Chip({
    children,
    size = "large",
    colorScheme,
    className,
    style
}: {
    children: React.ReactNode;
    size?: keyof typeof CHIP_SIZE;
    colorScheme?: { color: string; text: string };
    className?: string;
    style?: React.CSSProperties;
}) {
    return (
        <div
            className={cls(
                "rounded-lg max-w-full w-max h-fit font-medium inline-flex gap-1",
                "text-ellipsis", "items-center", "transition-colors duration-150",
                !colorScheme && "bg-surface-accent-200 dark:bg-surface-accent-800 text-surface-accent-800 dark:text-white",
                CHIP_SIZE[size],
                className)}
            style={{
                ...(colorScheme ? { backgroundColor: colorScheme.color, color: colorScheme.text } : {}),
                overflow: "hidden",
                ...style
            }}>
            {children}
        </div>
    );
}

/* ------------------------------------------------------------ IconButton */

const ICON_BUTTON_SIZE = {
    smallest: "w-7 h-7 min-w-7 min-h-7",
    small: "w-8 h-8 min-w-8 min-h-8",
    medium: "w-10 h-10 min-w-10 min-h-10",
    large: "w-12 h-12 min-w-12 min-h-12"
} as const;

export function IconButton({
    children,
    size = "medium",
    className
}: { children: React.ReactNode; size?: keyof typeof ICON_BUTTON_SIZE; className?: string }) {
    return (
        <span
            className={cls(
                "rounded-full inline-flex items-center justify-center p-2 text-sm font-medium",
                "text-surface-accent-600 dark:text-surface-accent-300",
                ICON_BUTTON_SIZE[size],
                className)}>
            {children}
        </span>
    );
}

/* ---------------------------------------------------------------- Button */

const BUTTON_BASE =
    "typography-button h-fit rounded-lg whitespace-nowrap inline-flex items-center justify-center p-2 px-4 transition-colors ease-in-out duration-150 gap-2 w-fit";

const BUTTON_VARIANT = {
    filledPrimary: "border border-primary bg-primary text-white",
    filledNeutral: "border border-transparent bg-surface-100 text-text-primary dark:bg-surface-700 dark:text-text-primary-dark",
    outlinedNeutral: "border border-surface-300 text-text-primary dark:border-surface-600 dark:text-text-primary-dark",
    textNeutral: "border border-transparent text-text-primary dark:text-text-primary-dark",
    disabledFilled: "text-text-disabled dark:text-text-disabled-dark border border-transparent bg-surface-300 dark:bg-surface-500 opacity-40 bg-surface-300/40 dark:bg-surface-500/40"
} as const;

const BUTTON_SIZE = {
    small: "py-1 px-2", medium: "py-2 px-4", large: "py-2.5 px-5"
} as const;

export function Button({
    children,
    variant = "filledPrimary",
    size = "medium",
    className
}: {
    children: React.ReactNode;
    variant?: keyof typeof BUTTON_VARIANT;
    size?: keyof typeof BUTTON_SIZE;
    className?: string;
}) {
    return (
        <span className={cls(BUTTON_BASE, BUTTON_VARIANT[variant], BUTTON_SIZE[size], className)}>
            {children}
        </span>
    );
}

/* ----------------------------------------------------------------- Table */

export const Table = ({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
    <table className={cls("text-left text-surface-800 dark:text-white rounded-md overflow-x-auto", className)} style={style}>
        {children}
    </table>
);

export const TableHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <thead>
        <tr className={cls(defaultBorderMixin,
            "text-sm font-medium text-surface-700 dark:text-surface-accent-300",
            "bg-surface-accent-50 border-b dark:bg-surface-900", className)}>
            {children}
        </tr>
    </thead>
);

export const TableBody = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <tbody className={cls("bg-white dark:bg-surface-950 text-sm divide-y divide-surface-100 dark:divide-surface-700 dark:divide-opacity-70 dark:divide-surface-700/70", className)}>
        {children}
    </tbody>
);

export const TableRow = ({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
    <tr className={cls("bg-white dark:bg-surface-950", className)} style={style}>{children}</tr>
);

export const TableCell = ({
    children, header = false, align, className, style, colSpan
}: {
    children?: React.ReactNode; header?: boolean;
    align?: "left" | "center" | "right"; className?: string;
    style?: React.CSSProperties; colSpan?: number;
}) => {
    const Tag = header ? "th" : "td";
    return (
        <Tag colSpan={colSpan} style={style}
             className={cls("px-4 py-3 text-clip",
                 align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left",
                 className)}>
            {children}
        </Tag>
    );
};

/* --------------------------------------------------- Property type badge */

/** packages/firecms_core/src/core/field_configs.tsx */
export const PROPERTY_CONFIGS = {
    text_field:           { name: "Text field",             color: "#2d7ff9", icon: "short_text" },
    multiline:            { name: "Multiline",              color: "#2d7ff9", icon: "subject" },
    markdown:             { name: "Markdown",               color: "#2d7ff9", icon: "format_quote" },
    url:                  { name: "Url",                    color: "#154fb3", icon: "http" },
    email:                { name: "Email",                  color: "#154fb3", icon: "mail" },
    switch:               { name: "Switch",                 color: "#20d9d2", icon: "flag" },
    select:               { name: "Select/enum",            color: "#4223c9", icon: "list" },
    multi_select:         { name: "Multi select (enum)",    color: "#4223c9", icon: "list_alt" },
    number_input:         { name: "Number input",           color: "#bec920", icon: "numbers" },
    number_select:        { name: "Number select",          color: "#bec920", icon: "format_list_numbered" },
    file_upload:          { name: "File upload",            color: "#f92d9a", icon: "upload_file" },
    multi_file_upload:    { name: "Multiple file upload",   color: "#f92d9a", icon: "drive_folder_upload" },
    reference_as_string:  { name: "Reference (as string)",  color: "#154fb3", icon: "link" },
    reference:            { name: "Reference",              color: "#ff0042", icon: "link" },
    multi_references:     { name: "Multiple references",    color: "#ff0042", icon: "add_link" },
    date_time:            { name: "Date/time",              color: "#8b46ff", icon: "schedule" },
    geopoint:             { name: "Geopoint",               color: "#0ea5e9", icon: "location_on" },
    group:                { name: "Group",                  color: "#ff9408", icon: "ballot" },
    key_value:            { name: "Key-value",              color: "#ff9408", icon: "ballot" },
    repeat:               { name: "Repeat/list",            color: "#ff9408", icon: "repeat" }
} as const;

export type PropertyConfigKey = keyof typeof PROPERTY_CONFIGS;

/** packages/firecms_core/src/components/PropertyConfigBadge.tsx */
export function PropertyConfigBadge({ config, className }: { config: PropertyConfigKey; className?: string }) {
    const c = PROPERTY_CONFIGS[config];
    return (
        <div className={cls("h-8 w-8 flex items-center justify-center rounded-full shadow text-white", className)}
             style={{ background: c.color }}>
            <Icon icon={c.icon} size={"small"}/>
        </div>
    );
}

/* ------------------------------------------------ read-only form widgets */

/** Select trigger, packages/ui/src/components/Select.tsx (display only). */
export function SelectDisplay({
    children, size = "medium", fullWidth, className
}: { children: React.ReactNode; size?: "smallest" | "small" | "medium" | "large"; fullWidth?: boolean; className?: string }) {
    const minH = { smallest: "min-h-[28px]", small: "min-h-[32px]", medium: "min-h-[44px]", large: "min-h-[64px]" }[size];
    const px = { smallest: "px-2", small: "px-2", medium: "px-3", large: "px-4" }[size];
    return (
        <div className={cls("select-none rounded-lg text-sm", fieldBackgroundMixin,
            "relative flex items-center", minH, fullWidth ? "w-full" : "w-fit", className)}>
            <div className={cls("h-full flex-grow flex items-center justify-between gap-2", px)}>
                {children}
                <Icon icon="keyboard_arrow_down" size={"small"} className="text-surface-accent-500"/>
            </div>
        </div>
    );
}

/** TextField, packages/ui/src/components/TextField.tsx (display only). */
export function TextFieldDisplay({
    value, size = "medium", className
}: { value: React.ReactNode; size?: "smallest" | "small" | "medium" | "large"; className?: string }) {
    const minH = { smallest: "min-h-[28px]", small: "min-h-[32px]", medium: "min-h-[44px]", large: "min-h-[64px]" }[size];
    return (
        <div className={cls("rounded-lg relative flex items-center px-3 text-base w-full",
            fieldBackgroundMixin, minH, className)}>
            <span className="text-text-primary dark:text-text-primary-dark truncate">{value}</span>
        </div>
    );
}

/** packages/ui/src/components/Checkbox.tsx (display only). */
export function CheckboxDisplay({ checked }: { checked: boolean }) {
    return (
        <span className={cls(
            "relative inline-flex items-center justify-center w-5 h-5 rounded border-2 transition-colors",
            checked ? "bg-primary border-primary text-white" : "border-surface-400 dark:border-surface-500")}>
            {checked && <Icon icon="check" size={16} className="text-white"/>}
        </span>
    );
}

/** The collection table boolean switch, geometry taken from the running app. */
export function BooleanSwitch({ on, className }: { on: boolean; className?: string }) {
    return (
        <span className={cls(
            "w-[38px] h-[22px] min-w-[38px] min-h-[22px] rounded-full relative shadow-sm inline-block ring-1",
            on ? "ring-secondary bg-secondary" : "bg-surface-accent-900 ring-surface-accent-700",
            className)}>
            <span className={cls(
                "block rounded-full transition-transform duration-100 ease-out w-[19px] h-[19px] mt-[1.5px]",
                on ? "bg-white shadow translate-x-[17px]" : "bg-surface-accent-400 shadow-sm translate-x-[2px]")}/>
        </span>
    );
}

/**
 * TextField carrying a floating label — the shape every string property takes in
 * the entity form. packages/ui/src/components/TextField.tsx: at size "large" the
 * input is min-h-[64px] with pt-8 pb-2 and the label sits at top-1.
 */
export function TextFieldWithLabel({
    label, value, icon, caret, className
}: {
    label: string;
    value: React.ReactNode;
    /** The property type icon the form shows beside the label. */
    icon?: { icon: string; color: string };
    caret?: boolean;
    className?: string;
}) {
    return (
        <div className={cls("rounded-lg relative max-w-full min-h-[64px]", fieldBackgroundMixin, className)}>
            <div className="pointer-events-none absolute top-1 left-0 px-3 pt-1 text-text-secondary dark:text-text-secondary-dark">
                {/* LabelWithIcon — align-middle inline-flex items-center my-0.5 gap-2 */}
                <div className="align-middle inline-flex items-center my-0.5 gap-2">
                    {icon && (
                        <span className="h-4 w-4 flex items-center justify-center rounded-full text-white shrink-0"
                              style={{ background: icon.color }}>
                            <Icon icon={icon.icon} size={11}/>
                        </span>
                    )}
                    <span className="text-start font-medium text-sm">{label}</span>
                </div>
            </div>
            <div className={cls("w-full bg-transparent leading-normal px-3 rounded-lg min-h-[64px] pt-8 pb-2",
                "text-text-primary dark:text-text-primary-dark")}>
                {value}
                {caret && <span className="caret ml-px inline-block w-px h-[1.05em] align-[-0.15em] bg-primary"/>}
            </div>
        </div>
    );
}
