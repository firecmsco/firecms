import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SettingsSuggestIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"settings_suggest"} ref={ref}/>
});

SettingsSuggestIcon.displayName = "SettingsSuggestIcon";
