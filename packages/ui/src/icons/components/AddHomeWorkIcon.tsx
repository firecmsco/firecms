import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AddHomeWorkIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"add_home_work"} ref={ref}/>
});

AddHomeWorkIcon.displayName = "AddHomeWorkIcon";
