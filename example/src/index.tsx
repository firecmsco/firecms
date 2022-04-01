import React from "react";
import { createRoot } from "react-dom/client";

import SampleApp from "./SampleApp/SampleApp";
// import { CustomCMSApp } from "./CustomCMSApp";

const container = document.getElementById('root');
const root = createRoot(container as any);
root.render(<SampleApp/>);

// ReactDOM.render(
//     <SampleApp/>,
//     document.getElementById("root")
// );

