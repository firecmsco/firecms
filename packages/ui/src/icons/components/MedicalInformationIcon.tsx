import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MedicalInformationIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"medical_information"} ref={ref}/>
});

MedicalInformationIcon.displayName = "MedicalInformationIcon";
