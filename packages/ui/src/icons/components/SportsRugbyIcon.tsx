import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SportsRugbyIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sports_rugby"} ref={ref}/>
});

SportsRugbyIcon.displayName = "SportsRugbyIcon";
