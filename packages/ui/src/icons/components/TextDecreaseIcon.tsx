import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TextDecreaseIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"text_decrease"} ref={ref}/>
});

TextDecreaseIcon.displayName = "TextDecreaseIcon";
