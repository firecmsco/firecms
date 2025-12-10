import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CleaningServicesIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"cleaning_services"} ref={ref}/>
});

CleaningServicesIcon.displayName = "CleaningServicesIcon";
