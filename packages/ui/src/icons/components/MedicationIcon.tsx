import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MedicationIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"medication"} ref={ref}/>
});

MedicationIcon.displayName = "MedicationIcon";
