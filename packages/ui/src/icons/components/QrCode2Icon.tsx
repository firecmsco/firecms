import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const QrCode2Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"qr_code_2"} ref={ref}/>
});

QrCode2Icon.displayName = "QrCode2Icon";
