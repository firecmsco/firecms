import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const QrCodeScannerIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"qr_code_scanner"} ref={ref}/>
});

QrCodeScannerIcon.displayName = "QrCodeScannerIcon";
