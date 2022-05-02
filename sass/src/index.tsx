import React from "react";
import { createRoot } from "react-dom/client";

import { SassCMSApp } from "./SassCMSApp";

const container = document.getElementById('root');
const root = createRoot(container as any);
root.render(<SassCMSApp/>);


