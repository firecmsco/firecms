import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FormatOverlineIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"format_overline"} ref={ref}/>
});

FormatOverlineIcon.displayName = "FormatOverlineIcon";
