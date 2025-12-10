import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MedicationLiquidIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"medication_liquid"} ref={ref}/>
});

MedicationLiquidIcon.displayName = "MedicationLiquidIcon";
