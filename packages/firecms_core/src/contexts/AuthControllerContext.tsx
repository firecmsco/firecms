import React from "react";
import { AuthController } from "../types";

export const AuthControllerContext = React.createContext<AuthController<any, any>>({} as AuthController<any, any>);
