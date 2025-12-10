import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CatchingPokemonIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"catching_pokemon"} ref={ref}/>
});

CatchingPokemonIcon.displayName = "CatchingPokemonIcon";
