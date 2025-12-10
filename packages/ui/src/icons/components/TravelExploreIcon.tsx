import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TravelExploreIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"travel_explore"} ref={ref}/>
});

TravelExploreIcon.displayName = "TravelExploreIcon";
