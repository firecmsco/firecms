import React from "react";
import { AuthController } from "@rebasepro/types";

export const AuthControllerContext = React.createContext<AuthController<any, any>>({} as AuthController<any, any>);
