import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TranscribeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"transcribe"} ref={ref}/>
});

TranscribeIcon.displayName = "TranscribeIcon";
