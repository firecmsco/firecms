import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NearbyErrorIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"nearby_error"} ref={ref}/>
});

NearbyErrorIcon.displayName = "NearbyErrorIcon";
