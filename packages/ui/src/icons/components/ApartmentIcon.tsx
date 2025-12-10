import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ApartmentIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"apartment"} ref={ref}/>
});

ApartmentIcon.displayName = "ApartmentIcon";
