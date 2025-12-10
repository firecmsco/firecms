import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DepartureBoardIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"departure_board"} ref={ref}/>
});

DepartureBoardIcon.displayName = "DepartureBoardIcon";
