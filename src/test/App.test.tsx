import React from "react";
import ReactDOM from "react-dom";
import { FirebaseCMSApp } from "../index";
import { siteConfig } from "./test_site_config";

it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<FirebaseCMSApp {...siteConfig}/>, div);
    ReactDOM.unmountComponentAtNode(div);
});


describe("CMSApp", () => {
    it("is truthy", () => {
        expect(FirebaseCMSApp).toBeTruthy();
    });
});
