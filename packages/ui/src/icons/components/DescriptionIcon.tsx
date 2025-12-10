import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DescriptionIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"description"} ref={ref}/>
});

DescriptionIcon.displayName = "DescriptionIcon";
