import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FormatColorResetIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"format_color_reset"} ref={ref}/>
});

FormatColorResetIcon.displayName = "FormatColorResetIcon";
