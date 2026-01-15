import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LocalAttractionIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"local_attraction"} ref={ref}/>
});

LocalAttractionIcon.displayName = "LocalAttractionIcon";
