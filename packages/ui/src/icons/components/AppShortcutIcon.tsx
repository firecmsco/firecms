import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AppShortcutIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"app_shortcut"} ref={ref}/>
});

AppShortcutIcon.displayName = "AppShortcutIcon";
