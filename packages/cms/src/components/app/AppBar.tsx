import { DefaultAppBar, DefaultAppBarProps } from "../DefaultAppBar";
/**
 * This component renders the main app bar of Rebase.
 */
export function AppBar({
    children,
    ...props
}: {
    children?: React.ReactNode,
    className?: string,
    style?: React.CSSProperties
} & DefaultAppBarProps) {
    const usedChildren = children ?? <DefaultAppBar {...props} />;
    return <>{usedChildren}</>;
}

AppBar.componentType = "AppBar";
