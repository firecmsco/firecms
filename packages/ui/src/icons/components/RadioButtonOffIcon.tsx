import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RadioButtonOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"radio_button_off"} ref={ref}/>
});

RadioButtonOffIcon.displayName = "RadioButtonOffIcon";
