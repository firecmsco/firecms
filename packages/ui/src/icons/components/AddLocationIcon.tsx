import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AddLocationIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"add_location"} ref={ref}/>
});

AddLocationIcon.displayName = "AddLocationIcon";
