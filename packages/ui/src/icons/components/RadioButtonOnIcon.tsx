import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RadioButtonOnIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"radio_button_on"} ref={ref}/>
});

RadioButtonOnIcon.displayName = "RadioButtonOnIcon";
