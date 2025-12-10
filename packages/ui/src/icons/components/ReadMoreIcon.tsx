import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ReadMoreIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"read_more"} ref={ref}/>
});

ReadMoreIcon.displayName = "ReadMoreIcon";
