import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SwitchAccessShortcutAddIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"switch_access_shortcut_add"} ref={ref}/>
});

SwitchAccessShortcutAddIcon.displayName = "SwitchAccessShortcutAddIcon";
