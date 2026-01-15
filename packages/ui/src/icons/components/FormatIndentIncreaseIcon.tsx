import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FormatIndentIncreaseIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"format_indent_increase"} ref={ref}/>
});

FormatIndentIncreaseIcon.displayName = "FormatIndentIncreaseIcon";
