import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FormatStrikethroughIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"format_strikethrough"} ref={ref}/>
});

FormatStrikethroughIcon.displayName = "FormatStrikethroughIcon";
