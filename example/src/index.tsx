import React from "react";
import { createRoot } from "react-dom/client";

import SampleApp from "./SampleApp/SampleApp";

const container = document.getElementById("root");
const root = createRoot(container as any);
root.render(
    <React.StrictMode>
        <SampleApp/>
    </React.StrictMode>
);
