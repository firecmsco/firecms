import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const StreetviewIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"streetview"} ref={ref}/>
});

StreetviewIcon.displayName = "StreetviewIcon";
