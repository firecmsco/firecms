import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const QueryStatsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"query_stats"} ref={ref}/>
});

QueryStatsIcon.displayName = "QueryStatsIcon";
