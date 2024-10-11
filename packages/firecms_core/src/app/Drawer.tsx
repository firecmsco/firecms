import { DefaultDrawer } from "../core";

/**
 * This component is in charge of rendering the drawer.
 * If you add this component under your {@link Scaffold}, it will be rendered
 * as a drawer, and the open and close functionality will be handled automatically.
 * If you want to customise the drawer, you can create your own component and pass it as a child.
 * For custom drawers, you can use the {@link useApp} to open and close the drawer.
 *
 */
export function Drawer({
                           children,
                           className,
                           style
                       }: {
    children?: React.ReactNode,
    className?: string,
    style?: React.CSSProperties
}) {
    const usedChildren = children ?? <DefaultDrawer className={className} style={style}/>;
    return <>{usedChildren}</>;
}

Drawer.componentType = "Drawer";
