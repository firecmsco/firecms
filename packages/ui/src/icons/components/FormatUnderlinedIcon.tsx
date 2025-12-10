import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FormatUnderlinedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"format_underlined"} ref={ref}/>
});

FormatUnderlinedIcon.displayName = "FormatUnderlinedIcon";
