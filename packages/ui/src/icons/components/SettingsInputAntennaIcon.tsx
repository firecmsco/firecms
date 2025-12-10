import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SettingsInputAntennaIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"settings_input_antenna"} ref={ref}/>
});

SettingsInputAntennaIcon.displayName = "SettingsInputAntennaIcon";
