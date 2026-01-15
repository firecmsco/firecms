import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SettingsInputCompositeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"settings_input_composite"} ref={ref}/>
});

SettingsInputCompositeIcon.displayName = "SettingsInputCompositeIcon";
