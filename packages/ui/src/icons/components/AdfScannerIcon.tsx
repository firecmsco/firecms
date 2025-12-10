import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AdfScannerIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"adf_scanner"} ref={ref}/>
});

AdfScannerIcon.displayName = "AdfScannerIcon";
