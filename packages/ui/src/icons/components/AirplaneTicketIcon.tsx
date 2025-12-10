import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AirplaneTicketIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"airplane_ticket"} ref={ref}/>
});

AirplaneTicketIcon.displayName = "AirplaneTicketIcon";
