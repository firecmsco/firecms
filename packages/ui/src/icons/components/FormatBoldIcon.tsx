import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FormatBoldIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"format_bold"} ref={ref}/>
});

FormatBoldIcon.displayName = "FormatBoldIcon";
