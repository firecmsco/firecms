import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CorporateFareIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"corporate_fare"} ref={ref}/>
});

CorporateFareIcon.displayName = "CorporateFareIcon";
