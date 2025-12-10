import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FilterAltOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"filter_alt_off"} ref={ref}/>
});

FilterAltOffIcon.displayName = "FilterAltOffIcon";
