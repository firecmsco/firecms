import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MedicalServicesIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"medical_services"} ref={ref}/>
});

MedicalServicesIcon.displayName = "MedicalServicesIcon";
