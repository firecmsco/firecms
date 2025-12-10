import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RequestQuoteIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"request_quote"} ref={ref}/>
});

RequestQuoteIcon.displayName = "RequestQuoteIcon";
