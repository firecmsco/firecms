import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DocumentScannerIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"document_scanner"} ref={ref}/>
});

DocumentScannerIcon.displayName = "DocumentScannerIcon";
