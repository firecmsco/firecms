import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DiscFullIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"disc_full"} ref={ref}/>
});

DiscFullIcon.displayName = "DiscFullIcon";
