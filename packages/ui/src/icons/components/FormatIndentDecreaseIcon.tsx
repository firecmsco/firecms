import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FormatIndentDecreaseIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"format_indent_decrease"} ref={ref}/>
});

FormatIndentDecreaseIcon.displayName = "FormatIndentDecreaseIcon";
