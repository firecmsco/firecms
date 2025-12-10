import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AddToHomeScreenIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"add_to_home_screen"} ref={ref}/>
});

AddToHomeScreenIcon.displayName = "AddToHomeScreenIcon";
