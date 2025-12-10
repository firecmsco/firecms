import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AddModeratorIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"add_moderator"} ref={ref}/>
});

AddModeratorIcon.displayName = "AddModeratorIcon";
