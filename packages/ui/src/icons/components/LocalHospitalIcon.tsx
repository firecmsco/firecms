import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LocalHospitalIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"local_hospital"} ref={ref}/>
});

LocalHospitalIcon.displayName = "LocalHospitalIcon";
