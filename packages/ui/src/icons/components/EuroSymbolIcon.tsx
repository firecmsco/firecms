import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EuroSymbolIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"euro_symbol"} ref={ref}/>
});

EuroSymbolIcon.displayName = "EuroSymbolIcon";
