import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DoubleArrowIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"double_arrow"} ref={ref}/>
});

DoubleArrowIcon.displayName = "DoubleArrowIcon";
