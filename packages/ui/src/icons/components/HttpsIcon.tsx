import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HttpsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"https"} ref={ref}/>
});

HttpsIcon.displayName = "HttpsIcon";
