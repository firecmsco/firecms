import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CardTravelIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"card_travel"} ref={ref}/>
});

CardTravelIcon.displayName = "CardTravelIcon";
