import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const QrCodeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"qr_code"} ref={ref}/>
});

QrCodeIcon.displayName = "QrCodeIcon";
