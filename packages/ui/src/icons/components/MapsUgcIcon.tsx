import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MapsUgcIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"maps_ugc"} ref={ref}/>
});

MapsUgcIcon.displayName = "MapsUgcIcon";
