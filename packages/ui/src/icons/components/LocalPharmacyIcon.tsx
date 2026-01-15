import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LocalPharmacyIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"local_pharmacy"} ref={ref}/>
});

LocalPharmacyIcon.displayName = "LocalPharmacyIcon";
