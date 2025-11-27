import React from "react";
import { SearchBar } from "@firecms/ui";

export default function SearchBarBasicDemo() {
    return (
        <SearchBar onTextSearch={(text) => console.log("Search:", text)} />
    );
}