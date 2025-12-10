import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SchemaIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"schema"} ref={ref}/>
});

SchemaIcon.displayName = "SchemaIcon";
