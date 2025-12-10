import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FormatLineSpacingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"format_line_spacing"} ref={ref}/>
});

FormatLineSpacingIcon.displayName = "FormatLineSpacingIcon";
