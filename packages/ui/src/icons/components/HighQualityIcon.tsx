import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HighQualityIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"high_quality"} ref={ref}/>
});

HighQualityIcon.displayName = "HighQualityIcon";
