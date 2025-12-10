import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ReceiptLongIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"receipt_long"} ref={ref}/>
});

ReceiptLongIcon.displayName = "ReceiptLongIcon";
