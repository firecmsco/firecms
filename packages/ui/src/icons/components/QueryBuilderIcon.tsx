import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const QueryBuilderIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"query_builder"} ref={ref}/>
});

QueryBuilderIcon.displayName = "QueryBuilderIcon";
