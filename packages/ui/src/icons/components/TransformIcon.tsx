import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TransformIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"transform"} ref={ref}/>
});

TransformIcon.displayName = "TransformIcon";
