import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AddLinkIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"add_link"} ref={ref}/>
});

AddLinkIcon.displayName = "AddLinkIcon";
