import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RealEstateAgentIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"real_estate_agent"} ref={ref}/>
});

RealEstateAgentIcon.displayName = "RealEstateAgentIcon";
