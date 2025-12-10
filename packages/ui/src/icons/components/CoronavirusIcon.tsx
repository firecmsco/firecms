import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CoronavirusIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"coronavirus"} ref={ref}/>
});

CoronavirusIcon.displayName = "CoronavirusIcon";
