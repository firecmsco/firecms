import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AddLocationAltIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"add_location_alt"} ref={ref}/>
});

AddLocationAltIcon.displayName = "AddLocationAltIcon";
