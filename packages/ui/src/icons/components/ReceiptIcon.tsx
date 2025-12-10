import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ReceiptIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"receipt"} ref={ref}/>
});

ReceiptIcon.displayName = "ReceiptIcon";
