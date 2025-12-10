import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FormatAlignCenterIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"format_align_center"} ref={ref}/>
});

FormatAlignCenterIcon.displayName = "FormatAlignCenterIcon";
