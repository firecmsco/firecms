import React from "react";
import { SearchBar } from "@rebasepro/ui";

export default function SearchBarBasicDemo() {
    return (
        <SearchBar onTextSearch={(text) => console.log("Search:", text)} />
    );
}