import React from "react";
import { AuthController, NavigationContext, StorageSource } from "../../types";

export const AuthControllerContext = React.createContext<AuthController>({} as AuthController);
