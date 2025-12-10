import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SportsEsportsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sports_esports"} ref={ref}/>
});

SportsEsportsIcon.displayName = "SportsEsportsIcon";
