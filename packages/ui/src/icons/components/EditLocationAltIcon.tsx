import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EditLocationAltIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"edit_location_alt"} ref={ref}/>
});

EditLocationAltIcon.displayName = "EditLocationAltIcon";
