import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FilterTiltShiftIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"filter_tilt_shift"} ref={ref}/>
});

FilterTiltShiftIcon.displayName = "FilterTiltShiftIcon";
