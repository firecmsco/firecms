import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ScannerIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"scanner"} ref={ref}/>
});

ScannerIcon.displayName = "ScannerIcon";
