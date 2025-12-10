import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FormatQuoteIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"format_quote"} ref={ref}/>
});

FormatQuoteIcon.displayName = "FormatQuoteIcon";
