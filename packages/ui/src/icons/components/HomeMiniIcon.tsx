import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HomeMiniIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"home_mini"} ref={ref}/>
});

HomeMiniIcon.displayName = "HomeMiniIcon";
