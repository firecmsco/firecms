import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FormatUnderlineIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"format_underline"} ref={ref}/>
});

FormatUnderlineIcon.displayName = "FormatUnderlineIcon";
