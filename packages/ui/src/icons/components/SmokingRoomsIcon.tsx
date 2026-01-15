import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SmokingRoomsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"smoking_rooms"} ref={ref}/>
});

SmokingRoomsIcon.displayName = "SmokingRoomsIcon";
