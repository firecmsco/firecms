import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CloudDoneIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"cloud_done"} ref={ref}/>
});

CloudDoneIcon.displayName = "CloudDoneIcon";
