import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BorderHorizontalIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"border_horizontal"} ref={ref}/>
});

BorderHorizontalIcon.displayName = "BorderHorizontalIcon";
