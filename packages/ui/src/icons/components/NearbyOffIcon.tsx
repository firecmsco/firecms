import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NearbyOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"nearby_off"} ref={ref}/>
});

NearbyOffIcon.displayName = "NearbyOffIcon";
