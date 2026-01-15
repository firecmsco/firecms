import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ShortcutIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"shortcut"} ref={ref}/>
});

ShortcutIcon.displayName = "ShortcutIcon";
