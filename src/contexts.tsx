import React from "react";
import { User } from "firebase";

export const AuthContext = React.createContext<User | null>(null);
export const FirebaseConfigContext = React.createContext<any>(null);
