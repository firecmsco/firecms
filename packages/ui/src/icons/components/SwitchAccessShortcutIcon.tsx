import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SwitchAccessShortcutIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"switch_access_shortcut"} ref={ref}/>
});

SwitchAccessShortcutIcon.displayName = "SwitchAccessShortcutIcon";
