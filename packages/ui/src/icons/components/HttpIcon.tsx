import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HttpIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"http"} ref={ref}/>
});

HttpIcon.displayName = "HttpIcon";
