import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const GeneratingTokensIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"generating_tokens"} ref={ref}/>
});

GeneratingTokensIcon.displayName = "GeneratingTokensIcon";
