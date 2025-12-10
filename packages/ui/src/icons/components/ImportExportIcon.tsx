import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ImportExportIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"import_export"} ref={ref}/>
});

ImportExportIcon.displayName = "ImportExportIcon";
