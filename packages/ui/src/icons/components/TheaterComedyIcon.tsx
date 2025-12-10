import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TheaterComedyIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"theater_comedy"} ref={ref}/>
});

TheaterComedyIcon.displayName = "TheaterComedyIcon";
