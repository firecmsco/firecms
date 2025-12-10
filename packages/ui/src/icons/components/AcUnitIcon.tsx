import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AcUnitIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"ac_unit"} ref={ref}/>
});

AcUnitIcon.displayName = "AcUnitIcon";
