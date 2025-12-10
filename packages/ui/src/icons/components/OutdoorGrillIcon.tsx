import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const OutdoorGrillIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"outdoor_grill"} ref={ref}/>
});

OutdoorGrillIcon.displayName = "OutdoorGrillIcon";
