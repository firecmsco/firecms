import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DeleteSweepIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"delete_sweep"} ref={ref}/>
});

DeleteSweepIcon.displayName = "DeleteSweepIcon";
