import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AssistantPhotoIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"assistant_photo"} ref={ref}/>
});

AssistantPhotoIcon.displayName = "AssistantPhotoIcon";
