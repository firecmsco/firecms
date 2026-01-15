import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NightsStayIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"nights_stay"} ref={ref}/>
});

NightsStayIcon.displayName = "NightsStayIcon";
