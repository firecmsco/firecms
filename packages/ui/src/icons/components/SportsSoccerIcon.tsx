import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SportsSoccerIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sports_soccer"} ref={ref}/>
});

SportsSoccerIcon.displayName = "SportsSoccerIcon";
