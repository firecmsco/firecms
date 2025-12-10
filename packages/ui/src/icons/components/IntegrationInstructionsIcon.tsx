import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const IntegrationInstructionsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"integration_instructions"} ref={ref}/>
});

IntegrationInstructionsIcon.displayName = "IntegrationInstructionsIcon";
