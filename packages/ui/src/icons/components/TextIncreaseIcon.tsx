import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TextIncreaseIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"text_increase"} ref={ref}/>
});

TextIncreaseIcon.displayName = "TextIncreaseIcon";
