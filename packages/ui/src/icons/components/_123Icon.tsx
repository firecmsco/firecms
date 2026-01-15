import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const _123Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"123"} ref={ref}/>
});

_123Icon.displayName = "_123Icon";
