import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LocalMallIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"local_mall"} ref={ref}/>
});

LocalMallIcon.displayName = "LocalMallIcon";
