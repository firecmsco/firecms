import { DefaultAppBar, DefaultAppBarProps } from "../core/DefaultAppBar";

/**
 * This component renders the main app bar of FireCMS.
 */
export function AppBar({
                           children,
                           ...props
                       }: {
    children?: React.ReactNode,
    className?: string,
    style?: React.CSSProperties
} & DefaultAppBarProps) {
    const usedChildren = children ?? <DefaultAppBar {...props}/>;
    return <>{usedChildren}</>;
}

AppBar.componentType = "AppBar";
