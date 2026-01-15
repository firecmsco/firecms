import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LocalOfferIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"local_offer"} ref={ref}/>
});

LocalOfferIcon.displayName = "LocalOfferIcon";
