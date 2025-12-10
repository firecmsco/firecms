import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RadioButtonCheckedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"radio_button_checked"} ref={ref}/>
});

RadioButtonCheckedIcon.displayName = "RadioButtonCheckedIcon";
