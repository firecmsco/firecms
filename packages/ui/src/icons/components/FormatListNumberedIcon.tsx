import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FormatListNumberedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"format_list_numbered"} ref={ref}/>
});

FormatListNumberedIcon.displayName = "FormatListNumberedIcon";
