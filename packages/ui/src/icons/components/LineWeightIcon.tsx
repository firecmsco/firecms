import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LineWeightIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"line_weight"} ref={ref}/>
});

LineWeightIcon.displayName = "LineWeightIcon";
