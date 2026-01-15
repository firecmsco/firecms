import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SettingsInputSvideoIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"settings_input_svideo"} ref={ref}/>
});

SettingsInputSvideoIcon.displayName = "SettingsInputSvideoIcon";
