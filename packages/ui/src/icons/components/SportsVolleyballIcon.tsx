import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SportsVolleyballIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sports_volleyball"} ref={ref}/>
});

SportsVolleyballIcon.displayName = "SportsVolleyballIcon";
