import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const KitesurfingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"kitesurfing"} ref={ref}/>
});

KitesurfingIcon.displayName = "KitesurfingIcon";
