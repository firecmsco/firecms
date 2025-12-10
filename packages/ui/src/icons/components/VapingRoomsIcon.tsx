import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VapingRoomsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"vaping_rooms"} ref={ref}/>
});

VapingRoomsIcon.displayName = "VapingRoomsIcon";
