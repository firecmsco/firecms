import React from "react";
import { DataSource } from "../types/index.js";

export const DataSourceContext = React.createContext<DataSource>({} as DataSource);
