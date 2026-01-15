import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FormatPaintIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"format_paint"} ref={ref}/>
});

FormatPaintIcon.displayName = "FormatPaintIcon";
