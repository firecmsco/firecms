import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EditAttributesIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"edit_attributes"} ref={ref}/>
});

EditAttributesIcon.displayName = "EditAttributesIcon";
