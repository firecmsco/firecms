import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RadioButtonUncheckedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"radio_button_unchecked"} ref={ref}/>
});

RadioButtonUncheckedIcon.displayName = "RadioButtonUncheckedIcon";
