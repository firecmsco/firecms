import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FormatListNumberedRtlIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"format_list_numbered_rtl"} ref={ref}/>
});

FormatListNumberedRtlIcon.displayName = "FormatListNumberedRtlIcon";
