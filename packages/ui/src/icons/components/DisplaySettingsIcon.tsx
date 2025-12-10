import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DisplaySettingsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"display_settings"} ref={ref}/>
});

DisplaySettingsIcon.displayName = "DisplaySettingsIcon";
